"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CircularTimer } from "@/components/circular-timer"
import { Calendar } from "@/components/calendar"

// Sample topic data - in a real app, this would come from a database
const topics = {
  "1": {
    title: "Computer Science Fundamentals",
    currentTopic: "Introduction to Algorithms",
    progress: 25,
    quizCorrect: 40,
    quizProgress: 35,
    assignments: [
      { id: 1, title: "Assignment 1", progress: 50, status: "complete" },
      { id: 2, title: "Quiz 1", progress: 75, status: "in-progress" },
      { id: 3, title: "Assignment 2", progress: 0, status: "incomplete" },
    ],
    hasNotes: true,
  },
  "2": {
    title: "Web Development",
    currentTopic: "CSS Flexbox and Grid",
    progress: 65,
    quizCorrect: 80,
    quizProgress: 60,
    assignments: [
      { id: 1, title: "HTML Basics", progress: 100, status: "complete" },
      { id: 2, title: "CSS Quiz", progress: 50, status: "in-progress" },
      { id: 3, title: "JavaScript Intro", progress: 0, status: "incomplete" },
    ],
    hasNotes: false,
  },
  "3": {
    title: "Data Structures and Algorithms",
    currentTopic: "Binary Search Trees",
    progress: 25,
    quizCorrect: 60,
    quizProgress: 40,
    assignments: [
      { id: 1, title: "Arrays Quiz", progress: 100, status: "complete" },
      { id: 2, title: "Linked Lists", progress: 30, status: "in-progress" },
      { id: 3, title: "Trees Assignment", progress: 0, status: "incomplete" },
    ],
    hasNotes: false,
  },
  "4": {
    title: "New Subject",
    currentTopic: "Introduction",
    progress: 5,
    quizCorrect: 0,
    quizProgress: 0,
    assignments: [{ id: 1, title: "First Quiz", progress: 0, status: "incomplete" }],
    hasNotes: false,
  },
}

export default function Dashboard({ params }: { params: { id: string } }) {
  const topicId = params.id

  // Try to get custom subject from localStorage if it's not in our predefined list
  const [topic, setTopic] = useState<any>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [quizProgress, setQuizProgress] = useState(0)

  // Load progress data from localStorage
  useEffect(() => {
    try {
      const progressDataJSON = localStorage.getItem(`progress_${topicId}`)
      if (progressDataJSON) {
        const progressData = JSON.parse(progressDataJSON)
        setOverallProgress(progressData.overallProgress || 0)

        // Calculate quiz progress as average of all quiz scores
        const quizzes = progressData.quizzes || {}
        if (Object.keys(quizzes).length > 0) {
          const totalScore = Object.values(quizzes).reduce((sum: number, quiz: any) => sum + quiz.score, 0)
          setQuizProgress(Math.round(totalScore / Object.keys(quizzes).length))
        }
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }
  }, [topicId])

  // Calculate overall progress based on quiz completion
  const calculateOverallProgress = (assignments: any[]) => {
    if (!assignments || assignments.length === 0) return 0

    const totalAssignments = assignments.length
    const completedAssignments = assignments.filter((a) => a.status === "complete").length
    const inProgressAssignments = assignments.filter((a) => a.status === "in-progress").length

    // Weight completed assignments fully and in-progress assignments partially
    return Math.round(((completedAssignments + inProgressAssignments * 0.5) / totalAssignments) * 100)
  }

  useEffect(() => {
    // First check if it's one of our predefined topics
    if (topics[topicId as keyof typeof topics]) {
      setTopic(topics[topicId as keyof typeof topics])
      return
    }

    try {
      // Check if we have this subject in localStorage
      const subjectsJSON = localStorage.getItem("subjects")
      if (subjectsJSON) {
        const subjects = JSON.parse(subjectsJSON)
        const customSubject = subjects.find((s: any) => s.id.toString() === topicId)

        if (customSubject) {
          // Create sample assignments for the new subject
          const sampleAssignments = [
            { id: 1, title: "Introduction Quiz", progress: 0, status: "incomplete" },
            { id: 2, title: "Fundamentals Quiz", progress: 0, status: "incomplete" },
            { id: 3, title: "Advanced Topics Quiz", progress: 0, status: "incomplete" },
          ]

          // Create a topic object from the custom subject
          setTopic({
            title: customSubject.title,
            currentTopic: "Note Quizzes",
            progress: 0,
            quizCorrect: 0,
            quizProgress: 0,
            assignments: sampleAssignments,
            hasNotes: false,
          })
        }
      }
    } catch (error) {
      console.error("Error retrieving subject:", error)
    }
  }, [topicId])

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Subject not found</h1>
          <Link href="/topics">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Use stored progress if available, otherwise calculate from assignments
  const displayOverallProgress = overallProgress > 0 ? overallProgress : calculateOverallProgress(topic.assignments)
  const displayQuizProgress = quizProgress > 0 ? quizProgress : topic.quizProgress || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/topics">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{topic.title} Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/notes/upload/${topicId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Upload className="h-4 w-4" /> Upload Notes
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-6">
            {/* Subject Roadmap */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Link href={`/roadmap/${topicId}`} className="hover:underline">
                  <h2 className="text-xl font-semibold text-card-foreground">Subject Roadmap</h2>
                </Link>
                <span className="text-sm font-medium text-primary">{displayOverallProgress}% complete</span>
              </div>
              <Progress value={displayOverallProgress} className="h-2" />
            </Card>

            {/* Note Quizzes Progress (formerly Topic) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-card-foreground">Note Quizzes Progress</h2>
                <span className="text-sm font-medium text-primary">{displayQuizProgress}% Complete</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Quiz Completion</h3>
              </div>
              <Progress value={displayQuizProgress} className="h-2" />
            </Card>

            {/* Note Quizzes */}
            <Card className="p-6">
              <Link href={`/topics/${topicId}/notes-quiz/n1`} className="hover:underline">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Note Quizzes</h2>
              </Link>
              <div className="space-y-4">
                {topic.assignments.map((assignment: any) => (
                  <div key={assignment.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {assignment.status === "complete" && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                        {assignment.status === "in-progress" && <Clock className="h-5 w-5 text-yellow-500 mr-2" />}
                        {assignment.status === "incomplete" && (
                          <XCircle className="h-5 w-5 text-muted-foreground mr-2" />
                        )}
                        <h3 className="font-medium">{assignment.title}</h3>
                      </div>
                      {assignment.progress > 0 && (
                        <span className="text-sm font-medium text-primary">{assignment.progress}%</span>
                      )}
                    </div>
                    <Progress value={assignment.progress} className="h-1.5" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {assignment.status === "complete"
                          ? "Complete"
                          : assignment.status === "in-progress"
                            ? "In Progress"
                            : "Incomplete"}
                      </span>
                      <Link href={`/topics/${topicId}/notes-quiz/${assignment.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <Calendar />
            </Card>

            <Card className="p-6 flex flex-col items-center">
              <CircularTimer />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

