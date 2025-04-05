export function Calendar() {
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })
  const currentDay = currentDate.getDate()

  // Generate days for the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Create empty slots for days before the first day of the month
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null)

  // Combine empty days and actual days
  const allDays = [...emptyDays, ...days]

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">Calendar</h2>
        <div className="text-lg font-medium text-card-foreground">{currentMonth}</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="py-1 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {allDays.map((day, index) => (
          <div
            key={index}
            className={`relative flex h-8 items-center justify-center rounded-full text-sm ${
              day === currentDay ? "bg-yellow-900 font-bold text-yellow-100" : day ? "hover:bg-secondary" : ""
            }`}
          >
            {day}
            {day === currentDay && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-yellow-500"></span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center text-xs text-muted-foreground">
        <div className="mr-4 flex items-center">
          <div className="mr-1 h-2 w-2 rounded-full bg-yellow-700"></div>
          <span>Current day</span>
        </div>
      </div>
    </div>
  )
}

