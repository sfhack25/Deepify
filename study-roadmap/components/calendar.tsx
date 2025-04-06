import React, { useState, useEffect } from "react";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); // State to track the current date
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const currentDay = new Date().getDate(); // Today's date

  // Generate days for the current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Create empty slots for days before the first day of the month
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);

  // Combine empty days and actual days
  const allDays = [...emptyDays, ...days];

  // State for selected day and tasks
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tasks, setTasks] = useState<{
    [key: number]: {
      id: string;
      description: string;
      timestamp: string;
      month: number;
      year: number;
    }[];
  }>({});
  const [newTask, setNewTask] = useState("");

  // Fetch tasks from the database when the component loads or when the month changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8002/get-tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tasksFromDB = data.tasks;

          // Transform tasks into the format required by the calendar
          const transformedTasks = tasksFromDB.reduce((acc: any, task: any) => {
            const day = task.day;
            if (
              task.month === currentDate.getMonth() + 1 &&
              task.year === currentDate.getFullYear()
            ) {
              if (!acc[day]) acc[day] = [];
              acc[day].push({
                id: task.id,
                description: task.description,
                timestamp: task.timestamp,
                month: task.month,
                year: task.year,
              });
            }
            return acc;
          }, {});

          setTasks(transformedTasks);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [currentDate]); // Re-run when the currentDate changes

  // Handle adding a task
  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedDay) return;

    const taskObject = {
      id: `${selectedDay}-${Date.now()}`, // Unique ID based on day and timestamp
      description: newTask,
      timestamp: new Date().toISOString(), // ISO timestamp
      month: currentDate.getMonth() + 1, // Current month (1-based)
      year: currentDate.getFullYear(), // Current year
    };

    // Update the local state
    setTasks((prevTasks) => ({
      ...prevTasks,
      [selectedDay]: [...(prevTasks[selectedDay] || []), taskObject],
    }));
    setNewTask("");

    // Send the task to the backend
    try {
      const response = await fetch("http://localhost:8002/upload-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: selectedDay,
          tasks: [taskObject], // Send the new task as an array
        }),
      });

      if (response.ok) {
        console.log("Task uploaded successfully!");
      } else {
        console.error("Failed to upload task");
      }
    } catch (error) {
      console.error("Error uploading task:", error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    // Update the local state to remove the task
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[selectedDay!] = updatedTasks[selectedDay!].filter(
        (task) => task.id !== taskId
      );

      // If no tasks remain for the day, remove the day from the tasks object
      if (updatedTasks[selectedDay!]?.length === 0) {
        delete updatedTasks[selectedDay!];
      }

      return updatedTasks;
    });

    // Call the backend to delete the task
    try {
      const response = await fetch(
        `http://localhost:8002/delete-task?task_id=${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Task deleted successfully!");
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Navigate to the previous month
  const handlePrevMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  // Navigate to the next month
  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={handlePrevMonth}
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-card-foreground">
          {currentMonth} {currentYear}
        </h2>
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={handleNextMonth}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={index}
            className="py-1 text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {allDays.map((day, index) => (
          <div
            key={index}
            className={`relative flex h-8 items-center justify-center rounded-full text-sm cursor-pointer ${
              day === currentDay &&
              currentDate.getMonth() === new Date().getMonth()
                ? "bg-yellow-900 font-bold text-yellow-100"
                : day
                ? "hover:bg-secondary"
                : ""
            }`}
            onClick={() => day && setSelectedDay(day)}
          >
            {day}
            {day !== null && tasks[day]?.length > 0 && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500"></span>
            )}
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold dark:text-white">
              Tasks for {currentMonth} {selectedDay}
            </h3>

            <ul className="mb-4 space-y-2">
              {tasks[selectedDay]?.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded bg-gray-100 p-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                >
                  <span>{task.description}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
              {tasks[selectedDay]?.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tasks yet.
                </p>
              )}
            </ul>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 rounded border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Add a task or quiz"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                onClick={handleAddTask}
              >
                Add
              </button>
            </div>

            {/* Close Button */}
            <button
              className="mt-4 w-full rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => setSelectedDay(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
