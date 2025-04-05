"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SyllabusInput() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const title = searchParams.get("title") || ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // In a real app, we would process the syllabus here and create a new subject

    // Generate a unique ID for the new subject
    const newId = Date.now()

    // Create the new subject object
    const newSubject = {
      id: newId,
      title: title,
      description: "Newly created subject from syllabus upload",
      lastAccessed: "Just now",
      progress: 0,
    }

    // In a real app, this would be a database call
    try {
      // Get existing subjects from localStorage or use an empty array
      const existingSubjectsJSON = localStorage.getItem("subjects")
      const existingSubjects = existingSubjectsJSON ? JSON.parse(existingSubjectsJSON) : []

      // Add the new subject
      const updatedSubjects = [...existingSubjects, newSubject]

      // Save back to localStorage
      localStorage.setItem("subjects", JSON.stringify(updatedSubjects))

      // Simulate a short delay for the upload process
      setTimeout(() => {
        // Redirect to the new subject's dashboard instead of roadmap
        router.push(`/dashboard/${newId}`)
      }, 1000)
    } catch (error) {
      console.error("Error saving subject:", error)
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/topics">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Upload Syllabus for "{title}"</h1>
        </div>
        <ThemeToggle />
      </div>

      <Card className="mx-auto max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="syllabus-file">Upload a file</Label>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-border p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-2 flex text-sm text-muted-foreground">
                  <label
                    htmlFor="syllabus-file"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                  >
                    <span>Upload a file</span>
                    <Input
                      id="syllabus-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT up to 10MB</p>
                {file && <p className="mt-2 text-sm font-medium text-primary">Selected: {file.name}</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!file || isUploading}>
            {isUploading ? "Processing..." : "Generate Study Roadmap"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

