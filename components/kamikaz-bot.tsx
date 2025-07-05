"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface KamikazBotProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function KamikazBot({ size = "md", className }: KamikazBotProps) {
  const [isActive, setIsActive] = useState(false)
  const [morphState, setMorphState] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMorphState((prev) => (prev + 1) % 4)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  }

  const getMorphPath = () => {
    switch (morphState) {
      case 0:
        return "M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
      case 1:
        return "M50,5 C75,15 85,35 85,50 C85,65 75,85 50,95 C25,85 15,65 15,50 C15,35 25,15 50,5 Z"
      case 2:
        return "M50,15 C65,15 80,25 85,40 C90,55 85,70 70,80 C55,85 45,85 30,80 C15,70 10,55 15,40 C20,25 35,15 50,15 Z"
      case 3:
        return "M50,8 C72,12 88,28 92,50 C88,72 72,88 50,92 C28,88 12,72 8,50 C12,28 28,12 50,8 Z"
      default:
        return "M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
    }
  }

  return (
    <div
      className={cn("relative flex items-center justify-center cursor-pointer", sizeClasses[size], className)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="kamikazGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main morphing shape */}
        <path
          d={getMorphPath()}
          fill="url(#kamikazGradient)"
          filter={isActive ? "url(#glow)" : "none"}
          className="transition-all duration-500 ease-in-out"
          style={{
            transform: isActive ? "scale(1.1)" : "scale(1)",
            transformOrigin: "center",
          }}
        />

        {/* Inner pulse */}
        <circle cx="50" cy="50" r="15" fill="rgba(255,255,255,0.3)" className="animate-pulse" />

        {/* Core dot */}
        <circle
          cx="50"
          cy="50"
          r="5"
          fill="white"
          className={cn("transition-all duration-300", isActive ? "animate-ping" : "")}
        />

        {/* Orbital rings */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          className="animate-spin"
          style={{ animationDuration: "8s" }}
        />
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
          className="animate-spin"
          style={{ animationDuration: "12s", animationDirection: "reverse" }}
        />
      </svg>

      {/* Floating particles */}
      {isActive && (
        <>
          <div
            className="absolute top-0 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/4 right-0 w-1 h-1 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-1/4 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}
    </div>
  )
}
