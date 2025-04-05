"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, X, FileText, RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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
  // Add dynamic quizzes for each topic
  n3: {
    title: "Data Structures Fundamentals",
    description: "Test your understanding of basic data structures",
    source: "Your uploaded notes",
    questions: [
      {
        id: 1,
        question: "Which data structure follows the LIFO principle?",
        options: ["Queue", "Stack", "Linked List", "Array"],
        correctAnswer: "Stack",
      },
      {
        id: 2,
        question: "What is the primary advantage of a linked list over an array?",
        options: ["Dynamic size allocation", "Faster access time", "Less memory usage", "Simpler implementation"],
        correctAnswer: "Dynamic size allocation",
      },
    ],
  },
  n4: {
    title: "Object-Oriented Programming",
    description: "Test your knowledge of OOP concepts",
    source: "Your uploaded notes",
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

export default function NotesQuizPage({ params }: { params: { id: string; quizId: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [difficultyFeedback, setDifficultyFeedback] = useState<Record<number, string>>({})
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)

  const topicId = params.id
  const quizId = params.quizId
  const quiz = notesQuizzes[quizId as keyof typeof notesQuizzes]

  // Check if we've reached the end of the quiz
  useEffect(() => {
    if (quiz && currentQuestionIndex >= quiz.questions.length) {
      setIsQuizCompleted(true)
    }
  }, [currentQuestionIndex, quiz])

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
            <Link href={`/dashboard/${topicId}`}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

