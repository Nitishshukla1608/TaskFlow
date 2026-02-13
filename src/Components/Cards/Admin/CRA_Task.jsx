import React, { useState } from "react";
import { useSelector } from "react-redux";


function CRA_Task() {
  const employees = ["Amit", "Neha", "Rohit", "Pooja", "Suresh"];
  const categories = ["Bug", "Feature", "Improvement", "Research"];
  const priorities = ["High", "Medium", "Low"];

  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  const user = useSelector((state)=> state.auth.user)
 

  const handleAssign = () => {
    console.log({
      taskTitle,
      description,
      completionDate,
      assignedTo,
      category,
      priority,
      status,
      estimatedHours,
    });
    alert("Task Assigned Successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-10">
      <h2 className="text-4xl font-bold text-gray-600 mb-10 text-center">
        Create Task
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Task Title */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task title"
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Assign To */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Assign To
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        {/* Completion Date */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Completion Date
          </label>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Priority</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>



        {/* Estimated Hours */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Estimated Hours
          </label>
          <input
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="Enter hours"
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description (full width) */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Write task description..."
            className="px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Assign Button */}
      <div className="max-w-6xl flex justify-end mt-8 ml-40">
        <button
          onClick={handleAssign}
          className="w-[20%] bg-indigo-600 text-white py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition transform hover:scale-105"
        >
          Assign Task
        </button>
      </div>
    </div>
  );
}

export default CRA_Task;
