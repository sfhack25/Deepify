"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, X } from "lucide-react"
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [difficultyFeedback, setDifficultyFeedback] = useState<Record<number, string>>({})
  const router = useRouter()
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)

  const topicId = params.id
  const quizId = params.quizId
  const quiz = quizzes[quizId as keyof typeof quizzes]

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

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setIsAnswerSubmitted(true)
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setCorrectAnswers((prev) => prev + 1)
      }
    }
  }

  const handleNextQuestion = () => {
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const handleDifficultyFeedback = (difficulty: string) => {
    setDifficultyFeedback((prev) => ({
      ...prev,
      [currentQuestion.id]: difficulty,
    }))
  }

  //const isQuizCompleted = currentQuestionIndex >= quiz.questions.length - 1 && isAnswerSubmitted

  // Update progress when quiz is completed
  useEffect(() => {
    if (currentQuestionIndex >= quiz.questions.length - 1 && isAnswerSubmitted) {
      setIsQuizCompleted(true)
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
    }
  }, [
    isQuizCompleted,
    currentQuestionIndex,
    isAnswerSubmitted,
    correctAnswers,
    quiz.questions.length,
    topicId,
    quizId,
    quiz.topicIndex,
  ])

  const handleFinishQuiz = () => {
    // Redirect to dashboard after completing the quiz
    router.push(`/dashboard/${topicId}`)
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

      {!isQuizCompleted ? (
        <Card className="overflow-hidden">
          <div className="border-b p-6">
            <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isCorrect = isAnswerSubmitted && option === currentQuestion.correctAnswer
                const isIncorrect =
                  isAnswerSubmitted && selectedAnswer === option && option !== currentQuestion.correctAnswer

                return (
                  <div
                    key={option}
                    className={`flex cursor-pointer items-center rounded-md border p-4 transition-colors ${
                      selectedAnswer === option
                        ? isAnswerSubmitted
                          ? isCorrect
                            ? "border-green-500 bg-green-900/20"
                            : "border-red-500 bg-red-900/20"
                          : "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <div className="flex-1">{option}</div>
                    {isAnswerSubmitted && (
                      <div className="ml-2">
                        {isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {isIncorrect && <X className="h-5 w-5 text-red-500" />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {isAnswerSubmitted && (
              <div className="mt-6 border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">How difficult was this question?</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={difficultyFeedback[currentQuestion.id] === "easy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyFeedback("easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={difficultyFeedback[currentQuestion.id] === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyFeedback("medium")}
                  >
                    Med
                  </Button>
                  <Button
                    variant={difficultyFeedback[currentQuestion.id] === "hard" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyFeedback("hard")}
                  >
                    Hard
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted p-4">
            {!isAnswerSubmitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full">
                Next Question
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-900/20 p-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Quiz Completed!</h2>
          <p className="mb-6 text-muted-foreground">
            You got {correctAnswers} out of {quiz.questions.length} questions correct.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                setCurrentQuestionIndex(0)
                setSelectedAnswer(null)
                setIsAnswerSubmitted(false)
                setCorrectAnswers(0)
                setDifficultyFeedback({})
                setIsQuizCompleted(false)
              }}
            >
              Retry Quiz
            </Button>
            <Button variant="outline" onClick={handleFinishQuiz}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

