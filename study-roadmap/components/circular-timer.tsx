"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, RefreshCw } from "lucide-react"

interface CircularTimerProps {
  initialMode?: "work" | "break"
}

export function CircularTimer({ initialMode = "work" }: CircularTimerProps) {
  // Use localStorage to persist timer state across page navigation
  const [mode, setMode] = useState<"work" | "break">(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("timer_mode")
      return savedMode ? (savedMode as "work" | "break") : initialMode
    }
    return initialMode
  })

  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTimeLeft = localStorage.getItem("timer_timeLeft")
      if (savedTimeLeft) {
        return Number.parseInt(savedTimeLeft, 10)
      }
    }
    return mode === "work" ? 25 * 60 : 5 * 60
  })

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window !== "undefined") {
      const savedIsRunning = localStorage.getItem("timer_isRunning")
      return savedIsRunning === "true"
    }
    return false
  })

  // Use a ref to track lastUpdated without causing re-renders
  const lastUpdatedRef = useRef(
    typeof window !== "undefined"
      ? localStorage.getItem("timer_lastUpdated")
        ? Number.parseInt(localStorage.getItem("timer_lastUpdated") || "0", 10)
        : Date.now()
      : Date.now(),
  )

  // Use a ref to track the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalTime = mode === "work" ? 25 * 60 : 5 * 60
  const progress = (timeLeft / totalTime) * 100
  const strokeDasharray = 2 * Math.PI * 45
  const strokeDashoffset = strokeDasharray * ((100 - progress) / 100)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Toggle between work and break modes
  const toggleMode = useCallback(() => {
    const newMode = mode === "work" ? "break" : "work"
    setMode(newMode)
    const newTimeLeft = newMode === "work" ? 25 * 60 : 5 * 60
    setTimeLeft(newTimeLeft)
    setIsRunning(false)

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("timer_mode", newMode)
      localStorage.setItem("timer_timeLeft", newTimeLeft.toString())
      localStorage.setItem("timer_isRunning", "false")
    }
  }, [mode])

  // Start/pause timer
  const toggleTimer = () => {
    const newIsRunning = !isRunning
    setIsRunning(newIsRunning)
    const now = Date.now()
    lastUpdatedRef.current = now

    // Save to localStorage
    localStorage.setItem("timer_isRunning", newIsRunning.toString())
    localStorage.setItem("timer_lastUpdated", now.toString())
  }

  // Reset timer
  const resetTimer = () => {
    const newTimeLeft = mode === "work" ? 25 * 60 : 5 * 60
    setTimeLeft(newTimeLeft)
    setIsRunning(false)

    // Save to localStorage
    localStorage.setItem("timer_timeLeft", newTimeLeft.toString())
    localStorage.setItem("timer_isRunning", "false")
  }

  // Initial time calculation when component mounts or isRunning changes
  useEffect(() => {
    if (isRunning) {
      // Calculate time passed since last update
      const now = Date.now()
      const secondsPassed = Math.floor((now - lastUpdatedRef.current) / 1000)

      if (secondsPassed > 0) {
        setTimeLeft((prev) => {
          const newTimeLeft = Math.max(0, prev - secondsPassed)
          localStorage.setItem("timer_timeLeft", newTimeLeft.toString())
          return newTimeLeft
        })
        // Update lastUpdated only if time has passed
        lastUpdatedRef.current = now
        localStorage.setItem("timer_lastUpdated", now.toString())
      }
    }
  }, [isRunning])

  // Timer interval effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isRunning && timeLeft > 0) {
      // Set up a new interval
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Clear interval when timer reaches 0
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setIsRunning(false)
            localStorage.setItem("timer_isRunning", "false")

            // Auto switch to the other mode when timer completes
            if (prev === 0) {
              setTimeout(() => toggleMode(), 500)
            }

            return 0
          }

          const newTimeLeft = prev - 1
          localStorage.setItem("timer_timeLeft", newTimeLeft.toString())
          return newTimeLeft
        })
      }, 1000)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeLeft, toggleMode])

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        {/* Background circle */}
        <svg className="absolute h-full w-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="5"
            className="text-secondary/50"
          />
        </svg>

        {/* Progress circle */}
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={mode === "work" ? "text-primary/60" : "text-red-500/60"}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Button
            variant="ghost"
            onClick={toggleMode}
            className={`text-2xl font-bold ${mode === "work" ? "text-primary/80" : "text-red-500/80"}`}
          >
            {mode === "work" ? "Work" : "Break"}
          </Button>
          <div className="text-xl font-medium">
            {formatTime(timeLeft)}
            <span className="text-sm ml-1">{mode === "work" ? "mins left" : "min left"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <Button variant="subtle" size="sm" onClick={toggleTimer} className="w-20">
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-1">{isRunning ? "Pause" : "Start"}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={resetTimer} className="w-20">
          <RefreshCw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
    </div>
  )
}

