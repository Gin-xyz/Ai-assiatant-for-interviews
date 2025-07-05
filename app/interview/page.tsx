"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KamikazBot } from "@/components/kamikaz-bot"
import { Brain, Code, Users, Settings, Play, Clock, Target, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "Algorithms, data structures, and coding challenges",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    duration: "45-60 min",
    difficulty: "Hard",
    topics: ["Algorithms", "Data Structures", "Problem Solving", "Code Optimization"],
  },
  {
    id: "behavioral",
    title: "Behavioral Interview",
    description: "Past experiences, teamwork, and leadership scenarios",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    duration: "30-45 min",
    difficulty: "Medium",
    topics: ["Leadership", "Teamwork", "Conflict Resolution", "Career Goals"],
  },
  {
    id: "system-design",
    title: "System Design",
    description: "Architecture, scalability, and system design principles",
    icon: Settings,
    color: "from-purple-500 to-violet-500",
    duration: "60-90 min",
    difficulty: "Expert",
    topics: ["Scalability", "Architecture", "Database Design", "Load Balancing"],
  },
  {
    id: "mixed",
    title: "Mixed Interview",
    description: "Combination of technical, behavioral, and problem-solving",
    icon: Brain,
    color: "from-orange-500 to-red-500",
    duration: "60-75 min",
    difficulty: "Hard",
    topics: ["All Categories", "Comprehensive", "Real Interview Simulation"],
  },
]

const companies = ["Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Tesla", "Uber", "Airbnb", "Spotify"]

const roles = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Principal Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "Engineering Manager",
]

export default function InterviewPage() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const router = useRouter()

  const handleStartInterview = () => {
    if (selectedType && selectedCompany && selectedRole) {
      // Store interview configuration
      const interviewConfig = {
        type: selectedType,
        company: selectedCompany,
        role: selectedRole,
      }
      localStorage.setItem("currentInterview", JSON.stringify(interviewConfig))
      router.push("/interview/live")
    }
  }

  const selectedTypeData = interviewTypes.find((type) => type.id === selectedType)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <div className="flex h-full flex-col w-full">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-4">
              <SidebarTrigger className="text-slate-300" />
              <h1 className="text-xl font-semibold text-white">Start New Interview</h1>
              <div className="flex items-center gap-2 ml-auto">
                <KamikazBot size="sm" />
                <span className="text-slate-300 text-sm">Ready to begin</span>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 space-y-6 w-full">
              {/* Interview Type Selection */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Choose Interview Type
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Select the type of interview you want to practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviewTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedType === type.id
                            ? "ring-2 ring-purple-500 bg-slate-700/50"
                            : "bg-slate-700/30 hover:bg-slate-700/50"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}
                            >
                              <type.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{type.title}</h3>
                              <p className="text-sm text-slate-400 mb-3">{type.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {type.duration}
                                </Badge>
                                <Badge
                                  variant={
                                    type.difficulty === "Expert"
                                      ? "destructive"
                                      : type.difficulty === "Hard"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {type.difficulty}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {type.topics.slice(0, 2).map((topic, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded"
                                  >
                                    {topic}
                                  </span>
                                ))}
                                {type.topics.length > 2 && (
                                  <span className="text-xs text-slate-400">+{type.topics.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              {selectedType && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Interview Configuration
                    </CardTitle>
                    <CardDescription className="text-slate-400">Customize your interview experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Target Company</label>
                        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {companies.map((company) => (
                              <SelectItem key={company} value={company} className="text-white hover:bg-slate-700">
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Target Role</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {roles.map((role) => (
                              <SelectItem key={role} value={role} className="text-white hover:bg-slate-700">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interview Preview */}
              {selectedType && selectedTypeData && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Interview Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedTypeData.color} flex items-center justify-center`}
                      >
                        <selectedTypeData.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{selectedTypeData.title}</h3>
                        <p className="text-slate-400 mb-2">{selectedTypeData.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {selectedTypeData.duration}
                          </Badge>
                          <Badge
                            variant={
                              selectedTypeData.difficulty === "Expert"
                                ? "destructive"
                                : selectedTypeData.difficulty === "Hard"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {selectedTypeData.difficulty}
                          </Badge>
                          {selectedCompany && <Badge className="bg-purple-600">{selectedCompany}</Badge>}
                          {selectedRole && <Badge variant="outline">{selectedRole}</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Topics Covered:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTypeData.topics.map((topic, index) => (
                            <span key={index} className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          What to Expect:
                        </h4>
                        <ul className="text-slate-300 text-sm space-y-1">
                          <li>• Real-time voice conversation with Kamikaz AI</li>
                          <li>• FAANG-style questions tailored to your selection</li>
                          <li>• Intelligent follow-up questions based on your responses</li>
                          <li>• Detailed feedback and scoring at the end</li>
                          <li>• Professional interview simulation experience</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Start Interview Button */}
              {selectedType && (
                <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <KamikazBot size="lg" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Begin?</h3>
                    <p className="text-slate-300 mb-6">
                      Kamikaz AI will conduct your interview. Make sure you're in a quiet environment with a working
                      microphone.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
                      onClick={handleStartInterview}
                      disabled={!selectedCompany || !selectedRole}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Interview Session
                    </Button>
                    {(!selectedCompany || !selectedRole) && (
                      <p className="text-sm text-slate-400 mt-2">Please select both company and role to continue</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
