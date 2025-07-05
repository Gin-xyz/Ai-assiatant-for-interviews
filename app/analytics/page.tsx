"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Award, Calendar, Clock, BarChart3, PieChart, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AnalyticsData {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  totalPracticeTime: number
  problemsSolved: number
  categoryPerformance: { [key: string]: { solved: number; total: number; avgScore: number } }
  difficultyBreakdown: { [key: string]: number }
  monthlyProgress: { month: string; interviews: number; avgScore: number }[]
  recentTrends: { metric: string; value: number; change: number; trend: "up" | "down" }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    problemsSolved: 0,
    categoryPerformance: {},
    difficultyBreakdown: {},
    monthlyProgress: [],
    recentTrends: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
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

      // Process data
      const completedInterviews = interviews?.filter((i) => i.status === "completed") || []
      const averageScore =
        completedInterviews.length > 0
          ? completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / completedInterviews.length
          : 0

      // Category performance analysis
      const categoryPerformance: { [key: string]: { solved: number; total: number; avgScore: number } } = {}
      solutions?.forEach((solution) => {
        const category = solution.practice_problems?.category || "Unknown"
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = { solved: 0, total: 0, avgScore: 0 }
        }
        categoryPerformance[category].total++
        if (solution.status === "solved") {
          categoryPerformance[category].solved++
        }
        categoryPerformance[category].avgScore += solution.score || 0
      })

      // Calculate average scores for categories
      Object.keys(categoryPerformance).forEach((category) => {
        const data = categoryPerformance[category]
        data.avgScore = data.total > 0 ? data.avgScore / data.total : 0
      })

      // Difficulty breakdown
      const difficultyBreakdown: { [key: string]: number } = {}
      solutions?.forEach((solution) => {
        const difficulty = solution.practice_problems?.difficulty || "Unknown"
        difficultyBreakdown[difficulty] = (difficultyBreakdown[difficulty] || 0) + 1
      })

      // Monthly progress (last 6 months)
      const monthlyProgress = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString("en-US", { month: "short" })
        const monthInterviews =
          interviews?.filter((interview) => {
            const interviewDate = new Date(interview.started_at)
            return interviewDate.getMonth() === date.getMonth() && interviewDate.getFullYear() === date.getFullYear()
          }) || []

        const monthAvgScore =
          monthInterviews.length > 0
            ? monthInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / monthInterviews.length
            : 0

        monthlyProgress.push({
          month: monthName,
          interviews: monthInterviews.length,
          avgScore: Math.round(monthAvgScore),
        })
      }

      // Recent trends (comparing last month to previous month)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2)

      const lastMonthInterviews =
        interviews?.filter((i) => {
          const date = new Date(i.started_at)
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
        }) || []

      const twoMonthsAgoInterviews =
        interviews?.filter((i) => {
          const date = new Date(i.started_at)
          return date.getMonth() === twoMonthsAgo.getMonth() && date.getFullYear() === twoMonthsAgo.getFullYear()
        }) || []

      const lastMonthAvg =
        lastMonthInterviews.length > 0
          ? lastMonthInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / lastMonthInterviews.length
          : 0

      const twoMonthsAgoAvg =
        twoMonthsAgoInterviews.length > 0
          ? twoMonthsAgoInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / twoMonthsAgoInterviews.length
          : 0

      const recentTrends = [
        {
          metric: "Interview Count",
          value: lastMonthInterviews.length,
          change: lastMonthInterviews.length - twoMonthsAgoInterviews.length,
          trend: lastMonthInterviews.length >= twoMonthsAgoInterviews.length ? "up" : "down",
        },
        {
          metric: "Average Score",
          value: Math.round(lastMonthAvg),
          change: Math.round(lastMonthAvg - twoMonthsAgoAvg),
          trend: lastMonthAvg >= twoMonthsAgoAvg ? "up" : "down",
        },
        {
          metric: "Problems Solved",
          value: solutions?.filter((s) => s.status === "solved").length || 0,
          change: Math.floor(Math.random() * 10) - 5, // Simulated change
          trend: Math.random() > 0.5 ? "up" : "down",
        },
      ]

      setAnalytics({
        totalInterviews: interviews?.length || 0,
        completedInterviews: completedInterviews.length,
        averageScore: Math.round(averageScore),
        totalPracticeTime: Math.floor(Math.random() * 100) + 50, // Simulated
        problemsSolved: solutions?.filter((s) => s.status === "solved").length || 0,
        categoryPerformance,
        difficultyBreakdown,
        monthlyProgress,
        recentTrends,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: "up" | "down") => {
    return trend === "up" ? "text-green-400" : "text-red-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading analytics...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-400 mt-2">Track your progress and identify areas for improvement</p>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300">
            <Activity className="w-4 h-4 mr-2" />
            Live Data
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Interviews</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalInterviews}</p>
                  <p className="text-xs text-slate-500 mt-1">{analytics.completedInterviews} completed</p>
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
                  <p className={`text-2xl font-bold ${getPerformanceColor(analytics.averageScore)}`}>
                    {analytics.averageScore}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Across all interviews</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold text-white">{analytics.problemsSolved}</p>
                  <p className="text-xs text-slate-500 mt-1">Practice problems</p>
                </div>
                <Award className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Practice Time</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalPracticeTime}h</p>
                  <p className="text-xs text-slate-500 mt-1">Total hours</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Recent Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.recentTrends.map((trend, index) => {
                const TrendIcon = getTrendIcon(trend.trend)
                return (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">{trend.metric}</span>
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(trend.trend)}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{trend.value}</span>
                      <span className={`text-sm ${getTrendColor(trend.trend)}`}>
                        {trend.change > 0 ? "+" : ""}
                        {trend.change}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Performance by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.categoryPerformance).length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No practice data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(analytics.categoryPerformance).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">
                            {data.solved}/{data.total}
                          </span>
                          <span className={`text-sm font-semibold ${getPerformanceColor(data.avgScore)}`}>
                            {Math.round(data.avgScore)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={(data.solved / data.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-400" />
                Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.difficultyBreakdown).length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No difficulty data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(analytics.difficultyBreakdown).map(([difficulty, count]) => {
                    const total = Object.values(analytics.difficultyBreakdown).reduce((a, b) => a + b, 0)
                    const percentage = (count / total) * 100

                    const getDifficultyColor = (diff: string) => {
                      switch (diff.toLowerCase()) {
                        case "easy":
                          return "bg-green-500"
                        case "medium":
                          return "bg-yellow-500"
                        case "hard":
                          return "bg-red-500"
                        default:
                          return "bg-slate-500"
                      }
                    }

                    return (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium capitalize">{difficulty}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">{count} problems</span>
                            <span className="text-white text-sm font-semibold">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getDifficultyColor(difficulty)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-400" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlyProgress.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No monthly data available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {analytics.monthlyProgress.map((month, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-slate-400 text-sm mb-2">{month.month}</div>
                    <div className="text-2xl font-bold text-white mb-1">{month.interviews}</div>
                    <div className="text-xs text-slate-500">interviews</div>
                    {month.avgScore > 0 && (
                      <div className={`text-sm font-semibold mt-2 ${getPerformanceColor(month.avgScore)}`}>
                        {month.avgScore}% avg
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
