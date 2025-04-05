"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileUp, BookOpen, Sparkles, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Progress } from "@/components/ui/progress"

// Sample topics data - in a real app, this would come from a database
const defaultTopics = [
  {
    id: 1,
    title: "Computer Science Fundamentals",
    description: "Basic concepts and principles of computer science",
    lastAccessed: "2 days ago",
    progress: 40,
  },
  {
    id: 2,
    title: "Web Development",
    description: "HTML, CSS, JavaScript and modern frameworks",
    lastAccessed: "1 week ago",
    progress: 65,
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    description: "Essential algorithms and data structures",
    lastAccessed: "3 days ago",
    progress: 25,
  },
]

export default function Topics() {
  const [topicTitle, setTopicTitle] = useState("")
  const [topics, setTopics] = useState<any[]>([])

  // Reset timer when returning to subjects page
  useEffect(() => {
    // Clear timer state
    localStorage.removeItem("timer_mode")
    localStorage.removeItem("timer_timeLeft")
    localStorage.removeItem("timer_isRunning")
    localStorage.removeItem("timer_lastUpdated")
  }, [])

  // Load any custom subjects from localStorage on component mount
  useEffect(() => {
    try {
      // Get custom subjects from localStorage
      const subjectsJSON = localStorage.getItem("subjects")
      const customSubjects = subjectsJSON ? JSON.parse(subjectsJSON) : []

      // Combine default topics with custom subjects
      setTopics([...defaultTopics, ...customSubjects])
    } catch (error) {
      console.error("Error loading subjects:", error)
      setTopics(defaultTopics)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="subtle-gradient-text">Your Learning Journey</h1>
          <ThemeToggle />
        </div>

        <div className="grid gap-8">
          {/* Create New Subject */}
          <Card subtle className="p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary/70" />
              Create New Subject
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter subject title..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="text-base border-primary/20 focus:border-primary/40"
                />
              </div>
              <Link href={`/syllabus?type=upload&title=${encodeURIComponent(topicTitle)}`}>
                <Button variant="subtle" className="w-full" disabled={!topicTitle.trim()}>
                  <FileUp className="h-5 w-5 mr-2" />
                  Upload Syllabus
                </Button>
              </Link>
            </div>
          </Card>

          {/* My Subjects */}
          <Card subtle className="p-6 pattern-grid">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary/70" />
              My Subjects
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/dashboard/${topic.id}`}>
                  <Card subtle className="h-full cursor-pointer p-4 transition-all">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-primary/70" />
                        <h3 className="text-lg font-medium text-card-foreground">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">{topic.description}</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium text-primary/80">{topic.progress}%</span>
                        </div>
                        <Progress value={topic.progress} subtle className="h-1.5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

