
import React from "react";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Bell,
  Settings,
  Plus,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Tasks",
      icon: ListTodo,
      path: "/tasks",
    },
    {
      name: "Calendar",
      icon: CalendarDays,
      path: "/calendar",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleNewTask = () => {
    navigate("/create-task");
    onClose?.();
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 sm:p-5">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between gap-3 px-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white">
            <ListTodo size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">
              Schedoo
            </h1>
            <p className="text-xs text-slate-400">
              Manage your day
            </p>
          </div>
        </div>

        {/* Close button appears on mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Create task */}
      <button
        onClick={handleNewTask}
        className="mb-6 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
      >
        <Plus size={18} />
        <span>New Task</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-900"
                }`
              }
            >
              <Icon size={19} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Today's progress */}
      <div className="mt-6 shrink-0 border-t border-slate-100 pt-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-400">
            Today's progress
          </p>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[67%] rounded-full bg-blue-900" />
          </div>

          <p className="mt-2 text-xs font-semibold text-slate-600">
            67% completed
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
