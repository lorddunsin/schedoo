
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock3,
  CalendarDays,
  Flag,
  ListTodo,
  RefreshCw,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/tasks";

const priorityStyles = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-orange-50 text-orange-600",
  Low: "bg-green-50 text-green-600",
  Urgent: "bg-red-100 text-red-700",
};

function getStatus(task) {
  if (task.completed || task.status === "Completed") {
    return "Completed";
  }

  return task.status || "Upcoming";
}

function formatDate(date) {
  if (!date) return "No date";

  // Support dates such as Today, Tomorrow, and Friday too.
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) return date;

  const parsedDate = new Date(`${date.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch tasks saved in MongoDB through Express.
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      // The backend returns an array of tasks.
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load tasks. Check that your backend and database are running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate statistics from real tasks.
  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => getStatus(task) === "Completed"
    ).length;

    const inProgress = tasks.filter(
      (task) => getStatus(task) === "In Progress"
    ).length;

    const upcoming = tasks.filter(
      (task) => getStatus(task) === "Upcoming"
    ).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      upcoming,
    };
  }, [tasks]);

  // Search and filter the fetched tasks.
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter =
        filter === "All" || getStatus(task) === filter;

      const matchesSearch = [
        task.title,
        task.description,
        task.category,
        task.priority,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  // Update completion in MongoDB.
  const toggleComplete = async (task) => {
    const id = task._id || task.id;
    const completed = !(
      task.completed || task.status === "Completed"
    );

    const previousTasks = tasks;

    // Update the UI immediately.
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        (item._id || item.id) === id
          ? {
              ...item,
              completed,
              status: completed
                ? "Completed"
                : "Upcoming",
            }
          : item
      )
    );

    try {
      setUpdatingId(id);

      await axios.put(`${API_URL}/${id}`, {
        completed,
        status: completed ? "Completed" : "Upcoming",
      });
    } catch (err) {
      console.error("Failed to update task:", err);
      setTasks(previousTasks);
      setError("Could not update the task. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete a task from MongoDB.
  const handleDelete = async (task) => {
    const id = task._id || task.id;

    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      setDeletingId(id);
      setError("");

      await axios.delete(`${API_URL}/${id}`);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (item) => (item._id || item.id) !== id
        )
      );

      setOpenMenu(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Could not delete the task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      subtitle: "All your tasks",
      color: "text-slate-900",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      subtitle: "Currently working",
      color: "text-blue-900",
    },
    {
      title: "Completed",
      value: stats.completed,
      subtitle: "Finished tasks",
      color: "text-green-600",
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      subtitle: "Tasks remaining",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and organize all your tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/create-task";
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-950"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Dynamic statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>
            <h2 className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Tasks container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["All", "In Progress", "Upcoming", "Completed"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filter === item
                        ? "bg-blue-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                <SlidersHorizontal size={16} />
                Reset
              </button>

              <button
                type="button"
                onClick={fetchTasks}
                disabled={loading}
                title="Refresh tasks"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchTasks}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-blue-900" />
            <p className="text-sm">Loading your tasks...</p>
          </div>
        ) : (
          <>
            {/* Task list */}
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const id = task._id || task.id;
                const status = getStatus(task);
                const completed = status === "Completed";

                return (
                  <div
                    key={id}
                    className="group p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        disabled={updatingId === id}
                        onClick={() => toggleComplete(task)}
                        title={
                          completed
                            ? "Mark as incomplete"
                            : "Mark as completed"
                        }
                        className="mt-1 shrink-0 text-slate-300 transition hover:text-blue-900 disabled:opacity-50"
                      >
                        {completed ? (
                          <CheckCircle2
                            size={22}
                            className="text-blue-900"
                          />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                          <div>
                            <h3
                              className={`font-semibold ${
                                completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                              {task.description || "No description provided."}
                            </p>
                          </div>

                          <div className="relative self-start">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === id ? null : id
                                )
                              }
                              className="text-slate-400 transition hover:text-slate-700"
                              aria-label="Task actions"
                            >
                              <MoreHorizontal size={20} />
                            </button>

                            {openMenu === id && (
                              <div className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                <button
                                  type="button"
                                  disabled={deletingId === id}
                                  onClick={() => handleDelete(task)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <Trash2 size={15} />
                                  {deletingId === id
                                    ? "Deleting..."
                                    : "Delete task"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Task details */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarDays size={14} />
                            {formatDate(task.date)}
                          </span>

                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock3 size={14} />
                            {task.time || "No time"}
                          </span>

                          {task.duration && (
                            <span className="text-xs text-slate-500">
                              {Number(task.duration) >= 60
                                ? `${Math.floor(Number(task.duration) / 60)}h${
                                    Number(task.duration) % 60
                                      ? ` ${Number(task.duration) % 60}m`
                                      : ""
                                  }`
                                : `${task.duration} min`}
                            </span>
                          )}

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {task.category || "Personal"}
                          </span>

                          <span
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              priorityStyles[task.priority] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Flag size={12} />
                            {task.priority || "Medium"}
                          </span>

                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              completed
                                ? "bg-green-50 text-green-700"
                                : status === "In Progress"
                                  ? "bg-blue-50 text-blue-900"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>

                          {task.reminder !== undefined && (
                            <span className="text-xs text-slate-400">
                              Reminder:{" "}
                              {Number(task.reminder) === 0
                                ? "At start"
                                : `${task.reminder} min before`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                  <ListTodo size={26} />
                </div>

                <h3 className="font-semibold text-slate-800">
                  {tasks.length === 0
                    ? "No tasks yet"
                    : "No tasks found"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {tasks.length === 0
                    ? "Create your first task to start organizing your day."
                    : "Try another search or change your status filter."}
                </p>

                {tasks.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/create-task";
                    }}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-950"
                  >
                    <Plus size={17} />
                    Create your first task
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {!loading && tasks.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
