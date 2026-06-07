import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  Wallet,
  PlusCircle,
  Trash2,
  Wrench,
  ReceiptText,
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
    setTimeout(() => setToast(null), 3000);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-4 pt-20 md:p-8 md:pt-8 min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        {toast && (
          <div className="fixed top-6 right-4 left-4 md:left-auto md:right-6 z-50">
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

        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66]">
            Expenses
          </h1>

          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Track cleaning, maintenance and operational costs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-3xl p-5 md:p-6 shadow-xl">
            <Wallet size={30} />
            <p className="mt-4 text-white/80 text-sm md:text-base">
              Total Expenses
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              RM {totalExpenses.toLocaleString()}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-3xl p-5 md:p-6 shadow-xl">
            <Wrench size={30} />
            <p className="mt-4 text-white/80 text-sm md:text-base">
              Monthly Expenses
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              RM {thisMonthExpenses.toLocaleString()}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E] text-white rounded-3xl p-5 md:p-6 shadow-xl sm:col-span-2 xl:col-span-1">
            <PlusCircle size={30} />
            <p className="mt-4 text-white/80 text-sm md:text-base">Records</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {expenses.length}
            </h2>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 border border-white/70">
          <h2 className="text-xl font-bold text-[#0D3B66] mb-5">
            Add Expense
          </h2>

          <form
            onSubmit={saveExpense}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
          >
            <select
              value={form.property_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  property_id: e.target.value,
                })
              }
              className="border rounded-xl px-4 py-3 bg-white w-full"
            >
              <option value="">Property</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
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
              className="border rounded-xl px-4 py-3 bg-white w-full"
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
              className="border rounded-xl px-4 py-3 w-full"
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
              className="border rounded-xl px-4 py-3 w-full"
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
              className="border rounded-xl px-4 py-3 w-full"
            />

            <button className="md:col-span-2 xl:col-span-5 bg-[#0D3B66] text-white py-3 rounded-xl font-semibold hover:bg-[#092B4A]">
              Save Expense
            </button>
          </form>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-3xl shadow-xl p-4 md:p-6 border border-white/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#0D3B66]">
                Expense Records
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {expenses.length} record(s) found.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 text-red-600 font-bold w-fit">
              <ReceiptText size={18} />
              RM {totalExpenses.toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-gray-50 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:shadow-lg transition"
              >
                <div className="min-w-0">
                  <p className="font-bold text-lg text-gray-900">
                    {expense.description}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {getPropertyName(expense.property_id)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex px-3 py-1 rounded-full bg-[#0D3B66]/10 text-[#0D3B66] text-xs font-bold">
                      {expense.category}
                    </span>

                    <span className="inline-flex px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
                      {formatDate(expense.expense_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5">
                  <div className="md:text-right">
                    <p className="font-bold text-red-600 text-xl">
                      RM {Number(expense.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
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