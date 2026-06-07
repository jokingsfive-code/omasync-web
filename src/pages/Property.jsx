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
} from "lucide-react";
import api from "../api/axios";

export default function Property() {
  const [properties, setProperties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState("");

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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch {
      showToast("error", "Failed to load properties.");
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
      name: property.name || "",
      location: property.location || "",
      price: property.price || "",
      description: property.description || "",
      image: null,
    });

    setImagePreview(property.image_url || null);
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
      property.location?.toLowerCase().includes(keyword) ||
      property.description?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-4 pt-20 md:p-8 md:pt-8 min-h-screen relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at top right, rgba(13,59,102,0.16), transparent 34%), radial-gradient(circle at bottom right, rgba(127,157,177,0.28), transparent 35%), linear-gradient(135deg, #F8FBFF 0%, #EEF5FA 45%, #DFEAF1 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-[520px] h-[260px] bg-white/45 rounded-bl-[160px] pointer-events-none" />
        <div className="absolute top-8 right-[260px] w-40 h-40 rounded-full border-[30px] border-blue-100/50 pointer-events-none hidden md:block" />
        <div className="absolute bottom-12 left-[45%] w-72 h-72 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

        {toast && (
          <div className="fixed top-6 right-4 left-4 md:left-auto md:right-6 z-50">
            <div
              className={`px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
                toast.type === "success"
                  ? "border-green-200 text-green-700"
                  : "border-red-200 text-red-600"
              }`}
            >
              <p className="font-bold">
                {toast.type === "success" ? "Success" : "Action Required"}
              </p>
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="relative z-10 mb-6 md:mb-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 md:gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center shadow-sm shrink-0">
              <Building2 size={28} />
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0D3B66]">
                Properties
              </h1>
              <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-lg">
                Manage units, pricing and property information.
              </p>
            </div>
          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-white/70 shadow-xl rounded-3xl px-5 py-4 flex items-center gap-3 w-full xl:w-[360px]">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property..."
              className="bg-transparent outline-none w-full font-medium text-gray-700"
            />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <div className="xl:col-span-4">
            <div className="bg-white/85 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70 xl:sticky xl:top-8">
              <div className="flex items-center gap-4 mb-6 md:mb-7">
                <div className="w-12 h-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0D3B66] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
                  <Plus size={24} />
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#0D3B66]">
                    {editId ? "Edit Property" : "Add New Property"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Recommended image size 1080 × 1080.
                  </p>
                </div>
              </div>

              <form onSubmit={saveProperty} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Property Photo
                  </label>

                  <label className="block rounded-[24px] md:rounded-[28px] overflow-hidden cursor-pointer border-2 border-dashed border-blue-300 hover:border-[#0D3B66] transition bg-gradient-to-br from-white to-blue-50/40">
                    {imagePreview ? (
                      <div className="relative aspect-square">
                        <img
                          src={imagePreview}
                          alt="Property preview"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/25 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white font-bold">
                          Change Photo
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center text-gray-500 p-6 md:p-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                          <ImagePlus size={36} />
                        </div>

                        <p className="font-bold text-[#0D3B66] text-center">
                          Upload property photo
                        </p>

                        <p className="text-xs mt-2 text-center">
                          JPG, PNG or WEBP up to 4MB
                        </p>

                        <p className="text-xs mt-1 text-center">
                          Best display: 1080 × 1080 square image
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
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Property Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Oma Residence"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Location
                  </label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Alor Setar"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Price / Property Value
                  </label>

                  <div className="flex">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="350000"
                      className="w-full px-5 py-4 rounded-l-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] bg-white"
                    />

                    <div className="px-5 py-4 rounded-r-2xl bg-gray-100 border border-l-0 border-gray-300 font-bold text-gray-500">
                      RM
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Short property description"
                    rows="4"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] bg-white resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#0D3B66] to-blue-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition"
                  >
                    {editId ? "Update Property" : "Add Property"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-4 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="group bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[34px] shadow-xl border border-white/70 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-square bg-[#0D3B66]/10 overflow-hidden">
                    {property.image_url ? (
                      <img
                        src={property.image_url}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full text-[#0D3B66] flex items-center justify-center">
                        <Building2 size={70} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/65 via-transparent to-transparent" />

                    <div className="absolute top-4 right-4 md:top-5 md:right-5 flex gap-2">
                      <button
                        onClick={() => startEdit(property)}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/90 text-[#0D3B66] flex items-center justify-center hover:bg-blue-50 shadow-lg transition"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/90 text-red-500 flex items-center justify-center hover:bg-red-50 shadow-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-[#0D3B66] font-bold text-sm shadow-lg">
                        <Home size={16} />
                        Property Unit
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                          {property.name}
                        </h3>

                        <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm md:text-base">
                          <MapPin size={16} />
                          {property.location}
                        </p>
                      </div>

                      <div className="w-12 h-12 md:w-13 md:h-13 rounded-2xl md:rounded-3xl bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center shrink-0">
                        <Building2 size={24} />
                      </div>
                    </div>

                    <div className="mt-5 md:mt-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-4 md:p-5">
                      <p className="text-sm text-gray-500 font-semibold">
                        Property Value
                      </p>

                      <p className="text-2xl md:text-3xl font-black text-[#0D3B66] mt-1">
                        RM {Number(property.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-5 text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[56px] md:min-h-[64px]">
                      {property.description || "No description provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-xl p-10 md:p-12 text-center border border-white/70">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center">
                  <Building2 size={40} />
                </div>

                <h3 className="text-2xl font-bold text-[#0D3B66] mt-5">
                  No properties found
                </h3>

                <p className="text-gray-500 mt-2">
                  Add your first property or adjust your search keyword.
                </p>
              </div>
            )}

            <div className="mt-6 md:mt-8 bg-gradient-to-r from-white/85 to-blue-50/80 backdrop-blur-xl rounded-[28px] md:rounded-[32px] p-5 md:p-7 shadow-xl border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-blue-100 text-[#0D3B66] flex items-center justify-center shrink-0">
                  <Home size={30} />
                </div>

                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#0D3B66]">
                    Manage all properties in one place
                  </h3>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Upload square 1080 × 1080 images for best display quality.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-[#0D3B66] text-white font-bold text-center">
                {properties.length} Property(s)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}