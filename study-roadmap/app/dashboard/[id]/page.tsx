"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Sparkles, Award, ArrowRight, CheckCircle, Zap, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CircularTimer } from "@/components/circular-timer"
import { Calendar } from "@/components/calendar"

// Sample roadmap data - in a real app, this would be generated from the syllabus
const roadmapTopics = {
  "1": [
    {
      id: 1,
      title: "Introduction to Computer Science",
      description: "Fundamentals and core concepts",
      progress: 100,
      completed: true,
    },
    {
      id: 2,
      title: "Data Structures",
      description: "Organizing and storing data",
      progress: 65,
      completed: false,
    },
    {
      id: 3,
      title: "Algorithms",
      description: "Problem-solving approaches",
      progress: 30,
      completed: false,
    },
    {
      id: 4,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and inheritance",
      progress: 0,
      completed: false,
    },
  ],
  "2": [
    {
      id: 1,
      title: "HTML Fundamentals",
      description: "Structure and semantics",
      progress: 100,
      completed: true,
    },
    {
      id: 2,
      title: "CSS Styling",
      description: "Making websites look good",
      progress: 75,
      completed: false,
    },
    {
      id: 3,
      title: "JavaScript Basics",
      description: "Adding interactivity",
      progress: 20,
      completed: false,
    },
  ],
  "3": [
    {
      id: 1,
      title: "Basic Data Structures",
      description: "Fundamental data organization",
      progress: 100,
      completed: true,
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      description: "Complex data organization",
      progress: 45,
      completed: false,
    },
    {
      id: 3,
      title: "Algorithm Analysis",
      description: "Evaluating algorithm efficiency",
      progress: 10,
      completed: false,
    },
  ],
}

