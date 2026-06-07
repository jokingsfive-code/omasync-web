import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Building2,
  Plus,
  ImagePlus,
  Search,
  Home,
  MapPin,
  Loader2,
  X,
} from "lucide-react";
import api from "../api/axios";

export default function Property() {
  const [properties, setProperties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    price: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.properties)) return payload.properties;
    return [];
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/properties");
      setProperties(normalizeArray(res.data));
    } catch {
      showToast("error", "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      price: "",
      description: "",
      image: null,
    });

    setImagePreview(null);
    setEditId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const saveProperty = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast("error", "Please enter property name.");
      return;
    }

    if (!form.location.trim()) {
      showToast("error", "Please enter location.");
      return;
    }

    try {
      const payload = new FormData();

      payload.append("name", form.name);
      payload.append("location", form.location);
      payload.append("price", form.price || "");
      payload.append("description", form.description || "");

      if (form.image) {
        payload.append("image", form.image);
      }

      if (editId) {
        payload.append("_method", "PUT");

        await api.post(`/properties/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        showToast("success", "Property updated successfully.");
      } else {
        await api.post("/properties", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        showToast("success", "Property added successfully.");
      }

      resetForm();
      setShowForm(false);
      fetchProperties();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to save property."
      );
    }
  };

  const startEdit = (property) => {
    setEditId(property.id);

    setForm({
      name: property.name || property.property_name || "",
      location: property.location || "",
      price: property.price || "",
      description: property.description || "",
      image: null,
    });

    setImagePreview(property.image_url || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProperty = async (id) => {
    if (!confirm("Delete this property?")) return;

    try {
      await api.delete(`/properties/${id}`);
      fetchProperties();
      showToast("success", "Property deleted successfully.");
    } catch {
      showToast("error", "Failed to delete property.");
    }
  };

  const filteredProperties = properties.filter((property) => {
    const keyword = search.toLowerCase();

    return (
      property.name?.toLowerCase().includes(keyword) ||
      property.property_name?.toLowerCase().includes(keyword) ||
      property.location?.toLowerCase().includes(keyword) ||
      property.description?.toLowerCase().includes(keyword)
    );
  });

  const PropertyForm = () => (
    <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
            <Plus size={22} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              {editId ? "Edit Property" : "Add Property"}
            </h2>
            <p className="text-sm text-gray-500">
              Upload square image for best display.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeForm}
          className="xl:hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={saveProperty} className="space-y-5">
        <div>
          <label className="block text-sm font-black mb-2 text-gray-900">
            Property Photo
          </label>

          <label className="block rounded-[26px] overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-gray-400 transition bg-gray-50">
            {imagePreview ? (
              <div className="relative aspect-[4/3] sm:aspect-square">
                <img
                  src={imagePreview}
                  alt="Property preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white font-black">
                  Change Photo
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] sm:aspect-square flex flex-col items-center justify-center text-gray-500 p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mb-4">
                  <ImagePlus size={34} />
                </div>

                <p className="font-black text-gray-950 text-center">
                  Upload property photo
                </p>

                <p className="text-xs mt-2 text-center">
                  JPG, PNG or WEBP. Recommended 1080 × 1080.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-black mb-2 text-gray-900">
            Property Name
          </label>

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Oma Residence"
            className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="block text-sm font-black mb-2 text-gray-900">
            Location
          </label>

          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Alor Setar"
            className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="block text-sm font-black mb-2 text-gray-900">
            Price / Property Value
          </label>

          <div className="flex">
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="350000"
              className="w-full h-14 px-4 rounded-l-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
            />

            <div className="h-14 px-5 rounded-r-2xl bg-gray-100 border border-l-0 border-gray-200 font-black text-gray-500 flex items-center">
              RM
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-black mb-2 text-gray-900">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short property description"
            rows="4"
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-white text-base font-semibold text-gray-950 outline-none focus:ring-2 focus:ring-black/10 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 h-14 bg-black text-white rounded-2xl font-black hover:bg-gray-800 active:scale-[0.98] transition"
          >
            {editId ? "Update Property" : "Add Property"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-14 px-5 rounded-2xl bg-gray-100 text-gray-900 font-black hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

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

          <div className="mb-5 sm:mb-7">
            <div className="pl-20 sm:pl-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                  <Building2 size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Properties
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Manage units, pricing and property information.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-4 h-14 flex items-center gap-3">
                <Search size={20} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search property..."
                  className="bg-transparent outline-none w-full font-bold text-gray-700"
                />
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="h-14 px-5 rounded-[24px] bg-black text-white font-black flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition"
              >
                <Plus size={19} />
                Add Property
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
            <div
              className={`xl:col-span-4 ${
                showForm ? "block" : "hidden xl:block"
              }`}
            >
              <div className="xl:sticky xl:top-8">
                <PropertyForm />
              </div>
            </div>

            <div className="xl:col-span-8">
              {loading ? (
                <div className="h-[420px] bg-white rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="animate-spin mb-3" size={32} />
                  <p className="text-sm">Loading properties...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {filteredProperties.map((property) => (
                      <div
                        key={property.id}
                        className="group bg-white rounded-[30px] shadow-sm border border-gray-100 hover:shadow-lg transition overflow-hidden"
                      >
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          {property.image_url ? (
                            <img
                              src={property.image_url}
                              alt={property.name || property.property_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full text-gray-400 flex items-center justify-center">
                              <Building2 size={68} />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              onClick={() => startEdit(property)}
                              className="w-10 h-10 rounded-2xl bg-white/95 text-gray-950 flex items-center justify-center hover:bg-gray-100 shadow-lg transition"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => deleteProperty(property.id)}
                              className="w-10 h-10 rounded-2xl bg-white/95 text-red-500 flex items-center justify-center hover:bg-red-50 shadow-lg transition"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-950 font-black text-xs shadow-lg">
                              <Home size={15} />
                              Property Unit
                            </div>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight truncate">
                                {property.name || property.property_name}
                              </h3>

                              <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm">
                                <MapPin size={16} />
                                <span className="truncate">
                                  {property.location || "-"}
                                </span>
                              </p>
                            </div>

                            <div className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-950 flex items-center justify-center shrink-0">
                              <Building2 size={22} />
                            </div>
                          </div>

                          <div className="mt-5 rounded-[24px] bg-gray-50 border border-gray-100 p-4">
                            <p className="text-xs text-gray-500 font-bold">
                              Property Value
                            </p>

                            <p className="text-2xl font-black text-gray-950 mt-1">
                              RM {Number(property.price || 0).toLocaleString()}
                            </p>
                          </div>

                          <p className="mt-5 text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[58px]">
                            {property.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProperties.length === 0 && (
                    <div className="bg-white rounded-[30px] shadow-sm p-10 text-center border border-gray-100">
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 text-gray-700 flex items-center justify-center">
                        <Building2 size={38} />
                      </div>

                      <h3 className="text-2xl font-black text-gray-950 mt-5">
                        No properties found
                      </h3>

                      <p className="text-gray-500 mt-2">
                        Add your first property or adjust your search keyword.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 bg-white rounded-[30px] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-3xl bg-gray-100 text-gray-950 flex items-center justify-center shrink-0">
                        <Home size={28} />
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-950">
                          Manage all properties in one place
                        </h3>
                        <p className="text-gray-500 mt-1 text-sm">
                          Upload square 1080 × 1080 images for best display quality.
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3 rounded-2xl bg-black text-white font-black text-center">
                      {properties.length} Property(s)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}