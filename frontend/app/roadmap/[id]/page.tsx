"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, BookOpen, CheckCircle, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Sample roadmap data - in a real app, this would be generated from the syllabus
const roadmapTopics = {
  "1": [
    {
      id: 1,
      title: "Introduction to Computer Science",
      description: "Fundamentals and core concepts",
      progress: 100,
      subtopics: ["History of Computing", "Binary and Data Representation", "Basic Algorithms"],
      completed: true,
    },
    {
      id: 2,
      title: "Data Structures",
      description: "Organizing and storing data",
      progress: 65,
      subtopics: ["Arrays and Linked Lists", "Stacks and Queues", "Trees and Graphs"],
      completed: false,
    },
    {
      id: 3,
      title: "Algorithms",
      description: "Problem-solving approaches",
      progress: 30,
      subtopics: ["Sorting Algorithms", "Searching Algorithms", "Dynamic Programming"],
      completed: false,
    },
    {
      id: 4,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and inheritance",
      progress: 0,
      subtopics: ["Classes and Objects", "Inheritance and Polymorphism", "Design Patterns"],
      completed: false,
    },
  ],
  "2": [
    {
      id: 1,
      title: "HTML Fundamentals",
      description: "Structure and semantics",
      progress: 100,
      subtopics: ["Basic HTML", "Semantic Elements", "Forms and Inputs"],
      completed: true,
    },
    {
      id: 2,
      title: "CSS Styling",
      description: "Making websites look good",
      progress: 75,
      subtopics: ["Selectors", "Box Model", "Flexbox and Grid"],
      completed: false,
    },
    {
      id: 3,
      title: "JavaScript Basics",
      description: "Adding interactivity",
      progress: 20,
      subtopics: ["Syntax", "DOM Manipulation", "Events"],
      completed: false,
    },
  ],
  "3": [
    {
      id: 1,
      title: "Basic Data Structures",
      description: "Fundamental data organization",
      progress: 100,
      subtopics: ["Arrays", "Linked Lists", "Stacks and Queues"],
      completed: true,
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      description: "Complex data organization",
      progress: 45,
      subtopics: ["Trees", "Graphs", "Hash Tables"],
      completed: false,
    },
    {
      id: 3,
      title: "Algorithm Analysis",
      description: "Evaluating algorithm efficiency",
      progress: 10,
      subtopics: ["Big O Notation", "Time Complexity", "Space Complexity"],
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
    subtopics: ["Overview", "Key Concepts", "Basic Terminology"],
    completed: false,
  },
  {
    id: 2,
    title: "Fundamentals",
    description: "Core principles and concepts",
    progress: 0,
    subtopics: ["Basic Principles", "Foundational Knowledge", "Essential Skills"],
    completed: false,
  },
  {
    id: 3,
    title: "Advanced Topics",
    description: "Deeper exploration of the subject",
    progress: 0,
    subtopics: ["Specialized Areas", "Complex Concepts", "Practical Applications"],
    completed: false,
  },
]

export default function Roadmap({ params }: { params: { id: string } }) {
  const topicId = params.id
  const [topics, setTopics] = useState<any[]>([])
  const [subjectTitle, setSubjectTitle] = useState<string>("Subject Roadmap")
  const [overallProgress, setOverallProgress] = useState<number>(0)

  // Load progress data from localStorage
  useEffect(() => {
    try {
      const progressDataJSON = localStorage.getItem(`progress_${topicId}`)
      if (progressDataJSON) {
        const progressData = JSON.parse(progressDataJSON)

        // Set overall progress
        setOverallProgress(progressData.overallProgress || 0)

        // If we have topic progress data, use it to update the topics
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

            setTopics(updatedTopics)
          } else {
            // For custom subjects, update the default roadmap with progress data
            const updatedDefaultTopics = [...defaultRoadmap]

            progressData.topics.forEach((topicProgress: any, index: number) => {
              if (topicProgress && index < updatedDefaultTopics.length) {
                updatedDefaultTopics[index].progress = topicProgress.progress || 0
                updatedDefaultTopics[index].completed = topicProgress.completed || false
              }
            })

            setTopics(updatedDefaultTopics)
          }
        }
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }
  }, [topicId])

  // Load subject data and roadmap
  useEffect(() => {
    // First check if it's one of our predefined roadmaps
    if (roadmapTopics[topicId as keyof typeof roadmapTopics]) {
      // Only set topics if we haven't already loaded progress data
      if (topics.length === 0) {
        setTopics(roadmapTopics[topicId as keyof typeof roadmapTopics])
      }

      // Set the subject title based on the predefined topics
      if (topicId === "1") {
        setSubjectTitle("Computer Science Fundamentals")
      } else if (topicId === "2") {
        setSubjectTitle("Web Development")
      } else if (topicId === "3") {
        setSubjectTitle("Data Structures and Algorithms")
      }
      return
    }

    // If not a predefined roadmap, check localStorage for custom subjects
    try {
      const subjectsJSON = localStorage.getItem("subjects")
      if (subjectsJSON) {
        const subjects = JSON.parse(subjectsJSON)
        const customSubject = subjects.find((s: any) => s.id.toString() === topicId)

        if (customSubject) {
          // Use the custom subject title
          setSubjectTitle(customSubject.title)

          // Only set topics if we haven't already loaded progress data
          if (topics.length === 0) {
            setTopics(defaultRoadmap)
          }
        } else {
          // If no custom subject found, use default roadmap
          if (topics.length === 0) {
            setTopics(defaultRoadmap)
          }
        }
      } else {
        // If no subjects in localStorage, use default roadmap
        if (topics.length === 0) {
          setTopics(defaultRoadmap)
        }
      }
    } catch (error) {
      console.error("Error retrieving subject:", error)
      if (topics.length === 0) {
        setTopics(defaultRoadmap)
      }
    }
  }, [topicId, topics.length])

  // Calculate overall progress based on topic progress
  const calculateOverallProgress = () => {
    if (!topics || topics.length === 0) return 0

    const totalProgress = topics.reduce((sum, topic) => sum + topic.progress, 0)
    return Math.round(totalProgress / topics.length)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${topicId}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{subjectTitle} Roadmap</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Overall Progress */}
      <div className="mb-6 rounded-lg bg-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-card-foreground">Overall Progress</h2>
          <span className="text-sm font-medium text-primary">
            {overallProgress > 0 ? overallProgress : calculateOverallProgress()}% complete
          </span>
        </div>
        <Progress value={overallProgress > 0 ? overallProgress : calculateOverallProgress()} className="h-2" />
      </div>

      <div className="mb-8 rounded-lg bg-card p-6 shadow-md">
        <div className="relative mb-8">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border"></div>

          {topics.map((topic, index) => (
            <div key={topic.id} className="relative mb-8 pl-10">
              <div
                className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                  topic.completed ? "bg-green-600" : "bg-primary"
                } text-primary-foreground`}
              >
                {topic.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>

              <Card className="overflow-hidden">
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-card-foreground">{topic.title}</h3>
                    <span className="text-sm text-muted-foreground">{topic.progress}% Complete</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>

                {/* Topic Progress Bar */}
                <div className="px-4 pt-4">
                  <Progress value={topic.progress} className="h-1.5" />
                </div>

                <div className="p-4">
                  <h4 className="mb-2 text-sm font-medium text-card-foreground">Subtopics:</h4>
                  <ul className="space-y-1">
                    {topic.subtopics.map((subtopic: string) => (
                      <li key={subtopic} className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        {subtopic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted p-4">
                  <Link href={`/topics/${topicId}/quiz/p${topic.id}`}>
                    <Button variant="outline" className="w-full">
                      Study This Topic <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

