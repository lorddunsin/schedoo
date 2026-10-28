
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Clock,
  CheckCircle2,
  CircleAlert,
  Trash2,
  CheckCheck,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/tasks";

function Notification() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("smarttask-read-notifications") || "[]"
      );
    } catch {
      return [];
    }
  });

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
      } catch {
        if (active) {
          setError("Unable to load notifications. Check your backend.");
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

  const getStatus = (task) => {
    if (task.completed || task.status === "Completed") {
      return "Completed";
    }

    if (task.status === "In Progress") {
      return "In Progress";
    }

    return "Upcoming";
  };

  const notifications = tasks
    .map((task) => {
      const status = getStatus(task);

      const notification = {
        id: String(task._id || task.id || task.title),
        title: task.title || "Untitled task",
        date: task.date,
        time: task.time,
        status,
        description: task.description || "",
        reminder: task.reminder,
      };

      if (status === "Completed") {
        return {
          ...notification,
          type: "completed",
          message: "Task completed",
          icon: CheckCircle2,
          color: "text-green-600",
          background: "bg-green-100",
        };
      }

      if (status === "In Progress") {
        return {
          ...notification,
          type: "progress",
          message: "Task in progress",
          icon: Clock,
          color: "text-blue-600",
          background: "bg-blue-100",
        };
      }

      return {
        ...notification,
        type: "upcoming",
        message: notification.reminder
          ? "Upcoming task with reminder enabled"
          : "Upcoming task",
        icon: CircleAlert,
        color: "text-amber-600",
        background: "bg-amber-100",
      };
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date || ""}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date || ""}T${b.time || "00:00"}`);
      return dateA - dateB;
    });

  const unreadCount = notifications.filter(
    (notification) => !readNotifications.includes(notification.id)
  ).length;

  const markAsRead = (id) => {
    setReadNotifications((previous) => {
      const updated = [...new Set([...previous, id])];

      try {
        localStorage.setItem(
          "smarttask-read-notifications",
          JSON.stringify(updated)
        );
      } catch {
        // Continue if local storage is unavailable.
      }

      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((notification) => notification.id);
    setReadNotifications((previous) => {
      const updated = [...new Set([...previous, ...allIds])];

      try {
        localStorage.setItem(
          "smarttask-read-notifications",
          JSON.stringify(updated)
        );
      } catch {
        // Continue if local storage is unavailable.
      }

      return updated;
    });
  };

  const formatDate = (date) => {
    if (!date) return "Date not set";

    const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return String(date);

    return parsed.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Bell size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep track of your tasks and their status.
            </p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={18} />
          Mark all as read
        </button>
      </header>

      {/* Summary cards */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total notifications</p>
          <h2 className="mt-2 text-3xl font-bold">
            {notifications.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unread</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Reminders enabled</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {tasks.filter(
              (task) => task.reminder && getStatus(task) !== "Completed"
            ).length}
          </h2>
        </div>
      </section>

      {/* Notification list */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-bold sm:text-lg">All notifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Updates from your task list
            </p>
          </div>
          <RefreshCw size={18} className="text-gray-400" />
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={36} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold">No notifications yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your task updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              const isRead = readNotifications.includes(notification.id);

              return (
                <article
                  key={notification.id}
                  className={`flex gap-3 p-4 transition sm:gap-4 sm:p-5 ${
                    isRead ? "bg-white" : "bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notification.background} ${notification.color}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {notification.title}
                      </h3>

                      {!isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>

                    {notification.description && (
                      <p className="mt-1 break-words text-sm text-gray-500">
                        {notification.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatDate(notification.date)}
                      </span>

                      {notification.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {notification.time}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2 py-1 font-medium ${notification.background} ${notification.color}`}
                      >
                        {notification.status}
                      </span>
                    </div>

                    {!isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Notification;
