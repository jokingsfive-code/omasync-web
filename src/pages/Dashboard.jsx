import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalValue = properties.reduce((sum, property) => {
    return sum + Number(property.price || 0);
  }, 0);

  const latestProperty = properties[properties.length - 1];

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-2">
          Dashboard
        </h1>

        <p className="text-gray-500 mb-6">
          Overview sistem OmaSync
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Total Properties</h2>
            <p className="text-3xl font-bold">
              {properties.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Total Value</h2>
            <p className="text-2xl font-bold">
              RM {totalValue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Status</h2>
            <p className="text-green-500 font-bold">
              Active
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">System</h2>
            <p className="font-bold">
              OmaSync Running
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
              Latest Property
            </h2>

            {latestProperty ? (
              <div>
                <h3 className="text-lg font-semibold">
                  {latestProperty.name}
                </h3>
                <p className="text-gray-500">
                  {latestProperty.location}
                </p>
                <p className="mt-2 font-semibold">
                  RM {Number(latestProperty.price || 0).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                No property yet
              </p>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
              Quick Actions
            </h2>

            <div className="flex flex-col gap-3">
              <a
                href="/properties"
                className="bg-gray-900 text-white px-4 py-2 rounded text-center"
              >
                Manage Properties
              </a>

              <a
                href="/calendar"
                className="bg-gray-200 px-4 py-2 rounded text-center"
              >
                Open Calendar
              </a>

              <a
                href="/finance"
                className="bg-gray-200 px-4 py-2 rounded text-center"
              >
                View Finance
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Properties
          </h2>

          {properties.length === 0 ? (
            <p className="text-gray-500">No properties found.</p>
          ) : (
            properties.map((p) => (
              <div key={p.id} className="border-b p-3">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-gray-500">{p.location}</p>
                <p>RM {Number(p.price || 0).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}