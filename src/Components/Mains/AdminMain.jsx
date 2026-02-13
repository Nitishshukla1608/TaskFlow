// AdminMain.js
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminMain() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">
  {user.name.split(" ")[0]}'s Dashboard
</h1>


        {/* Create Task Button */}
        <Link
          to="/adminDashboard/create-task"
          className="flex items-center gap-2 px-6 py-2 
                     bg-indigo-600 text-white 
                     rounded-full 
                     hover:bg-indigo-700 transition 
                     duration-200 ease-in-out"
          title="Create Task"
        >
          <span className="text-sm font-medium">Create</span>
          <span className="text-lg font-bold">+</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

<OverviewCard
  title="Total Tasks"
  value={user?.yourAssignedTasks?.length || 0}
/>

<OverviewCard
  title="In Progress"
  value={
    user?.yourAssignedTasks
      ?.filter(task => task.status === "In Progress")
      .length || 0
  }
/>

<OverviewCard
  title="Completed Tasks"
  value={
    user?.yourAssignedTasks
      ?.filter(task => task.status === "Completed")
      .length || 0
  }
/>

<OverviewCard title="Employees" value="20" />

</div>


      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Assigned Tasks
          </h2>
          <ul className="space-y-3 text-sm max-h-[360px] overflow-y-auto custom-scrollbar">
  {user?.yourAssignedTasks?.map((item, index) => (
    <TaskItem
      key={index}
      task={item.task}
      employee={item.employee}
      status={item.status}
    />
  ))}
</ul>

        </section>

        {/* Completed Tasks */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Completed Task
          </h2>
          <ul className="space-y-3 text-sm max-h-[360px] overflow-y-auto custom-scrollbar">
  {user?.yourAssignedTasks
    ?.filter(task => task.status === "Completed")
    .map((item, index) => (
      <TaskItem
        key={index}
        task={item.task}
        employee={item.employee}
        status={item.status}
      />
  ))}
</ul>
        </section>



        {/* In Progress */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
             In Progress
          </h2>
          <ul className="space-y-3 text-sm max-h-[360px] overflow-y-auto custom-scrollbar">
  {user?.yourAssignedTasks
    ?.filter(task => task.status === "In Progress")
    .map((item, index) => (
      <TaskItem
        key={index}
        task={item.task}
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
    <div className="bg-white rounded-xl shadow px-4 py-6 h-[120px] w-full flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-semibold text-gray-800 mt-1">
        {value}
      </h3>
    </div>
  );
}

function TaskItem({ task, employee, status }) {
  const statusClasses =
    status === "Completed"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "In Progress"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <li
      className="flex items-start justify-between 
                 p-4 rounded-lg  bg-gray-100
                 hover:bg-white hover:shadow-sm
                 transition-all duration-200"
    >
      {/* Task + Assigned label */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-800 leading-snug">
          {task}
        </p>

        <span className="inline-flex items-center 
                         text-sm text-gray-500">
          Assigned to
          <span className="ml-1 font-semibold text-gray-500">
            {employee}
          </span>
        </span>
      </div>

      {/* Status */}
      <span
        className={`text-xs font-semibold px-3 py-1 
                    rounded-full border whitespace-nowrap ${statusClasses}`}
      >
        {status}
      </span>
    </li>
  );
}



export default AdminMain;
