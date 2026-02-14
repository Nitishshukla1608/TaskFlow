// AdminMain.js
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminMain() {
  const user = useSelector((state) => state?.auth?.user);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {user?.name?.split(" ")[0]}'s Dashboard
        </h1>

        <Link
          to="/adminDashboard/create-task"
          className="flex items-center gap-2 px-6 py-2 
                     bg-indigo-600 text-white rounded-full 
                     hover:bg-indigo-700 transition"
        >
          <span className="text-sm font-medium">Create</span>
          <span className="text-lg font-bold">+</span>
        </Link>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard
          title="Total Tasks"
          value={user?.yourAssignedTasks?.length || 0}
        />

        <OverviewCard
          title="In Progress"
          value={
            user?.yourAssignedTasks?.filter(
              (task) => task.status === "In Progress"
            ).length || 0
          }
        />

        <OverviewCard
          title="Completed Tasks"
          value={
            user?.yourAssignedTasks?.filter(
              (task) => task.status === "Completed"
            ).length || 0
          }
        />

        <OverviewCard title="Employees" value="20" />
      </div>

      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>
          <ul className="space-y-3">
            {user?.yourAssignedTasks?.map((item, index) => (
              <TaskItem
                key={index}
                title={item.title}
                employee={item.employee}
                status={item.status}
              />
            ))}
          </ul>
        </section>

        {/* Completed Tasks */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          <ul className="space-y-3">
            {user?.yourAssignedTasks
              ?.filter((task) => task.status === "Completed")
              .map((item, index) => (
                <TaskItem
                  key={index}
                  title={item.title}
                  employee={item.employee}
                  status={item.status}
                />
              ))}
          </ul>
        </section>

        {/* In Progress */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <ul className="space-y-3">
            {user?.yourAssignedTasks
              ?.filter((task) => task.status === "In Progress")
              .map((item, index) => (
                <TaskItem
                  key={index}
                  title={item.title}   // ✅ FIXED
                  employee={item.employee}
                  status={item.status}
                />
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function OverviewCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-6 flex flex-col items-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
    </div>
  );
}

function TaskItem({ title, employee, status }) {
  const statusClasses =
    status === "Completed"
      ? "bg-green-200 text-green-700 font-semibold"
      : status === "In Progress"
      ? "bg-yellow-200 text-yellow-700 font-semibold"
      : "bg-gray-100 text-gray-600";

  return (
    <li className="flex justify-between p-4 rounded-lg bg-gray-100 ">
     <div className="flex flex-col items-start text-left w-full">
  <p className="font-light text-sm text-gray-500">
    {title}
  </p>

  <p className="text-sm text-gray-700 font-semibold">
    Assigned to {employee}
  </p>
</div>

      <span
  className={`inline-flex items-center justify-center
              text-xs font-semibold
              h-7 w-28
              rounded-full mt-2
              ${statusClasses}`}
>
  {status}
</span>
    </li>
  );
}

export default AdminMain;
