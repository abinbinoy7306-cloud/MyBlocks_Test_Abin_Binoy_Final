import React from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";

export default function SettingsPage() {
  return (
    <div className="flex h-full">
      {/* Left navigation for Settings sub‑pages */}
      <aside className="w-48 border-r border-gray-200 bg-gray-50 p-4">
        <nav className="space-y-2">
          <NavLink
            to="/admin/settings/api-keys"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-indigo-600 text-white" : "text-gray-700"
              }`
            }
          >
            API Keys
          </NavLink>
          <NavLink
            to="/admin/settings/ai-agents"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-indigo-600 text-white" : "text-gray-700"
              }`
            }
          >
            AI Agents
          </NavLink>
          <NavLink
            to="/admin/settings/dropdowns"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-indigo-600 text-white" : "text-gray-700"
              }`
            }
          >
            Dropdown Manager
          </NavLink>
        </nav>
      </aside>
      {/* Render the selected sub‑page */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}


