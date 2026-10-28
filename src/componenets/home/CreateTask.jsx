
import { useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Bell,
  Flag,
  Tag,
  FileText,
  CheckCircle2,
} from "lucide-react";

function CreateTask() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    priority: "Medium",
    category: "Personal",
    reminder: "10",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTask((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!task.title.trim()) {
      newErrors.title = "Task title is required.";
    }

    if (!task.date) {
      newErrors.date = "Please select a date.";
    }

    if (!task.time) {
      newErrors.time = "Please select a start time.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Send task to Express backend
      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title: task.title,
          description: task.description,
          date: task.date,
          time: task.time,
          duration: task.duration,
          priority: task.priority,
          category: task.category,
          reminder: task.reminder,
          status: "Upcoming",
        }
      );

      console.log("Task saved:", response.data);

      alert("Task created successfully!");

      // Reset form after successful save
      setTask({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "60",
        priority: "Medium",
        category: "Personal",
        reminder: "10",
      });

      setErrors({});
    } catch (error) {
      console.error("Error creating task:", error);

      if (error.response) {
        alert(
          error.response.data.message ||
            "Failed to create task."
        );
      } else {
        alert(
          "Unable to connect to the server. Make sure your backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-100";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-900"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Create New Task
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Plan your day and stay on top of your goals.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

            {/* Task Details */}
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Task Details
                  </h2>

                  <p className="text-xs text-slate-500">
                    What do you need to accomplish?
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label
                  htmlFor="title"
                  className={labelStyle}
                >
                  Task Title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Study JavaScript"
                  value={task.title}
                  onChange={handleChange}
                  className={inputStyle}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className={labelStyle}
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Add more details about this task..."
                  value={task.description}
                  onChange={handleChange}
                  className={`${inputStyle} resize-none`}
                />
              </div>
            </div>

            <div className="mb-8 border-t border-slate-100" />

            {/* Schedule */}
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Schedule
                  </h2>

                  <p className="text-xs text-slate-500">
                    Choose when to work on this task.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className={labelStyle}
                  >
                    Date *
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={new Date().toLocaleDateString(
                      "en-CA",
                      {
                        timeZone: "Africa/Lagos",
                      }
                    )}
                    value={task.date}
                    onChange={handleChange}
                    className={inputStyle}
                  />

                  {errors.date && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label
                    htmlFor="time"
                    className={labelStyle}
                  >
                    Start Time *
                  </label>

                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={task.time}
                    onChange={handleChange}
                    className={inputStyle}
                  />

                  {errors.time && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.time}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="duration"
                    className={labelStyle}
                  >
                    <span className="flex items-center gap-2">
                      <Clock3 size={16} />
                      Duration
                    </span>
                  </label>

                  <select
                    id="duration"
                    name="duration"
                    value={task.duration}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="15">
                      15 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      1 hour
                    </option>

                    <option value="90">
                      1 hour 30 minutes
                    </option>

                    <option value="120">
                      2 hours
                    </option>

                    <option value="180">
                      3 hours
                    </option>

                    <option value="240">
                      4 hours
                    </option>
                  </select>
                </div>

                {/* Reminder */}
                <div>
                  <label
                    htmlFor="reminder"
                    className={labelStyle}
                  >
                    <span className="flex items-center gap-2">
                      <Bell size={16} />
                      Remind me
                    </span>
                  </label>

                  <select
                    id="reminder"
                    name="reminder"
                    value={task.reminder}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="0">
                      At start time
                    </option>

                    <option value="5">
                      5 minutes before
                    </option>

                    <option value="10">
                      10 minutes before
                    </option>

                    <option value="15">
                      15 minutes before
                    </option>

                    <option value="30">
                      30 minutes before
                    </option>

                    <option value="60">
                      1 hour before
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8 border-t border-slate-100" />

            {/* Organization */}
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                  <Tag size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Organization
                  </h2>

                  <p className="text-xs text-slate-500">
                    Categorize and prioritize your task.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className={labelStyle}
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={task.category}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Personal">
                      Personal
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Study">
                      Study
                    </option>

                    <option value="Health">
                      Health
                    </option>

                    <option value="Business">
                      Business
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className={labelStyle}
                  >
                    <span className="flex items-center gap-2">
                      <Flag size={16} />
                      Priority
                    </span>
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={task.priority}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Low">
                      Low priority
                    </option>

                    <option value="Medium">
                      Medium priority
                    </option>

                    <option value="High">
                      High priority
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={18} />

                {loading ? "Saving..." : "Create Task"}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Fields marked with * are required.
        </p>
      </div>
    </div>
  );
}

export default CreateTask;
