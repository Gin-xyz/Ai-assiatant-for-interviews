"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedAIOrbProps {
  size?: "sm" | "md" | "lg" | "xl"
  isSpeaking?: boolean
  isListening?: boolean
  className?: string
}

export function AnimatedAIOrb({ size = "lg", isSpeaking = false, isListening = false, className }: AnimatedAIOrbProps) {
  const [morphState, setMorphState] = useState(0)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  }

  useEffect(() => {
    const interval = setInterval(
      () => {
        setMorphState((prev) => (prev + 1) % 6)
      },
      isSpeaking ? 800 : isListening ? 1200 : 2000,
    )

    return () => clearInterval(interval)
  }, [isSpeaking, isListening])

  const getMorphPath = () => {
    const paths = [
      "M50,15 C75,20 85,35 80,50 C85,65 75,80 50,85 C25,80 15,65 20,50 C15,35 25,20 50,15 Z",
      "M50,10 C70,18 88,32 85,50 C88,68 70,82 50,90 C30,82 12,68 15,50 C12,32 30,18 50,10 Z",
      "M50,20 C65,15 85,25 90,45 C85,65 75,85 50,80 C25,85 15,65 10,45 C15,25 35,15 50,20 Z",
      "M50,8 C78,12 92,28 88,50 C92,72 78,88 50,92 C22,88 8,72 12,50 C8,28 22,12 50,8 Z",
      "M50,25 C70,20 80,30 85,50 C80,70 70,80 50,75 C30,80 20,70 15,50 C20,30 30,20 50,25 Z",
      "M50,12 C72,16 84,34 82,50 C84,66 72,84 50,88 C28,84 16,66 18,50 C16,34 28,16 50,12 Z",
    ]
    return paths[morphState]
  }

  const getAnimationSpeed = () => {
    if (isSpeaking) return "0.8s"
    if (isListening) return "1.2s"
    return "3s"
  }

  const getGradientColors = () => {
    if (isSpeaking) {
      return {
        primary: "#ec4899", // Pink
        secondary: "#8b5cf6", // Purple
        tertiary: "#f59e0b", // Amber
        quaternary: "#ef4444", // Red
      }
    } else if (isListening) {
      return {
        primary: "#3b82f6", // Blue
        secondary: "#8b5cf6", // Purple
        tertiary: "#ec4899", // Pink
        quaternary: "#06b6d4", // Cyan
      }
    } else {
      return {
        primary: "#8b5cf6", // Purple
        secondary: "#ec4899", // Pink
        tertiary: "#f59e0b", // Amber
        quaternary: "#a855f7", // Violet
      }
    }
  }

  const colors = getGradientColors()

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{
          filter: isSpeaking
            ? "drop-shadow(0 0 20px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))"
            : isListening
              ? "drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 30px rgba(139, 92, 246, 0.3))"
              : "drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))",
        }}
      >
        <defs>
          {/* Main gradient */}
          <radialGradient id="mainGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9">
              <animate
                attributeName="stop-color"
                values={`${colors.primary};${colors.secondary};${colors.tertiary};${colors.primary}`}
                dur={getAnimationSpeed()}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor={colors.secondary} stopOpacity="0.8">
              <animate
                attributeName="stop-color"
                values={`${colors.secondary};${colors.tertiary};${colors.quaternary};${colors.secondary}`}
                dur={getAnimationSpeed()}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor={colors.tertiary} stopOpacity="0.6">
              <animate
                attributeName="stop-color"
                values={`${colors.tertiary};${colors.quaternary};${colors.primary};${colors.tertiary}`}
                dur={getAnimationSpeed()}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors.quaternary} stopOpacity="0.3">
              <animate
                attributeName="stop-color"
                values={`${colors.quaternary};${colors.primary};${colors.secondary};${colors.quaternary}`}
                dur={getAnimationSpeed()}
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>

          {/* Secondary swirl gradient */}
          <linearGradient id="swirlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.7">
              <animate
                attributeName="stop-color"
                values={`${colors.secondary};${colors.primary};${colors.tertiary};${colors.secondary}`}
                dur={`${Number.parseFloat(getAnimationSpeed()) * 1.5}s`}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={colors.primary} stopOpacity="0.5">
              <animate
                attributeName="stop-color"
                values={`${colors.primary};${colors.tertiary};${colors.quaternary};${colors.primary}`}
                dur={`${Number.parseFloat(getAnimationSpeed()) * 1.5}s`}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors.tertiary} stopOpacity="0.3">
              <animate
                attributeName="stop-color"
                values={`${colors.tertiary};${colors.quaternary};${colors.secondary};${colors.tertiary}`}
                dur={`${Number.parseFloat(getAnimationSpeed()) * 1.5}s`}
                repeatCount="indefinite"
              />
            </stop>
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              values="0 50 50;360 50 50"
              dur={`${Number.parseFloat(getAnimationSpeed()) * 2}s`}
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Inner glow */}
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Noise filter for texture */}
          <filter id="noise">
            <feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.1 0.2 0.3" />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="multiply" />
          </filter>
        </defs>

        {/* Main morphing shape */}
        <path
          d={getMorphPath()}
          fill="url(#mainGradient)"
          className="transition-all duration-500"
          style={{
            transform: isSpeaking ? "scale(1.1)" : isListening ? "scale(1.05)" : "scale(1)",
            transformOrigin: "center",
          }}
        >
          <animate
            attributeName="d"
            values={`${getMorphPath()};M50,5 C80,10 95,25 90,50 C95,75 80,90 50,95 C20,90 5,75 10,50 C5,25 20,10 50,5 Z;${getMorphPath()}`}
            dur={getAnimationSpeed()}
            repeatCount="indefinite"
          />
        </path>

        {/* Secondary swirl layer */}
        <path
          d="M50,20 C70,25 75,35 70,50 C75,65 70,75 50,80 C30,75 25,65 30,50 C25,35 30,25 50,20 Z"
          fill="url(#swirlGradient)"
          opacity="0.6"
          style={{
            transform: isSpeaking ? "scale(0.8)" : "scale(0.9)",
            transformOrigin: "center",
          }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 50 50;-360 50 50"
            dur={`${Number.parseFloat(getAnimationSpeed()) * 3}s`}
            repeatCount="indefinite"
          />
        </path>

        {/* Inner glow effect */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="url(#innerGlow)"
          opacity={isSpeaking ? "0.8" : isListening ? "0.6" : "0.4"}
        >
          <animate attributeName="r" values="15;25;15" dur={getAnimationSpeed()} repeatCount="indefinite" />
        </circle>

        {/* Core pulse */}
        <circle cx="50" cy="50" r="8" fill="white" opacity={isSpeaking ? "0.9" : isListening ? "0.7" : "0.5"}>
          <animate
            attributeName="r"
            values="8;12;8"
            dur={`${Number.parseFloat(getAnimationSpeed()) / 2}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur={`${Number.parseFloat(getAnimationSpeed()) / 2}s`}
            repeatCount="indefinite"
          />
        </circle>

        {/* Floating particles */}
        {isSpeaking && (
          <>
            <circle cx="30" cy="30" r="2" fill={colors.primary} opacity="0.7">
              <animate attributeName="cy" values="30;20;30" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="40" r="1.5" fill={colors.secondary} opacity="0.6">
              <animate attributeName="cx" values="70;80;70" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="70" r="1" fill={colors.tertiary} opacity="0.8">
              <animate attributeName="cy" values="70;80;70" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Listening wave rings */}
        {isListening && (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke={colors.primary} strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="40" fill="none" stroke={colors.secondary} strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" values="40;50;40" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>

      {/* Outer glow rings for speaking state */}
      {isSpeaking && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping opacity-30"
            style={{ borderColor: colors.primary }}
          />
          <div
            className="absolute inset-4 rounded-full border-2 animate-ping opacity-20"
            style={{
              borderColor: colors.secondary,
              animationDelay: "0.5s",
            }}
          />
        </>
      )}

      {/* Listening pulse ring */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border-2 animate-pulse" style={{ borderColor: colors.primary }} />
      )}
    </div>
  )
}
