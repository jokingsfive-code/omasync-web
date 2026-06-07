import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  Wallet,
  PlusCircle,
  Trash2,
  Wrench,
  Wifi,
  BrushCleaning,
} from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    property_id: "",
    category: "Cleaning",
    description: "",
    amount: "",
    expense_date: "",
  });

  useEffect(() => {
    fetchExpenses();
    fetchProperties();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch {
      showToast("error", "Failed to load expenses.");
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch {
      console.log("Property load failed");
    }
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    try {
      await api.post("/expenses", form);

      setForm({
        property_id: "",
        category: "Cleaning",
        description: "",
        amount: "",
        expense_date: "",
      });

      fetchExpenses();

      showToast("success", "Expense added successfully.");
    } catch {
      showToast("error", "Failed to add expense.");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete expense?")) return;

    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();

      showToast("success", "Expense deleted.");
    } catch {
      showToast("error", "Delete failed.");
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const thisMonthExpenses = expenses
    .filter((item) => {
      const date = new Date(item.expense_date);
      const now = new Date();

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const getPropertyName = (id) => {
    const property = properties.find((p) => Number(p.id) === Number(id));

    return property ? property.name : "-";
  };

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
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <div
              className={`px-5 py-4 rounded-2xl shadow-xl ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0D3B66]">
            Expenses
          </h1>

          <p className="text-gray-500 mt-2">
            Track cleaning, maintenance and operational costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-3xl p-6 shadow-xl">
            <Wallet size={30} />

            <p className="mt-4 text-white/80">
              Total Expenses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              RM {totalExpenses.toLocaleString()}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl">
            <Wrench size={30} />

            <p className="mt-4 text-white/80">
              Monthly Expenses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              RM {thisMonthExpenses.toLocaleString()}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E] text-white rounded-3xl p-6 shadow-xl">
            <PlusCircle size={30} />

            <p className="mt-4 text-white/80">
              Records
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {expenses.length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0D3B66] mb-5">
            Add Expense
          </h2>

          <form
            onSubmit={saveExpense}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <select
              value={form.property_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  property_id: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3"
            >
              <option value="">Property</option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3"
            >
              <option>Cleaning</option>
              <option>Maintenance</option>
              <option>Utilities</option>
              <option>Internet</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3"
            />

            <input
              type="date"
              value={form.expense_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  expense_date: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3"
            />

            <button
              className="md:col-span-5 bg-[#0D3B66] text-white py-3 rounded-xl font-semibold hover:bg-[#092B4A]"
            >
              Save Expense
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-[#0D3B66] mb-5">
            Expense Records
          </h2>

          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-gray-50 rounded-2xl p-5 flex justify-between items-center hover:shadow-lg transition"
              >
                <div>
                  <p className="font-bold text-lg">
                    {expense.description}
                  </p>

                  <p className="text-sm text-gray-500">
                    {getPropertyName(expense.property_id)}
                  </p>

                  <p className="text-sm mt-1 text-[#0D3B66]">
                    {expense.category}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">
                      RM {Number(expense.amount).toLocaleString()}
                    </p>

                    <p className="text-sm text-gray-500">
                      {expense.expense_date}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No expenses found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}