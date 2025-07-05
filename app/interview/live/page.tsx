"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, HelpCircle, MessageCircle } from "lucide-react"
import { AnimatedAIOrb } from "@/components/animated-ai-orb"
import { GeminiVoiceService } from "@/lib/gemini-voice"
import { generateInterviewQuestion } from "@/lib/ai-services"
import { supabase } from "@/lib/supabase"

export default function LiveInterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [partialTranscript, setPartialTranscript] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewData, setInterviewData] = useState<any>(null)
  const [interviewRecord, setInterviewRecord] = useState<any>(null)
  const [userName, setUserName] = useState("")
  const [askedQuestions, setAskedQuestions] = useState<string[]>([])
  const [showHelpButton, setShowHelpButton] = useState(true)
  const [conversationHistory, setConversationHistory] = useState<Array<{speaker: string, message: string, timestamp: Date}>>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  const voiceServiceRef = useRef<GeminiVoiceService | null>(null)
  const maxQuestions = 5

  // Get interview configuration from URL params
  const company = searchParams.get("company") || "Tech Company"
  const role = searchParams.get("role") || "Software Engineer"
  const type = searchParams.get("type") || "technical"
  const difficulty = searchParams.get("difficulty") || "medium"

  useEffect(() => {
    // Get user data
    const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
    setUserName(user.name || "Candidate")

    setInterviewData({
      company,
      role,
      type,
      difficulty,
      userId: user.id,
    })

    // Initialize voice service with enhanced features
    voiceServiceRef.current = new GeminiVoiceService()
    voiceServiceRef.current.enableVoiceActivityDetection(true)
    voiceServiceRef.current.setInterruptCallback(() => {
      console.log("AI speech was interrupted by user")
      setIsSpeaking(false)
    })

    // Check initial microphone permission status
    checkMicrophonePermission()

    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.cleanup()
      }
    }
  }, [company, role, type, difficulty])

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicrophonePermission(permission.state as 'granted' | 'denied')

        // Listen for permission changes
        permission.onchange = () => {
          setMicrophonePermission(permission.state as 'granted' | 'denied')
        }
      }
    } catch (error) {
      console.log("Permission query not supported")
      setMicrophonePermission('unknown')
    }
  }

  const createInterviewRecord = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
      if (!user.id) {
        console.error("No user ID found")
        return
      }

      const { data, error } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          company,
          role,
          type,
          score: 0,
          duration: 0,
          status: "in_progress",
          questions_count: 0,
          topics: [type],
          feedback: "Interview in progress"
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      setInterviewRecord(data)
      return data
    } catch (error) {
      console.error("Error creating interview record:", error)
      // Continue without database record for now
      return null
    }
  }

  const updateInterviewRecord = async (updates: any) => {
    if (!interviewRecord) return

    try {
      const { error } = await supabase.from("interviews").update(updates).eq("id", interviewRecord.id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating interview record:", error)
    }
  }

  const startInterview = async () => {
    if (!voiceServiceRef.current) return

    setIsConnected(true)
    setIsSpeaking(true)

    // Create interview record
    await createInterviewRecord()

    try {
      // Personalized welcome message
      const welcomeMessage = `Hello ${userName}! Welcome to your ${type} interview for the ${role} position at ${company}. 

I'm your AI interviewer, and I'm excited to get to know you better today. This will be a ${difficulty} level interview where I'll ask you ${maxQuestions} questions to assess your skills and experience.

Here's how this will work: I'll ask you a question, then you can take your time to think and respond. Feel free to ask for clarification if needed. I'll be evaluating your technical knowledge, problem-solving approach, and communication skills.

Are you ready to begin? Let's start with our first question.`

      await voiceServiceRef.current.speak(welcomeMessage)

      // Generate and ask first question
      await askNextQuestion()
    } catch (error) {
      console.error("Error starting interview:", error)
      setIsSpeaking(false)
    }
  }

  const askNextQuestion = async () => {
    if (!voiceServiceRef.current || questionCount >= maxQuestions) {
      await endInterview()
      return
    }

    try {
      setIsSpeaking(true)

      // Generate question using AI
      const question = await generateInterviewQuestion(type, difficulty, askedQuestions)
      setCurrentQuestion(question)
      setAskedQuestions((prev) => [...prev, question])

      // Add question to conversation history
      setConversationHistory(prev => [...prev, {
        speaker: 'ai',
        message: question,
        timestamp: new Date()
      }])

      // Ask the question conversationally
      await voiceServiceRef.current.speak(question, true) // Can be interrupted
      setIsSpeaking(false)

      // Update question count
      const newCount = questionCount + 1
      setQuestionCount(newCount)

      // Update interview record
      await updateInterviewRecord({
        questions_asked: newCount,
        current_question: question,
      })

      // Start conversational listening for natural flow
      setTimeout(() => {
        startConversationalListening()
      }, 1000)
    } catch (error) {
      console.error("Error asking question:", error)
      setIsSpeaking(false)
    }
  }

  const startListening = async () => {
    if (!voiceServiceRef.current || isListening) return

    try {
      setIsListening(true)
      const response = await voiceServiceRef.current.startListening()
      setTranscript(response)
      setIsListening(false)

      // Process the response and ask follow-up or next question
      await processResponse(response)
    } catch (error) {
      console.error("Error listening:", error)
      setIsListening(false)
    }
  }

  const startConversationalListening = async () => {
    if (!voiceServiceRef.current || isListening) return

    try {
      setIsListening(true)
      setIsWaitingForResponse(true)
      setPartialTranscript("")
      setShowError(false)

      const response = await voiceServiceRef.current.startConversationalListening((partial) => {
        setPartialTranscript(partial)
      })

      setTranscript(response)
      setPartialTranscript("")
      setIsListening(false)

      if (response.trim()) {
        await processResponse(response)
      }
    } catch (error) {
      console.error("Error in conversational listening:", error)
      setIsListening(false)
      setIsWaitingForResponse(false)

      // Show user-friendly error message
      const errorMsg = error instanceof Error ? error.message : "An error occurred with speech recognition"
      setErrorMessage(errorMsg)
      setShowError(true)

      // Hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000)
    }
  }

  const handleRequestMicrophonePermission = async () => {
    if (!voiceServiceRef.current) return

    setIsRequestingPermission(true)
    setShowError(false)

    try {
      const hasPermission = await voiceServiceRef.current.requestMicrophonePermission()
      if (hasPermission) {
        setMicrophonePermission('granted')
        setErrorMessage("")
        setShowError(false)
      } else {
        setMicrophonePermission('denied')
        setErrorMessage("Microphone permission was denied. Please click the microphone icon in your browser's address bar to allow access.")
        setShowError(true)
      }
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
      setMicrophonePermission('denied')
      setErrorMessage("Failed to request microphone permission. Please check your browser settings.")
      setShowError(true)
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const handleAskForHelp = async () => {
    if (!voiceServiceRef.current) return

    try {
      setIsSpeaking(true)

      const helpContext = {
        company,
        role,
        type,
        difficulty,
        currentQuestion,
        questionCount,
        conversationHistory,
        userName
      }

      const helpResponse = await voiceServiceRef.current.generateConversationalResponse(
        "I need help with this question",
        helpContext
      )

      // Add help request to conversation history
      setConversationHistory(prev => [...prev,
        {
          speaker: 'user',
          message: 'Asked for help',
          timestamp: new Date()
        },
        {
          speaker: 'ai',
          message: helpResponse,
          timestamp: new Date()
        }
      ])

      await voiceServiceRef.current.speak(helpResponse, true)
      setIsSpeaking(false)

      // Continue listening after help
      setTimeout(() => {
        startConversationalListening()
      }, 1000)
    } catch (error) {
      console.error("Error providing help:", error)
      setIsSpeaking(false)
    }
  }

  const processResponse = async (response: string) => {
    if (!voiceServiceRef.current) return

    try {
      setIsSpeaking(true)
      setIsWaitingForResponse(false)

      // Add user response to conversation history
      setConversationHistory(prev => [...prev, {
        speaker: 'user',
        message: response,
        timestamp: new Date()
      }])

      // Generate conversational AI response
      const context = {
        company,
        role,
        type,
        difficulty,
        currentQuestion,
        questionCount,
        maxQuestions,
        conversationHistory,
        userName
      }

      const aiResponse = await voiceServiceRef.current.generateConversationalResponse(response, context)

      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, {
        speaker: 'ai',
        message: aiResponse,
        timestamp: new Date()
      }])

      await voiceServiceRef.current.speak(aiResponse, true) // Can be interrupted
      setIsSpeaking(false)

      // Save response to database
      await supabase.from("interview_responses").insert({
        interview_id: interviewRecord?.id,
        question: currentQuestion,
        response: response,
        ai_feedback: aiResponse,
        question_number: questionCount,
      })

      // Start listening again for natural conversation flow
      setTimeout(() => {
        startConversationalListening()
      }, 1000)
    } catch (error) {
      console.error("Error processing response:", error)
      setIsSpeaking(false)
    }
  }

  const endInterview = async (isEarlyEnd = false) => {
    if (!voiceServiceRef.current) return

    try {
      setIsSpeaking(true)

      // Personalized goodbye message
      let goodbyeMessage = ""
      if (isEarlyEnd) {
        goodbyeMessage = `Thank you for your time today, ${userName}. I understand you need to end the interview early. 

Based on what we covered, you showed good potential and I appreciate your thoughtful responses. Remember, every interview is a learning experience, and you're on the right path.

Keep practicing and preparing - I believe you have what it takes to succeed at ${company} or any other company you're interested in. Best of luck with your job search, and thank you for using Kamikaz Interview AI!`
      } else {
        goodbyeMessage = `Excellent work, ${userName}! We've completed all ${maxQuestions} questions for your ${role} interview at ${company}.

You demonstrated strong technical knowledge and communication skills throughout our conversation. I was particularly impressed with your problem-solving approach and how you explained your thought process.

This interview experience should help you feel more confident for your actual interviews. Remember to keep practicing, stay curious, and trust in your abilities.

Thank you for using Kamikaz Interview AI, and best of luck with your interview at ${company}! I'm confident you'll do great.`
      }

      await voiceServiceRef.current.speak(goodbyeMessage)

      // Calculate final score (simplified scoring)
      const completionRate = (questionCount / maxQuestions) * 100
      const finalScore = Math.min(completionRate + Math.random() * 20, 100)

      // Update final interview record
      await updateInterviewRecord({
        status: "completed",
        score: Math.round(finalScore),
        completed_at: new Date().toISOString(),
        feedback: isEarlyEnd ? "Interview ended early" : "Interview completed successfully",
      })

      setIsSpeaking(false)

      // Redirect to results or dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Error ending interview:", error)
      setIsSpeaking(false)
      router.push("/dashboard")
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (voiceServiceRef.current) {
      if (!isMuted) {
        voiceServiceRef.current.stopSpeaking()
      }
    }
  }

  const stopListening = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening()
      setIsListening(false)
    }
  }

  const handleEndCall = async () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.cleanup()
    }
    await endInterview(true)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700 backdrop-blur-xl">
        <CardContent className="p-8">
          {/* Interview Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Live Interview</h1>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                {company}
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-300">
                {role}
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-300">
                {type}
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-300">
                {difficulty}
              </Badge>
            </div>
            <div className="text-slate-400">
              Question {questionCount} of {maxQuestions}
            </div>
          </div>

          {/* AI Orb */}
          <div className="flex justify-center mb-8">
            <AnimatedAIOrb isListening={isListening} isSpeaking={isSpeaking} isConnected={isConnected} size={200} />
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {!isConnected && <p className="text-slate-300 mb-4">Ready to start your interview with {userName}?</p>}

            {/* Error Message */}
            {showError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
                <p className="text-sm">{errorMessage}</p>
                <div className="text-xs mt-2 opacity-75">
                  {errorMessage.includes("Microphone") && (
                    <div className="space-y-1">
                      <p>💡 To fix this:</p>
                      <p>1. Click the microphone icon in your browser's address bar</p>
                      <p>2. Select "Allow" for microphone access</p>
                      <p>3. Refresh the page and try again</p>
                    </div>
                  )}
                  {errorMessage.includes("not supported") && (
                    <p>💡 Please use Chrome, Edge, or Safari for voice features</p>
                  )}
                </div>
                {errorMessage.includes("Microphone") && (
                  <Button
                    onClick={handleRequestMicrophonePermission}
                    disabled={isRequestingPermission}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs"
                  >
                    {isRequestingPermission ? "Requesting..." : "Try Again"}
                  </Button>
                )}
              </div>
            )}

            {isConnected && (
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {isSpeaking && "AI is speaking... (you can interrupt anytime)"}
                  {isListening && "Listening for your response..."}
                  {isWaitingForResponse && "Waiting for your response..."}
                  {!isSpeaking && !isListening && !isWaitingForResponse && "Ready for conversation"}
                </p>

                {/* Real-time transcript display */}
                {(partialTranscript || transcript) && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    {partialTranscript && (
                      <p className="text-slate-400 text-sm italic">You're saying: "{partialTranscript}"</p>
                    )}
                    {transcript && (
                      <p className="text-slate-300 text-sm">You said: "{transcript}"</p>
                    )}
                  </div>
                )}

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <div className="max-h-40 overflow-y-auto bg-slate-800/30 p-3 rounded-lg text-left">
                    <h4 className="text-white text-sm font-medium mb-2">Recent Conversation:</h4>
                    {conversationHistory.slice(-4).map((entry, index) => (
                      <div key={index} className="mb-2 text-xs">
                        <span className={`font-medium ${entry.speaker === 'ai' ? 'text-purple-300' : 'text-blue-300'}`}>
                          {entry.speaker === 'ai' ? 'Interviewer' : 'You'}:
                        </span>
                        <span className="text-slate-300 ml-2">{entry.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Microphone Permission Status */}
          {!isConnected && microphonePermission !== 'granted' && (
            <div className="text-center mb-4">
              <div className="bg-blue-900/50 border border-blue-500 text-blue-200 p-4 rounded-lg mb-4">
                <p className="text-sm mb-3">🎤 This interview requires microphone access for voice interaction.</p>
                <Button
                  onClick={handleRequestMicrophonePermission}
                  disabled={isRequestingPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                >
                  {isRequestingPermission ? "Requesting..." : "Allow Microphone Access"}
                </Button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-3">
            {!isConnected ? (
              <Button
                onClick={startInterview}
                disabled={microphonePermission === 'denied'}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
            ) : (
              <>
                {/* Main conversation controls */}
                <div className="flex gap-3">
                  <Button
                    onClick={isListening ? stopListening : startConversationalListening}
                    disabled={isSpeaking}
                    className={`${
                      isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white px-6 py-3 rounded-full transition-all`}
                    title={isListening ? "Stop listening" : "Start talking"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={toggleMute}
                    className={`${
                      isMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-600 hover:bg-slate-700"
                    } text-white px-6 py-3 rounded-full`}
                    title={isMuted ? "Unmute AI" : "Mute AI"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={handleEndCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full"
                    title="End interview"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>

                {/* Help and interaction controls */}
                <div className="flex gap-3 w-full justify-center mt-2">
                  <Button
                    onClick={handleAskForHelp}
                    disabled={isSpeaking}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full text-sm"
                    title="Ask for help with current question"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Ask for Help
                  </Button>

                  {isSpeaking && (
                    <Button
                      onClick={() => voiceServiceRef.current?.interruptSpeech()}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm"
                      title="Interrupt AI to speak"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Interrupt
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Current Question Display */}
          {currentQuestion && isConnected && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <h3 className="text-white font-medium mb-2">Current Question:</h3>
              <p className="text-slate-300 text-sm">{currentQuestion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
