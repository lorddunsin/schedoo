
import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Palette,
  Clock,
  Save,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
} from "lucide-react";

function Setting() {
  const [settings, setSettings] = useState(() => {
    try {
      return {
        username: localStorage.getItem("smarttask-username") || "",
        email: localStorage.getItem("smarttask-email") || "",
        theme: localStorage.getItem("smarttask-theme") || "light",
        notifications:
          localStorage.getItem("smarttask-notifications") !== "false",
        reminders: localStorage.getItem("smarttask-reminders") !== "false",
        reminderTime: localStorage.getItem("smarttask-reminder-time") || "10",
        weekStarts:
          localStorage.getItem("smarttask-week-start") || "Sunday",
      };
    } catch {
      return {
        username: "",
        email: "",
        theme: "light",
        notifications: true,
        reminders: true,
        reminderTime: "10",
        weekStarts: "Sunday",
      };
    }
  });

  const [saved, setSaved] = useState(false);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("smarttask-username", settings.username);
      localStorage.setItem("smarttask-email", settings.email);
      localStorage.setItem("smarttask-theme", settings.theme);
      localStorage.setItem(
        "smarttask-notifications",
        String(settings.notifications)
      );
      localStorage.setItem(
        "smarttask-reminders",
        String(settings.reminders)
      );
      localStorage.setItem(
        "smarttask-reminder-time",
        settings.reminderTime
      );
      localStorage.setItem("smarttask-week-start", settings.weekStarts);

      setSaved(true);
    } catch {
      setSaved(false);
      window.alert("Unable to save settings in this browser.");
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "tasks", label: "Task preferences", icon: Clock },
  ];

  return (
    <main className="min-h-screen w-full bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
          <Settings size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your SmartTask experience.
          </p>
        </div>
      </header>

      {/* Settings navigation */}
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {sections.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:border-blue-300 hover:bg-blue-50"
          >
            <Icon size={17} />
            {label}
          </a>
        ))}
      </nav>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile */}
        <section
          id="profile"
          className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <User className="text-blue-600" size={21} />
            <div>
              <h2 className="font-bold sm:text-lg">Profile</h2>
              <p className="text-sm text-gray-500">
                Customize your display information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Username
              </span>
              <input
                type="text"
                value={settings.username}
                onChange={(e) =>
                  updateSetting("username", e.target.value)
                }
                placeholder="Enter your username"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Email address
              </span>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  updateSetting("email", e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            These are local display preferences; they do not update a
            server account.
          </p>
        </section>

        {/* Notifications */}
        <section
          id="notifications"
          className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <Bell className="text-blue-600" size={21} />
            <div>
              <h2 className="font-bold sm:text-lg">Notifications</h2>
              <p className="text-sm text-gray-500">
                Choose how you want to be reminded.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">Enable notifications</p>
                <p className="mt-1 text-sm text-gray-500">
                  Allow task updates and notification alerts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  updateSetting("notifications", e.target.checked)
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">Task reminders</p>
                <p className="mt-1 text-sm text-gray-500">
                  Enable reminders before scheduled tasks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.reminders}
                onChange={(e) =>
                  updateSetting("reminders", e.target.checked)
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">Remind me before a task</p>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how early to receive a reminder.
                </p>
              </div>

              <select
                value={settings.reminderTime}
                onChange={(e) =>
                  updateSetting("reminderTime", e.target.value)
                }
                disabled={!settings.reminders}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </label>
          </div>
        </section>

        {/* Appearance */}
        <section
          id="appearance"
          className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <Palette className="text-blue-600" size={21} />
            <div>
              <h2 className="font-bold sm:text-lg">Appearance</h2>
              <p className="text-sm text-gray-500">
                Choose your preferred display theme.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateSetting("theme", value)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  settings.theme === value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={21} />
                <span className="font-medium">{label}</span>
                {settings.theme === value && (
                  <CheckCircle2 size={18} className="ml-auto" />
                )}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            The selected theme is saved, but applying dark or system mode
            across the app requires connecting it to your app's theme
            styles.
          </p>
        </section>

        {/* Task preferences */}
        <section
          id="tasks"
          className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <Clock className="text-blue-600" size={21} />
            <div>
              <h2 className="font-bold sm:text-lg">Task preferences</h2>
              <p className="text-sm text-gray-500">
                Customize your calendar.
              </p>
            </div>
          </div>

          <label className="block max-w-sm">
            <span className="mb-2 block text-sm font-medium">
              First day of the week
            </span>
            <select
              value={settings.weekStarts}
              onChange={(e) =>
                updateSetting("weekStarts", e.target.value)
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
            </select>
          </label>
        </section>

        {/* Save button */}
        <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-500">
            {saved ? "Your settings have been saved." : "Remember to save your changes."}
          </p>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <Save size={18} />
            Save settings
          </button>
        </div>
      </div>
    </main>
  );
}

export default Setting;
