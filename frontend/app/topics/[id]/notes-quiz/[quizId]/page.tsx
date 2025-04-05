"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, X, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Sample notes quiz data
const notesQuizzes = {
  n1: {
    title: "Algorithm Complexity",
    description: "Test your knowledge of Big O notation from your notes",
    source: "Lecture Notes - Week 3",
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
      {
        id: 3,
        question: "What does space complexity measure?",
        options: [
          "The amount of memory used by an algorithm",
          "The speed of an algorithm",
          "The number of lines of code in an algorithm",
          "The number of operations performed by an algorithm",
        ],
        correctAnswer: "The amount of memory used by an algorithm",
      },
    ],
  },
  n2: {
    title: "Sorting Algorithms",
    description: "Test your knowledge of sorting methods from your notes",
    source: "Textbook Chapter 4 Notes",
    questions: [
      {
        id: 1,
        question: "Which sorting algorithm uses a divide-and-conquer approach?",
        options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
        correctAnswer: "Merge Sort",
      },
      {
        id: 2,
        question: "What is the best case time complexity of Quicksort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(n log n)",
      },
    ],
  },
}

export default function NotesQuizPage({ params }: { params: { id: string; quizId: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [difficultyFeedback, setDifficultyFeedback] = useState<Record<number, string>>({})

  const topicId = params.id
  const quizId = params.quizId
  const quiz = notesQuizzes[quizId as keyof typeof notesQuizzes]

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

  const handleDifficultyFeedback = (questionId: number, difficulty: string) => {
    setDifficultyFeedback((prev) => ({
      ...prev,
      [questionId]: difficulty,
    }))
  }

  const isQuizCompleted = currentQuestionIndex >= quiz.questions.length - 1 && isAnswerSubmitted

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
        <div className="mt-2 flex items-center text-sm text-primary">
          <FileText className="mr-1 h-4 w-4" /> Source: {quiz.source}
        </div>
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
            <div className="space-y-2">
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
                <RadioGroup
                  value={difficultyFeedback[currentQuestion.id] || ""}
                  onValueChange={(value) => handleDifficultyFeedback(currentQuestion.id, value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="text-sm">
                      Easy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-sm">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="text-sm">
                      Hard
                    </Label>
                  </div>
                </RadioGroup>
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
              }}
            >
              Retry Quiz
            </Button>
            <Link href={`/dashboard/${topicId}`}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

