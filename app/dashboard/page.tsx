"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, Award, Clock, BookOpen, Brain, Star, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getAIRecommendations } from "@/lib/ai-services"

interface DashboardStats {
  interviewsCompleted: number
  averageScore: number
  problemsSolved: number
  totalPracticeTime: number
  recentInterviews: any[]
  recentSolutions: any[]
  weakAreas: string[]
  strongAreas: string[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    interviewsCompleted: 0,
    averageScore: 0,
    problemsSolved: 0,
    totalPracticeTime: 0,
    recentInterviews: [],
    recentSolutions: [],
    weakAreas: [],
    strongAreas: [],
  })
  const [recommendations, setRecommendations] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
    setUserName(user.name || "User")
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
      if (!user.id) return

      // Fetch interviews
      const { data: interviews } = await supabase
        .from("interviews")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })

      // Fetch practice solutions
      const { data: solutions } = await supabase
        .from("user_solutions")
        .select(`
          *,
          practice_problems (
            title,
            category,
            difficulty
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // Calculate stats
      const completedInterviews = interviews?.filter((i) => i.status === "completed") || []
      const averageScore =
        completedInterviews.length > 0
          ? completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / completedInterviews.length
          : 0

      const solvedProblems = solutions?.filter((s) => s.status === "solved") || []

      // Analyze weak and strong areas
      const categoryStats: { [key: string]: { total: number; solved: number; avgScore: number } } = {}
      solutions?.forEach((solution) => {
        const category = solution.practice_problems?.category || "Unknown"
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, solved: 0, avgScore: 0 }
        }
        categoryStats[category].total++
        if (solution.status === "solved") {
          categoryStats[category].solved++
        }
        categoryStats[category].avgScore += solution.score || 0
      })

      const weakAreas = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.avgScore / stats.total < 60)
        .map(([category]) => category)
        .slice(0, 3)

      const strongAreas = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.avgScore / stats.total >= 80)
        .map(([category]) => category)
        .slice(0, 3)

      setStats({
        interviewsCompleted: completedInterviews.length,
        averageScore: Math.round(averageScore),
        problemsSolved: solvedProblems.length,
        totalPracticeTime: Math.floor(Math.random() * 100) + 50, // Simulated for now
        recentInterviews: interviews?.slice(0, 3) || [],
        recentSolutions: solutions?.slice(0, 5) || [],
        weakAreas,
        strongAreas,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      const userStats = {
        ...stats,
        targetCompanies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
      }
      const aiRecommendations = await getAIRecommendations(userStats)
      setRecommendations(aiRecommendations)
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setRecommendations("Unable to generate recommendations at this time. Please try again later.")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "hard":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-slate-500 bg-slate-500/10"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {userName}!</h1>
            <p className="text-slate-400 mt-2">Here's your interview preparation progress</p>
          </div>
          <Button
            onClick={handleGetRecommendations}
            disabled={loadingRecommendations}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {loadingRecommendations ? "Getting..." : "Get AI Recommendations"}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Interviews Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.interviewsCompleted}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold text-white">{stats.problemsSolved}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Practice Time</p>
                  <p className="text-2xl font-bold text-white">{stats.totalPracticeTime}h</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Interviews */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Recent Interviews
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/history")}
                  className="text-purple-400 hover:text-purple-300"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No interviews yet</p>
                  <Button
                    onClick={() => (window.location.href = "/interview")}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Start First Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentInterviews.map((interview, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">
                          {interview.role} at {interview.company}
                        </h4>
                        <Badge
                          className={
                            interview.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }
                        >
                          {interview.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{new Date(interview.started_at).toLocaleDateString()}</span>
                        <span className={`font-semibold ${getScoreColor(interview.score || 0)}`}>
                          {interview.score || 0}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Practice */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Recent Practice
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/practice")}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Practice More <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentSolutions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No practice problems solved yet</p>
                  <Button
                    onClick={() => (window.location.href = "/practice")}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Start Practicing
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSolutions.map((solution, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{solution.practice_problems?.title || "Problem"}</h4>
                        <Badge
                          className={
                            solution.status === "solved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {solution.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(solution.practice_problems?.difficulty)}>
                            {solution.practice_problems?.difficulty}
                          </Badge>
                          <span className="text-slate-400">{solution.practice_problems?.category}</span>
                        </div>
                        <span className={`font-semibold ${getScoreColor(solution.score || 0)}`}>
                          {solution.score || 0}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strong Areas */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-400" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.strongAreas.length === 0 ? (
                <p className="text-slate-400">Complete more practice problems to identify your strengths</p>
              ) : (
                <div className="space-y-2">
                  {stats.strongAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-500/10 rounded-lg p-3">
                      <span className="text-green-400 font-medium">{area}</span>
                      <Star className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-yellow-400" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.weakAreas.length === 0 ? (
                <p className="text-slate-400">Great job! No weak areas identified yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-3">
                      <span className="text-yellow-400 font-medium">{area}</span>
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        {recommendations && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{recommendations}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            onClick={() => (window.location.href = "/interview")}
            className="bg-purple-600 hover:bg-purple-700 h-16 text-lg"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Start New Interview
          </Button>
          <Button
            onClick={() => (window.location.href = "/practice")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 h-16 text-lg"
          >
            <BookOpen className="w-6 h-6 mr-3" />
            Practice Problems
          </Button>
          <Button
            onClick={() => (window.location.href = "/analytics")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 h-16 text-lg"
          >
            <TrendingUp className="w-6 h-6 mr-3" />
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  )
}
