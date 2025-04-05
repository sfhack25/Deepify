"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Award } from "lucide-react"
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
  const [subjectTitle, setSubjectTitle] = useState<string>("Subject Roadmap")
  const [overallProgress, setOverallProgress] = useState<number>(0)

  // Load progress data from localStorage
  useEffect(() => {
    try {
      const progressDataJSON = localStorage.getItem(`progress_${topicId}`)
      if (progressDataJSON) {
        const progressData = JSON.parse(progressDataJSON)
        setOverallProgress(progressData.overallProgress || 0)
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }
  }, [topicId])

  // Load subject title
  useEffect(() => {
    // Set the subject title based on the predefined topics
    if (topicId === "1") {
      setSubjectTitle("Computer Science Fundamentals")
    } else if (topicId === "2") {
      setSubjectTitle("Web Development")
    } else if (topicId === "3") {
      setSubjectTitle("Data Structures and Algorithms")
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
          }
        }
      } catch (error) {
        console.error("Error retrieving subject:", error)
      }
    }
  }, [topicId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${topicId}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="subtle-gradient-text">{subjectTitle} Roadmap</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Overall Progress */}
      <Card subtle className="mb-6 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary/70" />
            <h2 className="text-lg font-semibold text-card-foreground">Overall Progress</h2>
          </div>
          <span className="text-sm font-medium text-primary/80">{overallProgress}% complete</span>
        </div>
        <Progress value={overallProgress} subtle className="h-2" />

        <div className="mt-6 text-center">
          <p className="text-muted-foreground mb-4">
            The full roadmap is now available directly on your dashboard for easier access.
          </p>
          <Link href={`/dashboard/${topicId}`}>
            <Button variant="subtle">Return to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

