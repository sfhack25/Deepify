import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, CheckCircle, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Sample roadmap data - in a real app, this would be generated from the syllabus
const roadmapTopics = [
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
]

export default function Roadmap() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/topics">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Your Study Roadmap</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-8 rounded-lg bg-card p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-card-foreground">Computer Science Fundamentals</h2>
        <p className="mb-6 text-muted-foreground">
          This roadmap covers the essential topics in computer science, from basic concepts to advanced algorithms.
        </p>

        <div className="relative mb-8">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border"></div>

          {roadmapTopics.map((topic, index) => (
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

                <div className="bg-muted p-4">
                  <Link href={`/topics/${topic.id}`}>
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

