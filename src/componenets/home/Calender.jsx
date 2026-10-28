
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CircleDashed,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/tasks";

const statusColors = {
  Completed: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  "In Progress": {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  Upcoming: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
};

function getTaskStatus(task) {
  if (task.completed || task.status === "Completed") {
    return "Completed";
  }

  if (task.status === "In Progress") {
    return "In Progress";
  }

  return "Upcoming";
}

// Keep date keys consistent with dates returned by the API.
function getDateKey(date) {
  if (!date) return "";

  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from your backend.
  useEffect(() => {
    let active = true;

    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;

        const taskList = Array.isArray(data)
          ? data
          : Array.isArray(data.tasks)
          ? data.tasks
          : [];

        if (active) {
          setTasks(taskList);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError("Unable to load tasks. Check your backend.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTasks();

    const interval = setInterval(fetchTasks, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = getDateKey(new Date());
  const selectedKey = getDateKey(selectedDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Return tasks scheduled for a particular day.
  const getTasksForDay = (day) => {
    const dateKey = getDateKey(new Date(year, month, day));

    return tasks.filter(
      (task) => getDateKey(task.date) === dateKey
    );
  };

  const selectedTasks = tasks.filter(
    (task) => getDateKey(task.date) === selectedKey
  );

  const selectedTasksByStatus = {
    Completed: selectedTasks.filter(
      (task) => getTaskStatus(task) === "Completed"
    ),
    "In Progress": selectedTasks.filter(
      (task) => getTaskStatus(task) === "In Progress"
    ),
    Upcoming: selectedTasks.filter(
      (task) => getTaskStatus(task) === "Upcoming"
    ),
  };

  const formatSelectedDate = selectedDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <main className="flex min-h-screen w-full flex-col bg-gray-50 p-3 text-gray-800 sm:p-6 lg:p-8">
      {/* Page heading */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <CalendarDays size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Calendar
            </h1>
            <p className="text-sm text-gray-500">
              Track your tasks by date
            </p>
          </div>
        </div>

        <button
          onClick={goToToday}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Today
        </button>
      </header>

      {/* Calendar */}
      <section className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {currentDate.toLocaleString("en-US", {
                month: "long",
              })}
            </h2>
            <p className="text-sm text-gray-500">{year}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              aria-label="Previous month"
              className="rounded-lg border border-gray-200 p-2.5 hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="rounded-lg border border-gray-200 p-2.5 hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${colors.dot}`}
              />
              <span className="text-gray-600">{status}</span>
            </div>
          ))}
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-gray-500 sm:text-sm"
              >
                <span className="sm:hidden">{day[0]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            )
          )}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }, (_, index) => {
            const day = index - firstDay + 1;

            if (day < 1 || day > daysInMonth) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-20 border-b border-r border-gray-100 sm:min-h-28 lg:min-h-32"
                />
              );
            }

            const date = new Date(year, month, day);
            const dateKey = getDateKey(date);
            const dayTasks = getTasksForDay(day);
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedKey;

            const completedCount = dayTasks.filter(
              (task) => getTaskStatus(task) === "Completed"
            ).length;

            const progressCount = dayTasks.filter(
              (task) => getTaskStatus(task) === "In Progress"
            ).length;

            const upcomingCount = dayTasks.filter(
              (task) => getTaskStatus(task) === "Upcoming"
            ).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                aria-label={`${date.toDateString()}, ${dayTasks.length} tasks`}
                className={`flex min-h-20 min-w-0 flex-col items-center border-b border-r border-gray-100 p-1 text-left transition hover:bg-gray-50 sm:min-h-28 sm:items-start sm:p-2 lg:min-h-32 lg:p-3 ${
                  isSelected ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs sm:h-9 sm:w-9 sm:text-sm ${
                    isToday
                      ? "bg-blue-600 font-bold text-white"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </span>

                {/* Status indicators */}
                {dayTasks.length > 0 && (
                  <div className="mt-2 flex w-full flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1">
                      {completedCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {progressCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      {upcomingCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                      <span className="text-[10px] text-gray-500 sm:text-xs">
                        {dayTasks.length}
                      </span>
                    </div>

                    {/* Task labels on larger screens */}
                    <div className="hidden w-full flex-col gap-1 sm:flex">
                      {[
                        ["Completed", completedCount],
                        ["In Progress", progressCount],
                        ["Upcoming", upcomingCount],
                      ]
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => (
                          <span
                            key={status}
                            className={`truncate rounded px-1 py-0.5 text-[10px] lg:text-xs ${statusColors[status].badge}`}
                          >
                            {count} {status}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <p className="mt-4 text-sm text-gray-500">
            Loading tasks...
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </section>

      {/* Selected date task list */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold">
              Tasks for selected date
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {formatSelectedDate}
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {selectedTasks.length}{" "}
            {selectedTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <CalendarDays
              size={30}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="font-medium text-gray-700">
              No tasks scheduled
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Select another date to view its tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedTasks.map((task) => {
              const status = getTaskStatus(task);
              const colors = statusColors[status];

              const Icon =
                status === "Completed"
                  ? CheckCircle2
                  : status === "In Progress"
                  ? Clock
                  : CircleDashed;

              return (
                <div
                  key={task._id || task.id || task.title}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 sm:p-4"
                >
                  <Icon
                    size={20}
                    className={`mt-0.5 shrink-0 ${
                      status === "Completed"
                        ? "text-green-600"
                        : status === "In Progress"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">
                      {task.title}
                    </p>

                    {task.time && (
                      <p className="mt-1 text-sm text-gray-500">
                        {task.time}
                      </p>
                    )}

                    {task.description && (
                      <p className="mt-1 break-words text-sm text-gray-500">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${colors.badge}`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Calendar;
