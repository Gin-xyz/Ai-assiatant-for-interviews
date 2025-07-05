"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Play, CheckCircle, XCircle, Brain } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { evaluateCode } from "@/lib/ai-services"

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  company: string
  tags: string[]
  time_complexity: string
  space_complexity: string
  starter_code: string
  test_cases: any
  solution: string
  explanation: string
}

export default function SolveProblemPage() {
  const params = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    fetchProblem()
  }, [params.id])

  const fetchProblem = async () => {
    try {
      const { data, error } = await supabase.from("practice_problems").select("*").eq("id", params.id).single()

      if (error) throw error
      setProblem(data)
      setCode(data.starter_code)
    } catch (error) {
      console.error("Error fetching problem:", error)
      router.push("/practice")
    } finally {
      setLoading(false)
    }
  }

  const handleRunCode = async () => {
    if (!problem) return

    setEvaluating(true)
    try {
      const result = await evaluateCode(code, problem, problem.test_cases.testCases)
      setEvaluation(result)

      // Save solution to database
      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
      if (user.id) {
        await supabase.from("user_solutions").upsert({
          user_id: user.id,
          problem_id: problem.id,
          code,
          status: result.passed ? "solved" : "attempted",
          score: result.score,
          feedback: result.feedback,
          execution_time: Math.floor(Math.random() * 1000), // Simulated execution time
        })
      }
    } catch (error) {
      console.error("Error evaluating code:", error)
    } finally {
      setEvaluating(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500 bg-green-500/10"
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "Hard":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-slate-500 bg-slate-500/10"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading problem...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Problem not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <header className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Problems
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">{problem.title}</h1>
            <p className="text-sm text-slate-400">
              {problem.company} • {problem.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Problem Description */}
        <div className="w-1/2 p-6 overflow-auto border-r border-slate-800">
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Problem Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">{problem.description}</p>

              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span key={index} className="bg-slate-600/50 text-slate-300 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Time Complexity:</span>
                  <span className="text-white ml-2">{problem.time_complexity}</span>
                </div>
                <div>
                  <span className="text-slate-400">Space Complexity:</span>
                  <span className="text-white ml-2">{problem.space_complexity}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problem.test_cases.testCases.map((testCase: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 p-4 rounded-lg">
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="text-slate-400">Input:</span>
                        <pre className="text-white mt-1 bg-slate-800/50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(testCase.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-400">Expected Output:</span>
                        <pre className="text-white mt-1 bg-slate-800/50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(testCase.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Solution (if shown) */}
          {showSolution && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Solution & Explanation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Explanation:</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{problem.explanation}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Solution Code:</h4>
                  <pre className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                    {problem.solution}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Code Editor */}
        <div className="w-1/2 p-6 flex flex-col">
          <Card className="bg-slate-800/50 border-slate-700 flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Code Editor</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleRunCode} disabled={evaluating} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    {evaluating ? "Running..." : "Run Code"}
                  </Button>
                  <Button
                    onClick={() => setShowSolution(!showSolution)}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {showSolution ? "Hide" : "Show"} Solution
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-slate-900/50 border-slate-600 text-white font-mono text-sm resize-none"
                placeholder="Write your solution here..."
              />
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {evaluation && (
            <Card className="bg-slate-800/50 border-slate-700 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {evaluation.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Evaluation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Score:</span>
                  <span
                    className={`font-bold ${evaluation.score >= 80 ? "text-green-500" : evaluation.score >= 60 ? "text-yellow-500" : "text-red-500"}`}
                  >
                    {evaluation.score}/100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge
                    className={evaluation.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                  >
                    {evaluation.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Feedback:</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{evaluation.feedback}</p>
                </div>

                {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Suggestions:</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {evaluation.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Time Complexity:</span>
                    <span className="text-white ml-2">{evaluation.timeComplexity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Space Complexity:</span>
                    <span className="text-white ml-2">{evaluation.spaceComplexity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
