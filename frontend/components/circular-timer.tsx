"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface CircularTimerProps {
  initialMode?: "work" | "break"
}

export function CircularTimer({ initialMode = "work" }: CircularTimerProps) {
  const [mode, setMode] = useState<"work" | "break">(initialMode)
  const [timeLeft, setTimeLeft] = useState(mode === "work" ? 25 * 60 : 5 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)

  // Reference to the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on component mount
  useEffect(() => {
    // Create a new audio element
    const audio = new Audio()

    // Set up event listeners
    audio.addEventListener("canplaythrough", () => {
      console.log("Audio loaded successfully")
      setAudioLoaded(true)
    })

    audio.addEventListener("error", (e) => {
      console.error("Audio loading error:", e)
    })

    // Set the source after adding event listeners
    audio.src = "/ding-101492.mp3"
    audio.load()

    // Store the audio element in the ref
    audioRef.current = audio

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [])

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
  const toggleMode = () => {
    const newMode = mode === "work" ? "break" : "work"
    setMode(newMode)
    setTimeLeft(newMode === "work" ? 25 * 60 : 5 * 60)
    setIsRunning(false)
  }

  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Reset timer
  const resetTimer = () => {
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60)
    setIsRunning(false)
  }

  // Play ding sound with multiple fallback methods
  const playDingSound = () => {
    console.log("Attempting to play sound")

    // Method 1: Use the audio ref
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("Audio played successfully"))
            .catch((error) => {
              console.error("Error playing audio:", error)
              // Try fallback methods
              playFallbackSound()
            })
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        playFallbackSound()
      }
    } else {
      playFallbackSound()
    }
  }

  // Fallback methods to play sound
  const playFallbackSound = () => {
    console.log("Trying fallback sound methods")

    // Method 2: Create a new Audio object
    try {
      const newAudio = new Audio("/ding-101492.mp3")
      newAudio
        .play()
        .then(() => console.log("Fallback audio played successfully"))
        .catch((error) => {
          console.error("Fallback audio error:", error)
          // Try DOM method
          playDomAudio()
        })
    } catch (error) {
      console.error("Error with fallback audio:", error)
      playDomAudio()
    }
  }

  // Final fallback using DOM audio element
  const playDomAudio = () => {
    console.log("Trying DOM audio element")
    const domAudio = document.getElementById("ding-sound") as HTMLAudioElement
    if (domAudio) {
      try {
        domAudio.currentTime = 0
        domAudio
          .play()
          .then(() => console.log("DOM audio played successfully"))
          .catch((error) => console.error("DOM audio error:", error))
      } catch (error) {
        console.error("Error with DOM audio:", error)
      }
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            // Play sound when timer reaches zero
            playDingSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      // Auto switch to the other mode when timer completes
      toggleMode()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // Test sound button (for debugging)
  const testSound = () => {
    playDingSound()
  }

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
            className="text-secondary"
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
            className={mode === "work" ? "text-blue-500" : "text-red-500"}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Button
            variant="ghost"
            onClick={toggleMode}
            className={`text-2xl font-bold ${mode === "work" ? "text-blue-500" : "text-red-500"}`}
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
        <Button variant="outline" size="sm" onClick={toggleTimer} className="w-20">
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" size="sm" onClick={resetTimer} className="w-20">
          Reset
        </Button>
      </div>

      {/* Hidden audio element as a fallback */}
      <audio id="ding-sound" src="/ding-101492.mp3" preload="auto" className="hidden" />
    </div>
  )
}

