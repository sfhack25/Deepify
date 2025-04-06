"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Award,
  Calendar,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { api, RoadmapEntry } from "@/lib/api";
import { toast } from "sonner";
import { CircularTimer } from "@/components/circular-timer";
import { Calendar as CalendarComponent } from "@/components/calendar";

export default function Roadmap({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const [subjectTitle, setSubjectTitle] = useState<string>("Subject Roadmap");
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [roadmap, setRoadmap] = useState<RoadmapEntry[]>([]);
  const [topicProgress, setTopicProgress] = useState<
    Array<{ progress: number; completed: boolean }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load roadmap data from API
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const roadmapData = await api.getRoadmap(courseId);
        setRoadmap(roadmapData);

        // Store in localStorage for use in topic pages
        localStorage.setItem(
          `roadmapItems_${courseId}`,
          JSON.stringify(
            roadmapData.map((item, index) => ({
              title: item.topic,
              content: item.assignment,
              index: index + 1,
            }))
          )
        );

        setLoading(false);

        // Refresh progress data after roadmap is loaded
        refreshProgressData();
      } catch (error) {
        console.error("Error fetching roadmap:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Failed to load roadmap data: ${errorMessage}`);
        setLoading(false);
        toast.error(`Failed to load roadmap: ${errorMessage}`);
      }
    };

    fetchRoadmap();
  }, [courseId]);

  // Function to refresh progress data from localStorage
  const refreshProgressData = () => {
    try {
      const progressDataJSON = localStorage.getItem(`progress_${courseId}`);
      if (progressDataJSON) {
        const progressData = JSON.parse(progressDataJSON);
        setOverallProgress(progressData.overallProgress || 0);

        // Load individual topic progress
        if (progressData.topics) {
          setTopicProgress(progressData.topics);
        }
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  };

  // Load progress data from localStorage
  useEffect(() => {
    refreshProgressData();
  }, [courseId]);

  // Load subject title
  useEffect(() => {
    // Check localStorage for custom subjects
    try {
      const subjectsJSON = localStorage.getItem("subjects");
      if (subjectsJSON) {
        const subjects = JSON.parse(subjectsJSON);
        const customSubject = subjects.find((s: any) => s.id === courseId);

        if (customSubject) {
          // Use the custom subject title
          setSubjectTitle(customSubject.title);
        }
      }
    } catch (error) {
      console.error("Error retrieving subject:", error);
    }
  }, [courseId]);

  // Function to generate quizzes if needed
  const handleGenerateQuizzes = async () => {
    try {
      toast.info("Generating quizzes...");
      await api.generatePreQuizzes(courseId);
      toast.success("Quizzes generated successfully!");
    } catch (error) {
      console.error("Error generating quizzes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate quizzes: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${courseId}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="subtle-gradient-text">{subjectTitle} Roadmap</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content - 2/3 width on desktop */}
        <div className="md:col-span-2">
          {/* Overall Progress */}
          <Card className="mb-6 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary/70" />
                <h2 className="text-lg font-semibold text-card-foreground">
                  Overall Progress
                </h2>
              </div>
              <span className="text-sm font-medium text-primary/80">
                {overallProgress}% complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />

            <div className="mt-6 flex justify-center space-x-4">
              <Link href={`/dashboard/${courseId}`}>
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
              <Button onClick={handleGenerateQuizzes}>Generate Quizzes</Button>
            </div>
          </Card>

          {/* Roadmap Content */}
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-pulse">Loading roadmap...</div>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <p className="mt-4 text-destructive">{error}</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {roadmap.map((entry, index) => {
                // Get topic progress if available
                const progress = topicProgress[index] || {
                  progress: 0,
                  completed: false,
                };

                return (
                  <Card
                    key={index}
                    className={`p-6 ${
                      progress.completed
                        ? "border-green-500"
                        : progress.progress > 0
                        ? "border-primary/40"
                        : ""
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold">
                            {entry.topic}
                          </h3>
                          <div className="ml-4 flex items-center text-sm">
                            {progress.completed ? (
                              <span className="text-green-500 flex items-center">
                                <Award className="mr-1 h-4 w-4" /> Completed
                              </span>
                            ) : progress.progress > 0 ? (
                              <span className="text-primary">
                                {progress.progress}% Complete
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>

                        {progress.progress > 0 && !progress.completed && (
                          <div className="mt-2">
                            <Progress
                              value={progress.progress}
                              className="h-1.5"
                            />
                          </div>
                        )}

                        {entry.preQuizPrompt && (
                          <p className="mt-2 text-muted-foreground">
                            {entry.preQuizPrompt}
                          </p>
                        )}
                      </div>
                    </div>

                    {entry.date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {entry.date}
                      </div>
                    )}

                    {entry.assignment && (
                      <div className="mt-4">
                        <div className="flex items-center font-medium">
                          <BookOpen className="mr-2 h-4 w-4 text-primary/70" />
                          Assignment:
                        </div>
                        <p className="ml-6 text-muted-foreground">
                          {entry.assignment}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-3">
                      <Link
                        href={`/topics/${courseId}?topicNumber=${
                          index + 1
                        }&from=roadmap`}
                      >
                        <Button variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Study Content
                        </Button>
                      </Link>
                      <Link
                        href={`/topics/${courseId}/quiz?topicNumber=${
                          index + 1
                        }&from=roadmap`}
                      >
                        <Button size="sm">Take Quiz</Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="md:relative">
          <div className="md:sticky md:top-6 space-y-6">
            {/* Pomodoro Timer */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Study Timer</h2>
              <div className="flex flex-col items-center">
                <CircularTimer />
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Use the Pomodoro technique: 25 minutes of focused work
                  followed by a 5-minute break.
                </p>
              </div>
            </Card>

            {/* Calendar widget */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Study Calendar</h2>
              <CalendarComponent />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
