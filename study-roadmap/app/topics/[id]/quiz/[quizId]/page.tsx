"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, X, RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"

// Sample quiz data - in a real app, this would be generated from the syllabus
const quizzes = {
  p1: {
    title: "Pre-Lecture Quiz - Computer Science",
    description: "Test your knowledge of computer science fundamentals",
    topicIndex: 0, // Maps to the first topic in the roadmap
    questions: [
      {
        id: 1,
        question: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Processor Utility",
          "Central Program Unit",
        ],
        correctAnswer: "Central Processing Unit",
      },
      {
        id: 2,
        question: "Which of the following is NOT a programming paradigm?",
        options: [
          "Object-Oriented Programming",
          "Functional Programming",
          "Procedural Programming",
          "Analytical Programming",
        ],
        correctAnswer: "Analytical Programming",
      },
      {
        id: 3,
        question: "What is the binary representation of the decimal number 10?",
        options: ["1010", "1000", "1100", "1001"],
        correctAnswer: "1010",
      },
    ],
  },
  p2: {
    title: "Pre-Lecture Quiz - Programming",
    description: "Basic programming concepts and syntax",
    topicIndex: 1, // Maps to the second topic in the roadmap
    questions: [
      {
        id: 1,
        question: "Which data type is used to store whole numbers in most programming languages?",
        options: ["Integer", "Float", "String", "Boolean"],
        correctAnswer: "Integer",
      },
      {
        id: 2,
        question: "What is the purpose of a loop in programming?",
        options: [
          "To repeat a block of code multiple times",
          "To store data in memory",
          "To connect to a database",
          "To display output to the user",
        ],
        correctAnswer: "To repeat a block of code multiple times",
      },
    ],
  },
  p3: {
    title: "Pre-Lecture Quiz - Algorithms",
    description: "Understanding algorithm basics",
    topicIndex: 2, // Maps to the third topic in the roadmap
    questions: [
      {
        id: 1,
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: "O(log n)",
      },
      {
        id: 2,
        question: "Which sorting algorithm has the worst case time complexity of O(n²)?",
        options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"],
        correctAnswer: "Bubble Sort",
      },
    ],
  },
  p4: {
    title: "Pre-Lecture Quiz - OOP",
    description: "Object-oriented programming concepts",
    topicIndex: 3, // Maps to the fourth topic in the roadmap
    questions: [
      {
        id: 1,
        question: "What is encapsulation in OOP?",
        options: [
          "Bundling data and methods that operate on that data",
          "Creating multiple instances of a class",
          "Inheriting properties from a parent class",
          "Overriding methods in a subclass",
        ],
        correctAnswer: "Bundling data and methods that operate on that data",
      },
      {
        id: 2,
        question: "Which OOP principle allows a class to inherit properties from another class?",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        correctAnswer: "Inheritance",
      },
    ],
  },
}

