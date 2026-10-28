import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Bell, X, Clock3, CheckCircle2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/tasks";
const CHECK_INTERVAL = 15_000;
const REMINDER_MINUTES = 10;

function getStartTime(task) {
  if (!task.date || !task.time) return null;

  const dateString =
    typeof task.date === "string"
      ? task.date.slice(0, 10)
      : new Date(task.date).toISOString().slice(0, 10);

  const match = String(task.time)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period) {
    hours %= 12;
    if (period === "PM") hours += 12;
  }

  if (hours > 23 || minutes > 59) return null;

  return new Date(
    `${dateString}T${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:00+01:00`
  );
}

function getDurationMinutes(duration) {
  if (typeof duration === "number") {
    return duration > 0 ? duration : 0;
  }

  if (duration === undefined || duration === null || duration === "") {
    return 0;
  }

  const value = String(duration).toLowerCase().trim();
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
}

function wasNotified(key) {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function saveNotified(key) {
  try {
    localStorage.setItem(key, "true");
  } catch {
    // In-app notifications can still work if storage is unavailable.
  }
}

export default function TaskReminderService() {
  const [alert, setAlert] = useState(null);
  const [permission, setPermission] = useState(
    typeof window !== "undefined" &&
      "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  };

  const notify = useCallback((task, type, message) => {
    const id = task._id || task.id;
    if (!id) return;

    const key = `smarttask-${type}-${id}`;

    if (wasNotified(key)) return;

    saveNotified(key);
    setAlert({
      id: `${id}-${type}`,
      title: task.title,
      message,
      type,
    });

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("SmartTask", {
          body: `${task.title}: ${message}`,
          tag: key,
        });
      } catch (error) {
        console.error("Browser notification error:", error);
      }
    }
  }, []);

  const checkTasks = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      const tasks = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks;

      if (!Array.isArray(tasks)) return;

      const now = new Date();

      for (const task of tasks) {
        const id = task._id || task.id;
        if (!id) continue;

        const status =
          task.completed || task.status === "Completed"
            ? "Completed"
            : task.status || "Upcoming";

        if (status === "Completed") continue;

        const start = getStartTime(task);
        if (!start) continue;

        const minutesUntilStart = (start.getTime() - now.getTime()) / 60_000;
        const duration = getDurationMinutes(task.duration);
        const end = new Date(start.getTime() + duration * 60_000);

        // A reminder is sent only if the reminder option was enabled.
        if (
          task.reminder &&
          minutesUntilStart <= REMINDER_MINUTES &&
          minutesUntilStart > 0
        ) {
          notify(
            task,
            "before",
            `Your task starts in about ${Math.ceil(minutesUntilStart)} minute(s).`
          );
        }

        // Alert when the scheduled start time is reached.
        if (minutesUntilStart <= 0 && now < new Date(start.getTime() + 60_000)) {
          notify(task, "start", "It's time to start your task!");
        }

        // Notify once when the scheduled duration ends.
        if (duration > 0 && now >= end) {
          notify(
            task,
            "end",
            "Your scheduled task time has ended. Mark it complete if you're finished."
          );
        }
      }
    } catch (error) {
      // Don't interrupt the rest of the app if the API is temporarily unavailable.
      console.error("SmartTask reminder check failed:", error);
    }
  }, [notify]);

  useEffect(() => {
    checkTasks();

    const intervalId = window.setInterval(checkTasks, CHECK_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [checkTasks]);

  return (
    <>
      {permission !== "granted" && permission !== "unsupported" && (
        <button
          onClick={enableNotifications}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
        >
          <Bell size={18} />
          Enable notifications
        </button>
      )}

      {permission === "unsupported" && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          Browser notifications are not supported here.
        </div>
      )}

      {alert && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] w-[min(92vw,380px)] rounded-2xl border border-blue-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
              {alert.type === "end" ? (
                <CheckCircle2 size={20} />
              ) : (
                <Clock3 size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
            </div>

            <button
              onClick={() => setAlert(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}