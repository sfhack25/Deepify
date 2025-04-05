"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function UploadNotes({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [noteText, setNoteText] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const router = useRouter()
  const topicId = params.id

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would process the notes here
    // For now, just redirect back to the dashboard
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
          <h1 className="text-3xl font-bold text-foreground">Upload Notes</h1>
        </div>
        <ThemeToggle />
      </div>

      <Card className="mx-auto max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              placeholder="e.g., Lecture 1 Notes, Chapter 3 Summary, etc."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-text">Enter Notes Text</Label>
            <Textarea
              id="note-text"
              placeholder="Paste your notes here..."
              rows={10}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">Or upload a file below.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-file">Upload Notes File</Label>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-border p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-2 flex text-sm text-muted-foreground">
                  <label
                    htmlFor="note-file"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                  >
                    <span>Upload a file</span>
                    <Input
                      id="note-file"
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

          <Button type="submit" className="w-full" disabled={!noteTitle || (!noteText && !file)}>
            Generate Quizzes from Notes
          </Button>
        </form>
      </Card>
    </div>
  )
}

