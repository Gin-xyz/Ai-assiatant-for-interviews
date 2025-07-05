import { GoogleGenerativeAI } from "@google/generative-ai"
import type { SpeechRecognition } from "speech-recognition"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyAgK32ThjpPUNT_-RM5XiXFKPtgAT1vpZI")

export class GeminiVoiceService {
  private model: any
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isListening = false
  private isSpeaking = false
  private canBeInterrupted = true
  private onInterruptCallback: (() => void) | null = null
  private silenceTimer: NodeJS.Timeout | null = null
  private voiceActivityDetection = true

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    this.synthesis = window.speechSynthesis
    this.setupSpeechRecognition()
  }

  private setupSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported")
        return false
      }

      // Check if we already have permission
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          if (permission.state === 'granted') {
            return true
          }
          if (permission.state === 'denied') {
            console.error("Microphone permission was previously denied")
            return false
          }
        } catch (permError) {
          console.log("Permission query not supported, proceeding with getUserMedia")
        }
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error: any) {
      console.error("Microphone permission error:", error)

      // Handle specific error types
      if (error.name === 'NotFoundError' || error.name === 'DeviceNotFoundError') {
        console.error("No microphone device found")
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error("Microphone permission denied by user")
      } else if (error.name === 'NotSupportedError') {
        console.error("Microphone not supported")
      }

      return false
    }
  }

  setInterruptCallback(callback: () => void) {
    this.onInterruptCallback = callback
  }

  setCanBeInterrupted(canInterrupt: boolean) {
    this.canBeInterrupted = canInterrupt
  }

  enableVoiceActivityDetection(enabled: boolean) {
    this.voiceActivityDetection = enabled
  }

  async generateResponse(prompt: string, context = ""): Promise<string> {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating response:", error)
      return "I apologize, but I'm having trouble processing your response right now. Could you please repeat that?"
    }
  }

  async generateConversationalResponse(prompt: string, context: any): Promise<string> {
    try {
      // Check if user is asking for help
      if (this.isHelpRequest(prompt)) {
        return this.generateHelpResponse(prompt, context)
      }

      const conversationalPrompt = `
        You are a friendly, experienced technical interviewer having a natural conversation.

        Context: ${JSON.stringify(context, null, 2)}
        User said: "${prompt}"

        IMPORTANT: Your response will be read aloud by text-to-speech, so:
        - DO NOT use markdown formatting (**, *, #, etc.)
        - DO NOT use special characters or symbols
        - Write in plain, spoken English only
        - Use natural speech patterns
        - Keep technical terms simple and pronounceable

        Respond naturally as a human interviewer would:
        - Use conversational language, not formal/robotic speech
        - Show genuine interest and engagement
        - Ask follow-up questions naturally
        - Give encouraging feedback
        - Use "I", "you", "we" pronouns
        - Keep responses concise (1-3 sentences max)
        - Sound like you're having a real conversation

        If the user gave a good answer, acknowledge it and either ask a follow-up or move to the next topic naturally.
        If the answer needs improvement, guide them gently with hints.
      `

      const result = await this.model.generateContent(conversationalPrompt)
      const response = await result.response
      const cleanResponse = this.cleanTextForSpeech(response.text())
      return cleanResponse
    } catch (error) {
      console.error("Error generating conversational response:", error)
      return "That's interesting! Can you tell me a bit more about that approach?"
    }
  }

  private isHelpRequest(prompt: string): boolean {
    const helpKeywords = [
      'help', 'hint', 'explain', 'clarify', 'confused', 'understand',
      'what do you mean', 'can you help', 'i need help', 'stuck',
      'don\'t know', 'not sure', 'can you give me', 'guide me'
    ]

    const lowerPrompt = prompt.toLowerCase()
    return helpKeywords.some(keyword => lowerPrompt.includes(keyword))
  }

  private async generateHelpResponse(prompt: string, context: any): Promise<string> {
    const helpPrompt = `
      The user is asking for help during an interview. Be supportive and provide guidance.

      Context: ${JSON.stringify(context, null, 2)}
      User's help request: "${prompt}"

      IMPORTANT: Your response will be read aloud by text-to-speech, so:
      - DO NOT use markdown formatting (**, *, #, etc.)
      - DO NOT use special characters or symbols
      - Write in plain, spoken English only
      - Use natural speech patterns

      Provide helpful guidance:
      - Give a hint or direction without giving away the full answer
      - Be encouraging and supportive
      - Ask a leading question to guide their thinking
      - Keep it conversational and friendly
      - Make them feel comfortable asking for help
    `

    try {
      const result = await this.model.generateContent(helpPrompt)
      const response = await result.response
      return this.cleanTextForSpeech(response.text())
    } catch (error) {
      return "Of course! Let me help you think through this. What part would you like me to clarify?"
    }
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/#{1,6}\s*(.*?)$/gm, '$1') // Remove # headers
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove `code`
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove [links](url)

      // Remove special characters that sound weird when spoken
      .replace(/[_~`]/g, '') // Remove underscores, tildes, backticks
      .replace(/\n\s*\n/g, '. ') // Replace double newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space

      // Fix common speech issues
      .replace(/e\.g\./g, 'for example')
      .replace(/i\.e\./g, 'that is')
      .replace(/etc\./g, 'and so on')
      .replace(/vs\./g, 'versus')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bURL\b/g, 'U R L')
      .replace(/\bHTTP\b/g, 'H T T P')
      .replace(/\bJSON\b/g, 'J S O N')
      .replace(/\bSQL\b/g, 'S Q L')

      // Clean up punctuation for better speech flow
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentence endings
      .replace(/:\s*/g, ': ') // Ensure space after colons
      .replace(/;\s*/g, '; ') // Ensure space after semicolons

      .trim()
  }

  async speak(text: string, canBeInterrupted: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any ongoing speech
        this.stopSpeaking()

        this.currentUtterance = new SpeechSynthesisUtterance(text)
        this.currentUtterance.rate = 0.9
        this.currentUtterance.pitch = 1
        this.currentUtterance.volume = 1
        this.canBeInterrupted = canBeInterrupted

        // Set a more generous timeout based on text length
        const timeoutDuration = Math.max(text.length * 100, 10000) // At least 10 seconds

        const timeout = setTimeout(() => {
          console.log("Speech timeout reached")
          this.stopSpeaking()
          resolve()
        }, timeoutDuration)

        this.currentUtterance.onstart = () => {
          this.isSpeaking = true
          console.log("Speech started")
        }

        this.currentUtterance.onend = () => {
          console.log("Speech ended normally")
          clearTimeout(timeout)
          this.isSpeaking = false
          this.currentUtterance = null
          resolve()
        }

        this.currentUtterance.onerror = (event) => {
          console.log("Speech error:", event.error)
          clearTimeout(timeout)
          this.isSpeaking = false
          this.currentUtterance = null

          // Don't treat "interrupted" as an error - it's normal when stopping speech
          if (event.error === "interrupted" || event.error === "canceled") {
            resolve()
          } else {
            reject(new Error(`Speech synthesis error: ${event.error}`))
          }
        }

        // Ensure synthesis is ready
        if (this.synthesis.paused) {
          this.synthesis.resume()
        }

        this.synthesis.speak(this.currentUtterance)
      } catch (error) {
        console.error("Error in speak method:", error)
        this.isSpeaking = false
        this.currentUtterance = null
        reject(error)
      }
    })
  }

  interruptSpeech(): boolean {
    if (this.isSpeaking && this.canBeInterrupted) {
      this.stopSpeaking()
      if (this.onInterruptCallback) {
        this.onInterruptCallback()
      }
      return true
    }
    return false
  }

  stopSpeaking(): void {
    if (this.isSpeaking && this.currentUtterance) {
      this.synthesis.cancel()
      this.isSpeaking = false
      this.currentUtterance = null
    }
  }

  async startListening(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari."))
        return
      }

      if (this.isListening) {
        reject(new Error("Already listening"))
        return
      }

      // Stop any ongoing speech before listening
      this.stopSpeaking()

      // Wait a bit for speech to fully stop
      setTimeout(() => {
        this.isListening = true
        let finalTranscript = ""
        let interimTranscript = ""

        this.recognition!.onresult = (event) => {
          let interim = ""
          let final = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript
            } else {
              interim += transcript
            }
          }

          finalTranscript += final
          interimTranscript = interim

          // Reset silence timer on speech
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
          }

          // If we have final results and voice activity detection is enabled
          if (final && this.voiceActivityDetection) {
            // Set a timer to detect end of speech
            this.silenceTimer = setTimeout(() => {
              if (finalTranscript.trim()) {
                console.log("Speech recognized:", finalTranscript)
                this.isListening = false
                this.recognition!.stop()
                resolve(finalTranscript)
              }
            }, 1500) // Wait 1.5 seconds of silence
          }
        }

        this.recognition!.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          this.isListening = false
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
          }

          let errorMessage = "Speech recognition error occurred"
          if (event.error === "not-allowed") {
            errorMessage = "Microphone access denied. Please click the microphone icon in your browser's address bar and allow access, then try again."
          } else if (event.error === "no-speech") {
            errorMessage = "No speech detected. Please speak clearly and try again."
          } else if (event.error === "network") {
            errorMessage = "Network error. Please check your internet connection and try again."
          } else if (event.error === "service-not-allowed") {
            errorMessage = "Speech recognition service not allowed. Please check your browser settings."
          } else if (event.error === "bad-grammar") {
            errorMessage = "Speech recognition grammar error. Please try speaking again."
          }

          reject(new Error(errorMessage))
        }

        this.recognition!.onend = () => {
          this.isListening = false
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
          }
          // If we have a transcript, resolve with it
          if (finalTranscript.trim()) {
            resolve(finalTranscript)
          }
        }

        try {
          this.recognition!.start()
        } catch (error: any) {
          this.isListening = false
          console.error("Error starting speech recognition:", error)
          reject(new Error("Failed to start speech recognition. Please ensure your microphone is connected and try again."))
        }
      }, 500) // Wait 500ms for speech to stop
    })
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  cleanup(): void {
    this.stopSpeaking()
    this.stopListening()
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
    }
  }

  // Utility methods for better conversation flow
  async startConversationalListening(onPartialTranscript?: (text: string) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari."))
        return
      }

      if (this.isListening) {
        this.stopListening()
      }

      this.stopSpeaking()

      setTimeout(() => {
        this.isListening = true
        let finalTranscript = ""

        this.recognition!.onresult = (event) => {
          let interim = ""
          let final = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript
            } else {
              interim += transcript
            }
          }

          finalTranscript += final

          // Call partial transcript callback for real-time feedback
          if (onPartialTranscript && (final || interim)) {
            onPartialTranscript(finalTranscript + interim)
          }

          if (final) {
            if (this.silenceTimer) {
              clearTimeout(this.silenceTimer)
            }

            this.silenceTimer = setTimeout(() => {
              if (finalTranscript.trim()) {
                this.isListening = false
                this.recognition!.stop()
                resolve(finalTranscript.trim())
              }
            }, 2000) // 2 seconds of silence to end
          }
        }

        this.recognition!.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          this.isListening = false
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
          }

          let errorMessage = "Speech recognition error occurred"
          if (event.error === "not-allowed") {
            errorMessage = "Microphone access denied. Please click the microphone icon in your browser's address bar and allow access, then try again."
          } else if (event.error === "no-speech") {
            errorMessage = "No speech detected. Please speak clearly and try again."
          } else if (event.error === "network") {
            errorMessage = "Network error. Please check your internet connection and try again."
          } else if (event.error === "service-not-allowed") {
            errorMessage = "Speech recognition service not allowed. Please check your browser settings."
          }

          reject(new Error(errorMessage))
        }

        this.recognition!.onend = () => {
          this.isListening = false
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
          }
          if (finalTranscript.trim()) {
            resolve(finalTranscript.trim())
          }
        }

        try {
          this.recognition!.start()
        } catch (error: any) {
          this.isListening = false
          console.error("Error starting conversational listening:", error)
          reject(new Error("Failed to start speech recognition. Please ensure your microphone is connected and try again."))
        }
      }, 300)
    })
  }
}
