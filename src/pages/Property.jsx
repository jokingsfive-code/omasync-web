import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Property() {
  const [properties, setProperties] = useState([]);

  const [form, setForm] = useState({
    name: "",
    location: "",
    price: "",
    description: "",
  });

  const [editId, setEditId] = useState(null);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.log("API error:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      price: "",
      description: "",
    });
    setEditId(null);
  };

  const saveProperty = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/properties/${editId}`, form);
        alert("Property berjaya dikemaskini");
      } else {
        await api.post("/properties", form);
        alert("Property berjaya ditambah");
      }

      resetForm();
      fetchProperties();
    } catch (err) {
      console.log("Save error:", err.response?.data || err);
      alert("Gagal simpan property");
    }
  };

  const startEdit = (property) => {
    setEditId(property.id);
    setForm({
      name: property.name || "",
      location: property.location || "",
      price: property.price || "",
      description: property.description || "",
    });
  };

  const deleteProperty = async (id) => {
    const confirmDelete = confirm("Delete property ini?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/properties/${id}`);
      fetchProperties();
      alert("Property berjaya dipadam");
    } catch (err) {
      console.log("Delete error:", err.response?.data || err);
      alert("Gagal delete property");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Property List</h1>

      <form onSubmit={saveProperty} style={{ marginBottom: 30 }}>
        <input
          placeholder="Property name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <br />
        <br />

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <br />
        <br />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <br />
        <br />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <br />
        <br />

        <button type="submit">
          {editId ? "Update Property" : "Add Property"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>
        )}
      </form>

      {properties.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            margin: 10,
            padding: 10,
          }}
        >
          <h3>{p.name}</h3>
          <p>{p.location}</p>
          <p>RM {p.price}</p>
          <p>{p.description}</p>

          <button onClick={() => startEdit(p)}>
            Edit
          </button>

          <button
            onClick={() => deleteProperty(p.id)}
            style={{ marginLeft: 10 }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}