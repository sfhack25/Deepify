"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Sample quiz data - in a real app, this would be generated from the syllabus
const topics = {
  "1": {
    title: "Introduction to Computer Science",
    description: "Test your knowledge of computer science fundamentals",
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
  "2": {
    title: "Data Structures",
    description: "Test your knowledge of data structures",
    questions: [
      {
        id: 1,
        question: "Which data structure operates on a LIFO principle?",
        options: ["Queue", "Stack", "Linked List", "Array"],
        correctAnswer: "Stack",
      },
      {
        id: 2,
        question: "What is the time complexity of searching in a balanced binary search tree?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: "O(log n)",
      },
    ],
  },
}

export default function TopicQuiz({ params }: { params: { id: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const topic = topics[params.id as keyof typeof topics]

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <Link href="/roadmap">
          <Button className="mt-4">Back to Roadmap</Button>
        </Link>
      </div>
    )
  }

  const currentQuestion = topic.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / topic.questions.length) * 100

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

  const isQuizCompleted = currentQuestionIndex >= topic.questions.length - 1 && isAnswerSubmitted

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/roadmap">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
            </Button>
          </Link>
          <h2 className="text-2xl font-bold text-foreground">{topic.title}</h2>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">{topic.description}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentQuestionIndex + 1} of {topic.questions.length}
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
            You got {correctAnswers} out of {topic.questions.length} questions correct.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                setCurrentQuestionIndex(0)
                setSelectedAnswer(null)
                setIsAnswerSubmitted(false)
                setCorrectAnswers(0)
              }}
            >
              Retry Quiz
            </Button>
            <Link href="/roadmap">
              <Button variant="outline">Back to Roadmap</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

