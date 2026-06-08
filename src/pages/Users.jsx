import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  Loader2,
  User,
} from "lucide-react";
import api from "../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(normalizeArray(res.data));
    } catch {
      showToast("error", "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", form);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      fetchUsers();
      showToast("success", "User added successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to add user.");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      showToast("success", "User deleted successfully.");
    } catch {
      showToast("error", "Failed to delete user.");
    }
  };

  const admins = users.filter((user) => user.role === "admin").length;
  const normalUsers = users.filter((user) => user.role !== "admin").length;

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          {toast && (
            <div className="fixed top-5 right-4 left-4 sm:left-auto sm:right-6 z-50">
              <div
                className={`px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
                  toast.type === "success"
                    ? "border-emerald-200 text-emerald-700"
                    : "border-red-200 text-red-600"
                }`}
              >
                <p className="font-black">
                  {toast.type === "success" ? "Success" : "Action Required"}
                </p>
                <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-7">
            <div className="pl-20 sm:pl-0 mb-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center">
                  <UsersIcon size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Users
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Add and manage OmaSync users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 mb-5 sm:mb-6">
            <div className="rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[108px] sm:min-h-[170px] bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <UsersIcon size={17} />
              </div>
              <p className="text-white/75 text-[9px] sm:text-sm mt-3 sm:mt-5">
                Total
              </p>
              <h2 className="text-xl sm:text-4xl font-black mt-0.5">
                {users.length}
              </h2>
            </div>

            <div className="rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[108px] sm:min-h-[170px] bg-gradient-to-br from-emerald-500 to-emerald-700">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <ShieldCheck size={17} />
              </div>
              <p className="text-white/75 text-[9px] sm:text-sm mt-3 sm:mt-5">
                Admin
              </p>
              <h2 className="text-xl sm:text-4xl font-black mt-0.5">
                {admins}
              </h2>
            </div>

            <div className="rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[108px] sm:min-h-[170px] bg-gradient-to-br from-slate-900 to-slate-700">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <User size={17} />
              </div>
              <p className="text-white/75 text-[9px] sm:text-sm mt-3 sm:mt-5">
                User
              </p>
              <h2 className="text-xl sm:text-4xl font-black mt-0.5">
                {normalUsers}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 text-gray-950 flex items-center justify-center">
                <UserPlus size={22} />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                  Add User
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Create login account.
                </p>
              </div>
            </div>

            <form
              onSubmit={addUser}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3"
            >
              <input
                className="h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                className="h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                className="h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              <select
                className="h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <button className="h-12 sm:h-14 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2">
                <UserPlus size={18} />
                Add
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                  User List
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {users.length} account(s)
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-200 text-gray-950 font-black text-sm">
                {users.length}
              </div>
            </div>

            {loading ? (
              <div className="h-[320px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-3" size={32} />
                <p className="text-sm">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-gray-50 rounded-[22px] p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-200 text-gray-700 flex items-center justify-center">
                  <UsersIcon size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-950 mt-5">
                  No users found
                </h3>
                <p className="text-gray-500 mt-2">
                  Add your first user account.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-hidden rounded-[22px] border border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-950 text-white">
                      <tr>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-right p-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-b-0">
                          <td className="p-4 font-black text-gray-950">
                            {user.name}
                          </td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-black capitalize ${
                                user.role === "admin"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-gray-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 font-black hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:hidden">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-[22px] p-4 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-black text-gray-950 truncate">
                            {user.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                            <Mail size={14} />
                            <span className="truncate">{user.email}</span>
                          </p>
                        </div>

                        <span
                          className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-[10px] font-black capitalize ${
                            user.role === "admin"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="mt-4 w-full h-10 rounded-xl bg-red-50 text-red-500 font-black flex items-center justify-center gap-2"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}