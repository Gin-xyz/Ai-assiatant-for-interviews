"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { KamikazBot } from "@/components/kamikaz-bot"
import { BookOpen, Search, Filter, Code, Brain, Star, TrendingUp, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getAIRecommendations } from "@/lib/ai-services"

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  company: string
  acceptance_rate: number
  tags: string[]
  time_complexity: string
  space_complexity: string
  created_at: string
}

interface UserSolution {
  problem_id: string
  status: string
  score: number | null
}

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [userSolutions, setUserSolutions] = useState<UserSolution[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedCompany, setSelectedCompany] = useState("All")
  const [loading, setLoading] = useState(true)
  const [aiRecommendations, setAiRecommendations] = useState("")
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const router = useRouter()

  const categories = ["All", "Array", "String", "Tree", "Graph", "Dynamic Programming", "Stack", "Queue", "Linked List"]
  const difficulties = ["All", "Easy", "Medium", "Hard"]
  const companies = ["All", "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix"]

  useEffect(() => {
    fetchProblems()
    fetchUserSolutions()
  }, [])

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("practice_problems")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProblems(data || [])
    } catch (error) {
      console.error("Error fetching problems:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSolutions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
      if (!user.id) return

      const { data, error } = await supabase
        .from("user_solutions")
        .select("problem_id, status, score")
        .eq("user_id", user.id)

      if (error) throw error
      setUserSolutions(data || [])
    } catch (error) {
      console.error("Error fetching user solutions:", error)
    }
  }

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")

      // Get user stats
      const { data: interviews } = await supabase.from("interviews").select("*").eq("user_id", user.id)

      const { data: solutions } = await supabase.from("user_solutions").select("*").eq("user_id", user.id)

      const userStats = {
        interviewsCompleted: interviews?.length || 0,
        averageScore: interviews?.length
          ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / interviews.length)
          : 0,
        problemsSolved: solutions?.filter((s) => s.status === "solved").length || 0,
        weakAreas: ["System Design", "Behavioral Questions"],
        strongAreas: ["Algorithms", "Data Structures"],
        targetCompanies: ["Google", "Meta", "Amazon"],
      }

      const recommendations = await getAIRecommendations(userStats)
      setAiRecommendations(recommendations)
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setAiRecommendations("Unable to generate recommendations at this time.")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty
    const matchesCompany = selectedCompany === "All" || problem.company === selectedCompany

    return matchesSearch && matchesCategory && matchesDifficulty && matchesCompany
  })

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

  const getProblemStatus = (problemId: string) => {
    const solution = userSolutions.find((s) => s.problem_id === problemId)
    return solution?.status || "not_attempted"
  }

  const handleSolveProblem = (problemId: string) => {
    router.push(`/practice/solve/${problemId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading problems...</div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <div className="flex h-full flex-col w-full">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-4">
              <SidebarTrigger className="text-slate-300" />
              <h1 className="text-xl font-semibold text-white">Practice Problems</h1>
              <div className="flex items-center gap-2 ml-auto">
                <KamikazBot size="sm" />
                <span className="text-slate-300 text-sm">Ready to code</span>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6 space-y-6 w-full">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Problems Solved</p>
                        <p className="text-2xl font-bold text-white">
                          {userSolutions.filter((s) => s.status === "solved").length}
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Success Rate</p>
                        <p className="text-2xl font-bold text-white">
                          {userSolutions.length
                            ? Math.round(
                                (userSolutions.filter((s) => s.status === "solved").length / userSolutions.length) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Average Score</p>
                        <p className="text-2xl font-bold text-white">
                          {userSolutions.filter((s) => s.score).length
                            ? Math.round(
                                userSolutions.filter((s) => s.score).reduce((acc, curr) => acc + (curr.score || 0), 0) /
                                  userSolutions.filter((s) => s.score).length,
                              )
                            : 0}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Total Problems</p>
                        <p className="text-2xl font-bold text-white">{problems.length}</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Problems
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="Search problems..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-slate-400 mr-2">Category:</span>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={
                            selectedCategory === category
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "border-slate-600 text-slate-300 hover:bg-slate-700"
                          }
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-sm text-slate-400 mr-2">Difficulty:</span>
                      {difficulties.map((difficulty) => (
                        <Button
                          key={difficulty}
                          variant={selectedDifficulty === difficulty ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={
                            selectedDifficulty === difficulty
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "border-slate-600 text-slate-300 hover:bg-slate-700"
                          }
                        >
                          {difficulty}
                        </Button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-sm text-slate-400 mr-2">Company:</span>
                      {companies.map((company) => (
                        <Button
                          key={company}
                          variant={selectedCompany === company ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCompany(company)}
                          className={
                            selectedCompany === company
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "border-slate-600 text-slate-300 hover:bg-slate-700"
                          }
                        >
                          {company}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problems List */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Problems ({filteredProblems.length})
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Practice coding problems from top tech companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredProblems.map((problem) => {
                      const status = getProblemStatus(problem.id)
                      return (
                        <Card
                          key={problem.id}
                          className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  {status === "solved" ? (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  ) : status === "attempted" ? (
                                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">○</span>
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 border-2 border-slate-500 rounded-full"></div>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h3 className="font-semibold text-white mb-2">{problem.title}</h3>
                                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{problem.description}</p>

                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {problem.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="bg-slate-600/50 text-slate-300 px-2 py-1 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span>Time: {problem.time_complexity}</span>
                                    <span>Space: {problem.space_complexity}</span>
                                    <span>Acceptance: {problem.acceptance_rate}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {problem.company}
                                  </Badge>
                                </div>

                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                  onClick={() => handleSolveProblem(problem.id)}
                                >
                                  <Code className="w-4 h-4 mr-1" />
                                  {status === "solved" ? "Review" : "Solve"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {filteredProblems.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">No problems found</h3>
                      <p className="text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendation */}
              <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <KamikazBot size="lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Recommendations</h3>
                  <p className="text-slate-300 mb-6">
                    Get personalized recommendations based on your progress and performance
                  </p>

                  {aiRecommendations ? (
                    <div className="bg-slate-800/50 p-6 rounded-lg mb-6 text-left">
                      <h4 className="font-semibold text-white mb-3">Your Personalized Recommendations:</h4>
                      <div className="text-slate-300 whitespace-pre-line">{aiRecommendations}</div>
                    </div>
                  ) : null}

                  <div className="flex justify-center gap-4">
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleGetRecommendations}
                      disabled={loadingRecommendations}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {loadingRecommendations ? "Generating..." : "Get AI Recommendations"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
