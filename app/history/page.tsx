"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Star, TrendingUp, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Interview {
  id: string
  company: string
  role: string
  type: string
  difficulty: string
  status: string
  score: number
  questions_asked: number
  total_questions: number
  started_at: string
  completed_at: string
  feedback: string
}

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = JSON.parse(localStorage.getItem("kamikazUser") || "{}")
      if (!user.id) {
        throw new Error("User not found. Please log in again.")
      }

      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })

      if (error) throw error
      setInterviews(data || [])
    } catch (error) {
      console.error("Error fetching interviews:", error)
      setError(error instanceof Error ? error.message : "Failed to load interview history")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400"
      case "cancelled":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!endDate) return "Ongoing"
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
    return `${diffMinutes} min`
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading interview history...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-red-400">Error: {error}</div>
            <Button
              onClick={fetchInterviews}
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Try Again
            </Button>
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
            <h1 className="text-3xl font-bold text-white">Interview History</h1>
            <p className="text-slate-400 mt-2">Track your interview progress and performance</p>
          </div>
          <Button
            onClick={fetchInterviews}
            variant="outline"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Interviews</p>
                  <p className="text-2xl font-bold text-white">{interviews.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {interviews.filter((i) => i.status === "completed").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-white">
                    {interviews.length > 0
                      ? Math.round(interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.length)
                      : 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {
                      interviews.filter((i) => {
                        const interviewDate = new Date(i.started_at)
                        const now = new Date()
                        return (
                          interviewDate.getMonth() === now.getMonth() &&
                          interviewDate.getFullYear() === now.getFullYear()
                        )
                      }).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No interviews yet</h3>
                <p className="text-slate-400 mb-6">Start your first interview to see your history here</p>
                <Button
                  onClick={() => (window.location.href = "/interview")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-slate-700/30 rounded-lg p-6 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {interview.role} at {interview.company}
                          </h3>
                          <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {interview.type}
                          </Badge>
                          <Badge className={getDifficultyColor(interview.difficulty)}>{interview.difficulty}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Started:</span>
                            <p className="text-white">{formatDate(interview.started_at)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span>
                            <p className="text-white">
                              {calculateDuration(interview.started_at, interview.completed_at)}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Questions:</span>
                            <p className="text-white">
                              {interview.questions_asked}/{interview.total_questions}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Score:</span>
                            <p
                              className={`font-semibold ${
                                interview.score >= 80
                                  ? "text-green-400"
                                  : interview.score >= 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {interview.score || 0}/100
                            </p>
                          </div>
                        </div>

                        {interview.feedback && (
                          <div className="mt-3">
                            <span className="text-slate-400 text-sm">Feedback:</span>
                            <p className="text-slate-300 text-sm mt-1">{interview.feedback}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
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
