import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  Wallet,
  PlusCircle,
  Trash2,
  Wrench,
  ReceiptText,
  Loader2,
} from "lucide-react";

const toInputDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateObject = (value) => {
  if (!value) return null;
  return new Date(`${String(value).slice(0, 10)}T00:00:00`);
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = toInputDate(new Date());

  const [form, setForm] = useState({
    property_id: "",
    category: "Cleaning",
    description: "",
    amount: "",
    expense_date: today,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.expenses)) return payload.expenses;
    if (Array.isArray(payload?.properties)) return payload.properties;
    return [];
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [expenseRes, propertyRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/properties"),
      ]);

      setExpenses(normalizeArray(expenseRes.data));
      setProperties(normalizeArray(propertyRes.data));
    } catch {
      showToast("error", "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    if (!form.property_id) {
      showToast("error", "Please select property.");
      return;
    }

    if (!form.description.trim()) {
      showToast("error", "Please enter description.");
      return;
    }

    if (!form.amount) {
      showToast("error", "Please enter amount.");
      return;
    }

    try {
      await api.post("/expenses", form);

      setForm({
        property_id: "",
        category: "Cleaning",
        description: "",
        amount: "",
        expense_date: today,
      });

      fetchAll();
      showToast("success", "Expense added successfully.");
    } catch {
      showToast("error", "Failed to add expense.");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete expense?")) return;

    try {
      await api.delete(`/expenses/${id}`);
      fetchAll();
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
      if (!item.expense_date) return false;
      const date = new Date(item.expense_date);
      const now = new Date();

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const getPropertyName = (id, propertyObject) => {
    if (propertyObject?.name) return propertyObject.name;
    if (propertyObject?.property_name) return propertyObject.property_name;

    const property = properties.find((p) => Number(p.id) === Number(id));
    return property ? property.name || property.property_name : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(`${String(dateString).slice(0, 10)}T00:00:00`);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fieldClass =
    "h-11 sm:h-14 w-full min-w-0 max-w-full px-4 rounded-2xl border border-gray-200 bg-white text-[16px] font-bold text-gray-900 outline-none appearance-none focus:border-black focus:ring-4 focus:ring-black/5 transition";

  const stats = [
    {
      label: "Total Expenses",
      value: `RM ${totalExpenses.toLocaleString()}`,
      icon: Wallet,
      className: "bg-gradient-to-br from-red-500 to-rose-700",
    },
    {
      label: "This Month",
      value: `RM ${thisMonthExpenses.toLocaleString()}`,
      icon: Wrench,
      className: "bg-gradient-to-br from-orange-500 to-amber-600",
    },
    {
      label: "Records",
      value: expenses.length,
      icon: ReceiptText,
      className: "bg-gradient-to-br from-slate-900 to-black",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8 overflow-x-hidden">
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

          <div className="pl-16 sm:pl-0 mb-4 sm:mb-7">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center">
                <Wallet size={22} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                  Expenses
                </h1>
                <p className="text-sm sm:text-base text-gray-500">
                  Track cleaning, maintenance and operational costs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-5 sm:mb-7">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 text-white shadow-sm min-h-[105px] sm:min-h-[170px] ${stat.className}`}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon size={18} />
                  </div>

                  <p className="text-white/75 text-xs sm:text-sm mt-3 sm:mt-5">
                    {stat.label}
                  </p>

                  <h2 className="text-xl sm:text-3xl font-black mt-1">
                    {stat.value}
                  </h2>
                </div>
              );
            })}
          </div>

          <div className="w-full max-w-full overflow-visible bg-white rounded-[24px] sm:rounded-[34px] border border-gray-100 shadow-sm p-3.5 sm:p-7 mb-5 sm:mb-7">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
                <PlusCircle size={19} />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                  Add Expense
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Record property cost with category and date.
                </p>
              </div>
            </div>

            <form
              onSubmit={saveExpense}
              className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5 sm:gap-3"
            >
              <select
                value={form.property_id}
                onChange={(e) =>
                  setForm({ ...form, property_id: e.target.value })
                }
                className={fieldClass}
              >
                <option value="">Property</option>

                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.property_name}
                  </option>
                ))}
              </select>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className={fieldClass}
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
                  setForm({ ...form, description: e.target.value })
                }
                className={fieldClass}
              />

              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={fieldClass}
              />

              <DatePicker
                selected={toDateObject(form.expense_date)}
                onChange={(date) =>
                  setForm({ ...form, expense_date: toInputDate(date) })
                }
                dateFormat="dd MMM yyyy"
                placeholderText="Expense date"
                wrapperClassName="w-full"
                className={fieldClass}
                popperClassName="omasync-datepicker"
                calendarClassName="omasync-calendar"
              />

              <button className="h-11 sm:h-14 sm:col-span-2 xl:col-span-5 bg-black text-white rounded-2xl font-black text-[16px] active:scale-[0.98] shadow-lg shadow-black/10">
                Save Expense
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[34px] shadow-sm p-3.5 sm:p-7 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                  Expense Records
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {expenses.length} record(s) found.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 text-red-600 font-black w-fit">
                <ReceiptText size={18} />
                RM {totalExpenses.toLocaleString()}
              </div>
            </div>

            {loading ? (
              <div className="h-[260px] bg-gray-50 rounded-[24px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-3" size={30} />
                <p className="text-sm">Loading expenses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-gray-50 rounded-[22px] p-4 sm:p-5 border border-gray-100 hover:bg-white hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-black text-base sm:text-lg text-gray-950 truncate">
                          {expense.description || "Untitled Expense"}
                        </p>

                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {getPropertyName(
                            expense.property_id,
                            expense.property
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="w-10 h-10 shrink-0 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition active:scale-95"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-black/5 text-gray-800 text-xs font-black">
                        {expense.category}
                      </span>

                      <span className="inline-flex px-3 py-1 rounded-full bg-slate-200 text-gray-600 text-xs font-black">
                        {formatDate(expense.expense_date)}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-black uppercase">
                        Amount
                      </p>

                      <p className="font-black text-red-600 text-xl sm:text-2xl">
                        RM {Number(expense.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {expenses.length === 0 && (
                  <div className="xl:col-span-2 text-center py-10 bg-gray-50 rounded-[24px] text-gray-500 font-semibold">
                    No expenses found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}