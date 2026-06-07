import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();

    await api.post("/users", form);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "user",
    });

    fetchUsers();
    alert("User added successfully");
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen p-8 bg-gray-100">
        <h1 className="text-4xl font-bold text-[#0D3B66] mb-2">Users</h1>
        <p className="text-gray-500 mb-8">Add and manage OmaSync users.</p>

        <form
          onSubmit={addUser}
          className="bg-white rounded-3xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <select
            className="border rounded-xl px-4 py-3"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="bg-[#0D3B66] text-white rounded-xl font-bold">
            Add User
          </button>
        </form>

        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0D3B66] text-white">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4 font-semibold">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}