export default function QuizPage({ params }: { params: { id: string; quizId: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [difficultyFeedback, setDifficultyFeedback] = useState<Record<number, string>>({})
  const router = useRouter()
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)

  const topicId = params.id
  const quizId = params.quizId
  const quiz = quizzes[quizId as keyof typeof quizzes]

  // Check if we've reached the end of the quiz
  useEffect(() => {
    if (quiz && currentQuestionIndex >= quiz.questions.length) {
      setIsQuizCompleted(true)
    }
  }, [currentQuestionIndex, quiz])

  // Handle quiz completion and progress update
  useEffect(() => {
    if (!isQuizCompleted) return

    // Calculate the percentage of correct answers
    const scorePercentage = Math.round((correctAnswers / quiz.questions.length) * 100)

    try {
      // Get existing progress data or initialize new object
      const progressDataJSON = localStorage.getItem(`progress_${topicId}`)
      const progressData = progressDataJSON
        ? JSON.parse(progressDataJSON)
        : {
            topics: [],
            quizzes: {},
            overallProgress: 0,
          }

      // Update the quiz completion status
      progressData.quizzes[quizId] = {
        completed: true,
        score: scorePercentage,
        timestamp: new Date().toISOString(),
      }

      // Update the topic progress
      if (!progressData.topics[quiz.topicIndex]) {
        progressData.topics[quiz.topicIndex] = { progress: 0, completed: false }
      }

      // Set topic progress based on quiz score
      progressData.topics[quiz.topicIndex].progress = scorePercentage
      progressData.topics[quiz.topicIndex].completed = scorePercentage >= 70 // Consider completed if score is 70% or higher

      // Calculate overall progress
      const completedTopics = progressData.topics.filter((t: any) => t && t.completed).length
      const totalTopics = Object.keys(quizzes).length
      progressData.overallProgress = Math.round((completedTopics / totalTopics) * 100)

      // Save updated progress data
      localStorage.setItem(`progress_${topicId}`, JSON.stringify(progressData))

      console.log("Progress updated:", progressData)
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }, [isQuizCompleted, correctAnswers, quiz?.questions?.length, topicId, quizId, quiz?.topicIndex, quiz])

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Quiz not found</h1>
        <Link href={`/dashboard/${topicId}`}>
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const currentQuestion =
    quiz && currentQuestionIndex < quiz.questions.length ? quiz.questions[currentQuestionIndex] : null
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  // Toggle card flip
  const toggleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped)
  }

  // Handle difficulty rating selection
  const handleDifficultyFeedback = (difficulty: string) => {
    // Record the difficulty feedback
    setDifficultyFeedback((prev) => ({
      ...prev,
      [currentQuestion.id]: difficulty,
    }))

    // If the user got the answer right (based on their self-assessment), increment the counter
    if (difficulty === "easy" || difficulty === "medium") {
      setCorrectAnswers((prev) => prev + 1)
    }

    // Move to the next question
    setCurrentQuestionIndex((prev) => prev + 1)
    // Reset card to front side for the next question
    setIsCardFlipped(false)
  }

  const handleFinishQuiz = () => {
    // Redirect to dashboard after completing the quiz
    router.push(`/dashboard/${topicId}`)
  }

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0)
    setIsCardFlipped(false)
    setCorrectAnswers(0)
    setDifficultyFeedback({})
    setIsQuizCompleted(false)
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
          <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">{quiz.description}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span>{correctAnswers} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!isQuizCompleted && currentQuestion ? (
        <div className="perspective-1000 w-full">
          <div
            className={`relative w-full transition-transform duration-500 transform-style-preserve-3d ${
              isCardFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
              height: "300px",
            }}
          >
            {/* Front of card (Question) */}
            <Card
              className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden cursor-pointer"
              style={{ backfaceVisibility: "hidden" }}
              onClick={toggleCardFlip}
            >
              <div className="flex-1 flex items-center justify-center">
                <h2 className="text-xl font-medium text-center">{currentQuestion.question}</h2>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-4">Click card to see answer</div>
            </Card>

            {/* Back of card (Answer) */}
            <Card
              className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden rotate-y-180"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium mb-4">Answer:</h3>
                <p className="text-xl font-bold text-primary">{currentQuestion.correctAnswer}</p>

                <Button variant="ghost" size="sm" className="mt-4 flex items-center gap-1" onClick={toggleCardFlip}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Flip back to question
                </Button>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h3 className="mb-4 text-sm font-medium text-center">Rate your knowledge:</h3>
                <div className="flex justify-center space-x-6">
                  <button
                    className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    onClick={() => handleDifficultyFeedback("dont-know")}
                  >
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                    <span className="text-xs">Don't know</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    onClick={() => handleDifficultyFeedback("hard")}
                  >
                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-yellow-500" />
                    </div>
                    <span className="text-xs">Hard</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    onClick={() => handleDifficultyFeedback("medium")}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-orange-500" />
                    </div>
                    <span className="text-xs">Medium</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    onClick={() => handleDifficultyFeedback("easy")}
                  >
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="text-xs">Easy</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-900/20 p-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Quiz Completed!</h2>
          <p className="mb-6 text-muted-foreground">
            You got {correctAnswers} out of {quiz?.questions?.length || 0} questions correct.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleRetryQuiz}>Retry Quiz</Button>
            <Button variant="outline" onClick={handleFinishQuiz}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