// Default roadmap template for new subjects
const defaultRoadmap = [
  {
    id: 1,
    title: "Introduction",
    description: "Getting started with the subject",
    progress: 0,
    completed: false,
  },
  {
    id: 2,
    title: "Fundamentals",
    description: "Core principles and concepts",
    progress: 0,
    completed: false,
  },
  {
    id: 3,
    title: "Advanced Topics",
    description: "Deeper exploration of the subject",
    progress: 0,
    completed: false,
  },
]

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
  const [roadmapItems, setRoadmapItems] = useState<any[]>([])
  const [topicsWithNotes, setTopicsWithNotes] = useState<Record<string, boolean>>({})
  const [subjectTitle, setSubjectTitle] = useState<string>("Subject Roadmap")

  // Load topics with notes from localStorage
  useEffect(() => {
    try {
      const notesDataJSON = localStorage.getItem(`notes_${topicId}`)
      if (notesDataJSON) {
        setTopicsWithNotes(JSON.parse(notesDataJSON))
      }
    } catch (error) {
      console.error("Error loading notes data:", error)
    }
  }, [topicId])

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

        // If we have topic progress data, use it to update the roadmap items
        if (progressData.topics && progressData.topics.length > 0) {
          // First check if we're dealing with a predefined roadmap
          if (roadmapTopics[topicId as keyof typeof roadmapTopics]) {
            const updatedTopics = [...roadmapTopics[topicId as keyof typeof roadmapTopics]]

            // Update progress for each topic that has data
            progressData.topics.forEach((topicProgress: any, index: number) => {
              if (topicProgress && index < updatedTopics.length) {
                updatedTopics[index].progress = topicProgress.progress || 0
                updatedTopics[index].completed = topicProgress.completed || false
              }
            })

            setRoadmapItems(updatedTopics)
          } else {
            // For custom subjects, update the default roadmap with progress data
            const updatedDefaultTopics = [...defaultRoadmap]

            progressData.topics.forEach((topicProgress: any, index: number) => {
              if (topicProgress && index < updatedDefaultTopics.length) {
                updatedDefaultTopics[index].progress = topicProgress.progress || 0
                updatedDefaultTopics[index].completed = topicProgress.completed || false
              }
            })

            setRoadmapItems(updatedDefaultTopics)
          }
        }
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }
  }, [topicId])

  // Load roadmap data
  useEffect(() => {
    // First check if it's one of our predefined roadmaps
    if (roadmapTopics[topicId as keyof typeof roadmapTopics]) {
      // Only set roadmap items if we haven't already loaded progress data
      if (roadmapItems.length === 0) {
        setRoadmapItems(roadmapTopics[topicId as keyof typeof roadmapTopics])
      }

      // Set the subject title based on the predefined topics
      if (topicId === "1") {
        setSubjectTitle("Computer Science Fundamentals")
      } else if (topicId === "2") {
        setSubjectTitle("Web Development")
      } else if (topicId === "3") {
        setSubjectTitle("Data Structures and Algorithms")
      }
    } else {
      // If not a predefined roadmap, check localStorage for custom subjects
      try {
        const subjectsJSON = localStorage.getItem("subjects")
        if (subjectsJSON) {
          const subjects = JSON.parse(subjectsJSON)
          const customSubject = subjects.find((s: any) => s.id.toString() === topicId)

          if (customSubject) {
            // Use the custom subject title
            setSubjectTitle(customSubject.title)

            // Only set roadmap items if we haven't already loaded progress data
            if (roadmapItems.length === 0) {
              setRoadmapItems(defaultRoadmap)
            }
          } else {
            // If no custom subject found, use default roadmap
            if (roadmapItems.length === 0) {
              setRoadmapItems(defaultRoadmap)
            }
          }
        } else {
          // If no subjects in localStorage, use default roadmap
          if (roadmapItems.length === 0) {
            setRoadmapItems(defaultRoadmap)
          }
        }
      } catch (error) {
        console.error("Error retrieving subject:", error)
        if (roadmapItems.length === 0) {
          setRoadmapItems(defaultRoadmap)
        }
      }
    }
  }, [topicId, roadmapItems.length])

  // Load topic data
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

  // Calculate overall progress based on topic progress
  const calculateOverallProgress = () => {
    if (!roadmapItems || roadmapItems.length === 0) return 0

    const totalProgress = roadmapItems.reduce((sum, topic) => sum + topic.progress, 0)
    return Math.round(totalProgress / roadmapItems.length)
  }

  // Check if notes are available for a specific topic
  const hasNotesForTopic = (topicId: number) => {
    return !!topicsWithNotes[topicId.toString()]
  }

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Subject not found</h1>
          <Link href="/topics">
            <Button variant="subtle">Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Use stored progress if available, otherwise calculate from assignments
  const displayOverallProgress = overallProgress > 0 ? overallProgress : calculateOverallProgress()
  const displayQuizProgress = quizProgress > 0 ? quizProgress : topic.quizProgress || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/topics">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
              </Button>
            </Link>
            <h1 className="subtle-gradient-text">{topic.title} Dashboard</h1>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-6">
            {/* Subject Roadmap Progress Card */}
            <Card subtle className="p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary/70" />
                  <h2 className="text-xl font-semibold text-card-foreground">Subject Roadmap</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary/80">{displayOverallProgress}% complete</span>
                  {displayOverallProgress >= 100 && <Award className="h-5 w-5 text-yellow-500/80" />}
                </div>
              </div>
              <Progress value={displayOverallProgress} subtle className="h-2 mb-4" />
            </Card>

            {/* Roadmap Content */}
            <div className="rounded-lg bg-card/50 p-6 shadow-sm pattern-dots">
              <div className="relative mb-8">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent"></div>

                {roadmapItems.map((topic, index) => (
                  <div key={topic.id} className="relative mb-8 pl-10">
                    <div
                      className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                        topic.completed
                          ? "bg-green-500/20 text-green-600 border border-green-500/30"
                          : "bg-primary/10 text-primary/80 border border-primary/30"
                      }`}
                    >
                      {topic.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>

                    <Card subtle className="overflow-hidden">
                      <div className="border-b border-border/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {topic.completed ? (
                              <Sparkles className="h-5 w-5 text-yellow-500/70" />
                            ) : (
                              <Zap className="h-5 w-5 text-primary/70" />
                            )}
                            <h3 className="text-lg font-medium text-card-foreground">{topic.title}</h3>
                          </div>
                          <span className="text-sm text-muted-foreground">{topic.progress}% Complete</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </div>

                      {/* Topic Progress Bar */}
                      <div className="px-4 pt-4">
                        <Progress value={topic.progress} subtle className="h-1.5" />
                      </div>

                      <div className="bg-muted/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Link href={`/topics/${topicId}/quiz/p${topic.id}`}>
                          <Button variant="subtle" className="w-full">
                            Pre-Lecture Quiz <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/notes/upload/${topicId}?topicId=${topic.id}`}>
                          <Button variant="outline" className="w-full">
                            Post-Lecture Notes <Upload className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={hasNotesForTopic(topic.id) ? `/topics/${topicId}/notes-quiz/n${topic.id}` : "#"}>
                          <Button
                            className={`w-full relative ${
                              hasNotesForTopic(topic.id)
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-orange-500/30 text-white/70"
                            }`}
                            disabled={!hasNotesForTopic(topic.id)}
                          >
                            Post-Lecture Quiz <FileText className="ml-2 h-4 w-4" />
                            {!hasNotesForTopic(topic.id) && (
                              <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-xs font-medium text-muted-foreground rounded-md">
                                Upload notes first
                              </span>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card subtle className="p-6">
              <Calendar />
            </Card>

            <Card subtle className="p-6 flex flex-col items-center">
              <CircularTimer />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

