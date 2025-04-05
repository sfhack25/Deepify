"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileUp } from "lucide-react"
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
          <h1 className="text-3xl font-bold text-foreground">Subjects Page</h1>
          <ThemeToggle />
        </div>

        <div className="grid gap-8">
          {/* Create New Subject */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Create New Subject</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter subject title..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="text-base"
                />
              </div>
              <Link href={`/syllabus?type=upload&title=${encodeURIComponent(topicTitle)}`}>
                <Button className="w-full" disabled={!topicTitle.trim()}>
                  <FileUp className="h-5 w-5 mr-2" />
                  Upload Syllabus
                </Button>
              </Link>
            </div>
          </Card>

          {/* My Subjects */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">My Subjects</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/dashboard/${topic.id}`}>
                  <Card className="h-full cursor-pointer p-4 transition-all hover:shadow-md">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-medium text-card-foreground mb-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">{topic.description}</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium text-primary">{topic.progress}%</span>
                        </div>
                        <Progress value={topic.progress} className="h-1.5" />
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

