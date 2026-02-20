import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminMain() {
  // 🔐 From Redux (REALTIME)
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks);

  if (!user) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  /* ---------- DERIVED DATA ---------- */
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const completed = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {user.name?.split(" ")[0]}'s Dashboard
        </h1>

        <Link
          to="/adminDashboard/create-task"
          className="px-6 py-2 bg-indigo-600 text-white rounded-full"
        >
          Create +
        </Link>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard title="Total Tasks" value={user.yourTotal} />
        <OverviewCard title="In Progress" value={inProgress} />
        <OverviewCard title="Completed" value={completed} />
        <OverviewCard title="Employees" value="—" />
      </div>

      {/* Tasks */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold mb-4">
          Assigned Tasks
        </h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                employee={task.employee}
                status={task.status}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function OverviewCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-6 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-semibold">{value}</h3>
    </div>
  );
}

function TaskItem({ title, employee, status }) {
  const color =
    status === "Completed"
      ? "bg-green-200 text-green-700"
      : status === "In Progress"
      ? "bg-yellow-200 text-yellow-700"
      : "bg-gray-200 text-gray-700";

  return (
    <li className="flex justify-between p-4 rounded-lg bg-gray-100">
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-sm font-semibold">
          Assigned to {employee}
        </p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs ${color}`}
      >
        {status}
      </span>
    </li>
  );
}

export default AdminMain;
