import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  ArrowRight,
  CalendarDays,
  MoreHorizontal,
  Circle,
  Bell,
  RefreshCw,
  AlertCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/tasks";

const getTaskStatus = (task) => {
  if (task.completed || task.status === "Completed") {
    return "Completed";
  }

  return task.status || "Upcoming";
};

const getTaskDate = (date) => {
  if (!date) return null;

  // Keep date-only values in local time instead of shifting them
  // to the previous or next day because of timezone conversion.
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return new Date(`${date}T12:00:00`);
  }

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatTime = (time) => {
  if (!time) return "No time set";

  const match = String(time).match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!match) return time;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();

  if (period) {
    hours = hours % 12;
    if (period === "PM") hours += 12;
  }

  const formattedDate = new Date();
  formattedDate.setHours(hours, Number(minutes), 0, 0);

  return formattedDate.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (duration) => {
  if (duration === undefined || duration === null || duration === "") {
    return "Duration not set";
  }

  if (typeof duration === "string" && /hour|minute|hr|min|h\b|m\b/i.test(duration)) {
    return duration;
  }

  const minutes = Number(duration);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return String(duration);
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours} ${hours === 1 ? "hour" : "hours"}`;

  return `${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`;
};

const getDurationMinutes = (duration) => {
  if (duration === undefined || duration === null || duration === "") {
    return 0;
  }

  if (typeof duration === "number") {
    return duration > 0 ? duration : 0;
  }

  const value = String(duration).toLowerCase().trim();

  // Supports values such as "2 hours", "30 minutes", and "1h 30m".
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/);

  if (hours || minutes) {
    return (
      (hours ? Number(hours[1]) * 60 : 0) +
      (minutes ? Number(minutes[1]) : 0)
    );
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : 0;
};

const getTaskColor = (task) => {
  const priority = String(task.priority || "").toLowerCase();

  if (priority === "urgent" || priority === "high") return "bg-red-500";
  if (priority === "medium") return "bg-amber-500";

  const category = String(task.category || "").toLowerCase();

  if (category.includes("work")) return "bg-purple-500";
  if (category.includes("personal")) return "bg-green-500";

  return "bg-blue-900";
};

const getDateLabel = (date) => {
  const taskDate = getTaskDate(date);
  if (!taskDate) return "Date not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const normalizedDate = new Date(taskDate);
  normalizedDate.setHours(0, 0, 0, 0);

  if (normalizedDate.getTime() === today.getTime()) return "Today";
  if (normalizedDate.getTime() === tomorrow.getTime()) return "Tomorrow";

  return taskDate.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const fetchTasks = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(API_URL);

      // Supports either an array response or { tasks: [...] }.
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks;

      if (!Array.isArray(taskData)) {
        throw new Error("The server did not return a valid task list.");
      }

      setTasks(taskData);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load your tasks. Check that your backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const { todayTasks, upcomingTasks, completedTasks } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const todayList = [];
    const upcomingList = [];
    const completedList = [];

    tasks.forEach((task) => {
      const taskDate = getTaskDate(task.date);
      const status = getTaskStatus(task);

      if (status === "Completed") {
        completedList.push(task);
      }

      if (!taskDate) return;

      if (
        taskDate >= startOfToday &&
        taskDate < startOfTomorrow
      ) {
        todayList.push(task);
      } else if (
        taskDate >= startOfTomorrow &&
        status !== "Completed"
      ) {
        upcomingList.push(task);
      }
    });

    const sortByDateAndTime = (a, b) => {
      const dateA = getTaskDate(a.date);
      const dateB = getTaskDate(b.date);

      if (!dateA || !dateB) return 0;

      const dateDifference = dateA.getTime() - dateB.getTime();

      if (dateDifference !== 0) return dateDifference;

      return String(a.time || "").localeCompare(String(b.time || ""));
    };

    todayList.sort(sortByDateAndTime);
    upcomingList.sort(sortByDateAndTime);

    return {
      todayTasks: todayList,
      upcomingTasks: upcomingList.slice(0, 5),
      completedTasks: completedList,
    };
  }, [tasks]);

  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const focusMinutes = completedTasks
    .filter((task) => {
      const date = getTaskDate(task.date);
      if (!date) return false;

      const now = new Date();
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    })
    .reduce((total, task) => total + getDurationMinutes(task.duration), 0);

  const formatFocusTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
    if (hours) return `${hours}h`;
    return `${remainingMinutes}m`;
  };

  const weekProgress = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    const dayOfWeek = monday.getDay();

    monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dayTasks = tasks.filter((task) => {
        const taskDate = getTaskDate(task.date);
        return (
          taskDate &&
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });

      const completedCount = dayTasks.filter(
        (task) => getTaskStatus(task) === "Completed"
      ).length;

      return {
        day: date.toLocaleDateString("en-NG", { weekday: "short" }).slice(0, 1),
        value: dayTasks.length
          ? Math.round((completedCount / dayTasks.length) * 100)
          : 0,
        count: completedCount,
        total: dayTasks.length,
      };
    });
  }, [tasks]);

  const weeklyCompleted = weekProgress.reduce(
    (total, day) => total + day.count,
    0
  );

  const weeklyTotal = weekProgress.reduce(
    (total, day) => total + day.total,
    0
  );

  const weeklyRate = weeklyTotal
    ? Math.round((weeklyCompleted / weeklyTotal) * 100)
    : 0;

  const toggleComplete = async (task) => {
    const id = task._id || task.id;

    if (!id) {
      setError("This task has no ID, so it cannot be updated.");
      return;
    }

    const wasCompleted = getTaskStatus(task) === "Completed";
    const completed = !wasCompleted;

    const previousTasks = tasks;

    setUpdatingId(id);
    setError("");

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        (item._id || item.id) === id
          ? {
              ...item,
              completed,
              status: completed ? "Completed" : "Upcoming",
            }
          : item
      )
    );

    try {
      await axios.put(`${API_URL}/${id}`, {
        completed,
        status: completed ? "Completed" : "Upcoming",
      });
    } catch (err) {
      console.error("Failed to update task:", err);
      setTasks(previousTasks);
      setError(
        err.response?.data?.message ||
          "Could not update the task. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      description: "All your tasks",
    },
    {
      title: "Completed",
      value: completedTasks.length,
      icon: CheckCircle2,
      description: `${tasks.length - completedTasks.length} remaining`,
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: CheckCircle2,
      description: "Across all tasks",
    },
    {
      title: "Focus Time",
      value: formatFocusTime(focusMinutes),
      icon: Clock3,
      description: "Completed tasks today",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            {formattedDate}
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {greeting}, Isaiah
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={() => navigate("/create-task")}
            className="flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Loading and error messages */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchTasks(true)}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <RefreshCw size={28} className="mx-auto animate-spin text-blue-800" />
            <p className="mt-3 text-sm text-slate-500">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                      <Icon size={20} />
                    </div>

                    <MoreHorizontal size={18} className="text-slate-400" />
                  </div>

                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Today's Schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Today's Schedule
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""} scheduled for today
                  </p>
                </div>

                <button
                  onClick={() => navigate("/tasks")}
                  className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-900 hover:text-blue-950"
                >
                  View all
                  <ArrowRight size={16} />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                  <CalendarDays size={30} className="mx-auto text-slate-400" />
                  <h3 className="mt-3 font-semibold text-slate-800">
                    Nothing scheduled for today
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a task to plan your day.
                  </p>
                  <button
                    onClick={() => navigate("/create-task")}
                    className="mt-4 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
                  >
                    Create task
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {todayTasks.map((task, index) => {
                    const status = getTaskStatus(task);
                    const completed = status === "Completed";
                    const id = task._id || task.id;

                    return (
                      <div
                        key={id || `${task.title}-${index}`}
                        className="group flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 sm:gap-4"
                      >
                        <div className="w-20 shrink-0 pt-1">
                          <p className="text-xs font-semibold text-slate-500">
                            {formatTime(task.time)}
                          </p>
                        </div>

                        <div className="relative flex flex-col items-center">
                          <div
                            className={`h-3 w-3 rounded-full ${completed ? "bg-green-500" : getTaskColor(task)} ring-4 ring-white`}
                          />
                          {index !== todayTasks.length - 1 && (
                            <div className="absolute top-3 h-full min-h-12 w-px bg-slate-200" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3
                                className={`break-words font-semibold ${
                                  completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {task.title}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatDuration(task.duration)} · {status}
                              </p>

                              {task.category && (
                                <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                  {task.category}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => toggleComplete(task)}
                              disabled={updatingId === id}
                              title={completed ? "Mark as incomplete" : "Mark as completed"}
                              aria-label={completed ? "Mark task as incomplete" : "Mark task as completed"}
                              className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-blue-100 hover:text-blue-900 disabled:opacity-50"
                            >
                              {completed ? (
                                <CheckCircle2 size={21} className="text-green-600" />
                              ) : (
                                <Circle size={21} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Weekly Progress
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tasks completed each day
                  </p>
                </div>

                <span className="font-semibold text-blue-900">
                  {weeklyRate}%
                </span>
              </div>

              <div className="flex h-48 items-end justify-between gap-3 border-b border-slate-100 px-2">
                {weekProgress.map((item, index) => (
                  <div
                    key={`${item.day}-${index}`}
                    title={`${item.count} of ${item.total} tasks completed`}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className={`w-full rounded-t-lg transition ${
                          item.value ? "bg-blue-900 hover:bg-blue-800" : "bg-slate-100"
                        }`}
                        style={{
                          height: `${item.value || 4}%`,
                        }}
                      />
                    </div>

                    <span className="mb-2 text-xs font-medium text-slate-400">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Tasks completed</p>
                  <p className="text-lg font-bold text-slate-900">
                    {weeklyCompleted}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Focus time today</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatFocusTime(focusMinutes)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks and Quick Actions */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Upcoming Tasks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Upcoming Tasks
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    What's coming next
                  </p>
                </div>

                <button
                  onClick={() => navigate("/tasks")}
                  className="shrink-0 text-sm font-semibold text-blue-900 hover:text-blue-950"
                >
                  View all
                </button>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={30} className="mx-auto text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-700">
                    You're all caught up
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    No upcoming tasks found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((task, index) => {
                    const id = task._id || task.id;

                    return (
                      <div
                        key={id || `${task.title}-${index}`}
                        className="flex items-center justify-between gap-3 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <CalendarDays size={18} className="text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-400">
                              {getDateLabel(task.date)} · {formatTime(task.time)}
                            </p>

                            <h3 className="mt-1 break-words font-semibold text-slate-800">
                              {task.title}
                            </h3>
                          </div>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDuration(task.duration)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your day faster
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/create-task")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-900">
                    <Plus size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Create Task
                    </p>
                    <p className="text-xs text-slate-400">
                      Add something to your schedule
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/calendar")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-purple-200 hover:bg-purple-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Open Calendar
                    </p>
                    <p className="text-xs text-slate-400">
                      See your complete schedule
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/notifications")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <Bell size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-400">
                      Check your reminders
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
