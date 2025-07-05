"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Sparkles, Code, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const [step, setStep] = useState<"pin" | "profile">("pin")
  const [pin, setPin] = useState("")
  const [name, setName] = useState("")
  const [interests, setInterests] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length === 7) {
      setLoading(true)
      setError("")

      // Check if PIN already exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("pin", pin).single()

      if (existingUser) {
        // User exists, log them in
        localStorage.setItem("kamikazUser", JSON.stringify(existingUser))
        router.push("/dashboard")
      } else {
        // New user, proceed to profile step
        setStep("profile")
      }
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name && interests) {
      setLoading(true)
      setError("")

      try {
        const { data: user, error: insertError } = await supabase
          .from("users")
          .insert({
            pin,
            name,
            interests,
          })
          .select()
          .single()

        if (insertError) {
          if (insertError.code === "23505") {
            setError("This PIN is already taken. Please choose a different one.")
            setStep("pin")
          } else {
            setError("Failed to create account. Please try again.")
          }
        } else {
          localStorage.setItem("kamikazUser", JSON.stringify(user))
          router.push("/dashboard")
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
      }
      setLoading(false)
    }
  }

  const formatPin = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    if (cleaned.length <= 5) {
      return cleaned.replace(/\D/g, "")
    } else {
      const digits = cleaned.slice(0, 5).replace(/\D/g, "")
      const letters = cleaned.slice(5, 7).replace(/[^A-Z]/g, "")
      return digits + letters
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border-slate-700 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Kamikaz-Interview-ai</CardTitle>
            <CardDescription className="text-slate-300">
              {step === "pin" ? "Enter your PIN or create a new one" : "Complete your profile"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === "pin" ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-slate-200">
                  PIN (5 digits + 2 letters)
                </Label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="12345AB"
                  value={pin}
                  onChange={(e) => setPin(formatPin(e.target.value))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-center text-lg font-mono tracking-wider"
                  maxLength={7}
                  required
                />
                <p className="text-xs text-slate-400 text-center">
                  Enter existing PIN to login or create new PIN to register
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={pin.length !== 7 || loading}
              >
                {loading ? "Checking..." : "Continue"}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests" className="text-slate-200">
                  Technical Interests & Goals
                </Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., Full-stack development, Machine Learning, System Design, preparing for FAANG interviews..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("pin")}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!name || !interests || loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                  <Code className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-700">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Users className="w-4 h-4" />
              <span>FAANG-Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Brain className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
