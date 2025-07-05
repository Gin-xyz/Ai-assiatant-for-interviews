"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { KamikazBot } from "@/components/kamikaz-bot"
import { User, Settings, Target, Award, Edit, Save, X, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface UserData {
  id: string
  name: string
  interests: string
  pin: string
  created_at: string
}

interface Achievement {
  title: string
  description: string
  earned: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedInterests, setEditedInterests] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [interviews, setInterviews] = useState<any[]>([])
  const [userSolutions, setUserSolutions] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem("kamikazUser")
      if (!userData) {
        router.push("/")
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditedName(parsedUser.name)
      setEditedInterests(parsedUser.interests)

      // Fetch user's interviews and solutions for stats
      const [interviewsResult, solutionsResult] = await Promise.all([
        supabase.from("interviews").select("*").eq("user_id", parsedUser.id),
        supabase.from("user_solutions").select("*").eq("user_id", parsedUser.id),
      ])

      setInterviews(interviewsResult.data || [])
      setUserSolutions(solutionsResult.data || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          name: editedName,
          interests: editedInterests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      const updatedUser = { ...user, name: editedName, interests: editedInterests }
      localStorage.setItem("kamikazUser", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditedName(user.name)
      setEditedInterests(user.interests)
      setIsEditing(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  const achievements: Achievement[] = [
    {
      title: "First Interview",
      description: "Completed your first AI interview",
      earned: interviews.length > 0,
    },
    {
      title: "Problem Solver",
      description: "Solved 10+ coding problems",
      earned: userSolutions.filter((s) => s.status === "solved").length >= 10,
    },
    {
      title: "Consistent Learner",
      description: "7-day practice streak",
      earned: userSolutions.length >= 7,
    },
    {
      title: "High Performer",
      description: "Scored 90%+ in an interview",
      earned: interviews.some((i) => i.score >= 90),
    },
    {
      title: "FAANG Ready",
      description: "Achieved 85%+ average score",
      earned: interviews.length > 0 && interviews.reduce((acc, curr) => acc + curr.score, 0) / interviews.length >= 85,
    },
    {
      title: "Interview Master",
      description: "Completed 50+ interviews",
      earned: interviews.length >= 50,
    },
  ]

  const stats = [
    { label: "Interviews Completed", value: interviews.length.toString() },
    {
      label: "Average Score",
      value: interviews.length
        ? `${Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / interviews.length)}%`
        : "0%",
    },
    {
      label: "Best Performance",
      value: interviews.length ? `${Math.max(...interviews.map((i) => i.score))}%` : "0%",
    },
    {
      label: "Problems Solved",
      value: userSolutions.filter((s) => s.status === "solved").length.toString(),
    },
    {
      label: "Success Rate",
      value: userSolutions.length
        ? `${Math.round((userSolutions.filter((s) => s.status === "solved").length / userSolutions.length) * 100)}%`
        : "0%",
    },
    {
      label: "Member Since",
      value: new Date(user.created_at).toLocaleDateString(),
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <div className="flex h-full flex-col w-full">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-4">
              <SidebarTrigger className="text-slate-300" />
              <h1 className="text-xl font-semibold text-white">Profile Settings</h1>
              <div className="flex items-center gap-2 ml-auto">
                <KamikazBot size="sm" />
                <span className="text-slate-300 text-sm">Your profile</span>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 space-y-6 w-full">
              {/* Profile Header */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <Badge className="bg-purple-600">Premium User</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400">PIN:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-mono">
                            {showPin ? user.pin : "•".repeat(user.pin.length)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPin(!showPin)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-300">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={saving}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              {isEditing && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Edit Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-200">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interests" className="text-slate-200">
                        Technical Interests & Goals
                      </Label>
                      <Textarea
                        id="interests"
                        value={editedInterests}
                        onChange={(e) => setEditedInterests(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-slate-600 text-slate-300 bg-transparent"
                        disabled={saving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Interests */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Technical Interests & Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{user.interests}</p>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Statistics</CardTitle>
                  <CardDescription className="text-slate-400">Overview of your learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-slate-700/30 rounded-lg">
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your learning milestones and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          achievement.earned
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-slate-700/30 border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.earned ? "bg-green-500" : "bg-slate-600"
                            }`}
                          >
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${achievement.earned ? "text-green-400" : "text-slate-400"}`}>
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-slate-400">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <KamikazBot size="lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Personalized Recommendations</h3>
                  <p className="text-slate-300 mb-6">
                    Based on your profile and performance, Kamikaz AI suggests these next steps:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">🎯 Recommended Focus</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {interviews.length === 0 ? (
                          <>
                            <li>• Start with your first interview</li>
                            <li>• Practice basic coding problems</li>
                            <li>• Build interview confidence</li>
                          </>
                        ) : (
                          <>
                            <li>• Advanced system design patterns</li>
                            <li>• Leadership scenario practice</li>
                            <li>• Mock interviews with time pressure</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">📚 Learning Path</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {userSolutions.length === 0 ? (
                          <>
                            <li>• Solve your first coding problem</li>
                            <li>• Learn fundamental algorithms</li>
                            <li>• Practice data structures</li>
                          </>
                        ) : (
                          <>
                            <li>• Complete 5 more system design interviews</li>
                            <li>• Practice behavioral questions daily</li>
                            <li>• Target Google-style technical rounds</li>
                          </>
                        )}
                      </ul>
                    </div>
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
