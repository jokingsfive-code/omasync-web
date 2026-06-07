import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchProperties();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/housekeeping");
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/housekeeping/${id}`, {
        status,
      });

      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(
      (p) => Number(p.id) === Number(propertyId)
    );

    return property ? property.name : "-";
  };

  const pending = tasks.filter((t) => t.status === "Pending");
  const progress = tasks.filter((t) => t.status === "In Progress");
  const ready = tasks.filter((t) => t.status === "Ready");

  const Column = ({
    title,
    color,
    items,
    nextStatus,
  }) => (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-white/70">
      <div className="mb-5">
        <div
          className="w-full h-2 rounded-full mb-4"
          style={{ background: color }}
        />

        <h2 className="text-xl font-bold text-[#0D3B66]">
          {title}
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          {items.length} task(s)
        </p>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-400">
            No tasks
          </div>
        )}

        {items.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900">
                  {task.guest_name}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {getPropertyName(task.property_id)}
                </p>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: color,
                  color: "#fff",
                }}
              >
                {task.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">
                  Checkout:
                </span>{" "}
                <span className="font-semibold">
                  {task.checkout_date}
                </span>
              </div>

              {task.notes && (
                <div className="text-gray-600">
                  {task.notes}
                </div>
              )}
            </div>

            {nextStatus && (
              <button
                onClick={() =>
                  updateStatus(task.id, nextStatus)
                }
                className="mt-4 w-full bg-[#0D3B66] text-white py-2 rounded-xl font-semibold hover:bg-[#092B4A]"
              >
                Move to {nextStatus}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-8 min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0D3B66]">
            Housekeeping
          </h1>

          <p className="text-gray-500 mt-2">
            Manage room cleaning workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-3xl p-6 shadow-xl">
            <p className="text-white/70">
              Pending Cleaning
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {pending.length}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-3xl p-6 shadow-xl">
            <p className="text-white/70">
              In Progress
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {progress.length}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-3xl p-6 shadow-xl">
            <p className="text-white/70">
              Ready Rooms
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {ready.length}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Column
            title="Pending"
            color="#EF4444"
            items={pending}
            nextStatus="In Progress"
          />

          <Column
            title="In Progress"
            color="#3B82F6"
            items={progress}
            nextStatus="Ready"
          />

          <Column
            title="Ready"
            color="#10B981"
            items={ready}
          />
        </div>
      </div>
    </div>
  );
}