import { useEffect, useState } from "react";
import { Landmark, Plus, Trash2, RefreshCw } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  link: "",
  category: "Central",
};

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/schemes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const addScheme = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.link) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/admin/schemes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      fetchSchemes();
    } finally {
      setSaving(false);
    }
  };

  const deleteScheme = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/admin/schemes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSchemes();
  };

  return (
    <div className="p-6">
      <div className="bg-white border border-green-100 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="text-green-600" /> Schemes Management
        </h1>
        <p className="text-gray-600 mt-1">Schemes added here are visible for users in Schemes page.</p>
      </div>

      <form onSubmit={addScheme} className="bg-white border border-green-100 rounded-2xl p-6 mb-6 grid md:grid-cols-2 gap-4">
        <input className="border rounded-lg px-3 py-2" placeholder="Scheme title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <select className="border rounded-lg px-3 py-2" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          <option>Central</option>
          <option>Andhra Pradesh</option>
          <option>Telangana</option>
          <option>Other</option>
        </select>
        <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Official link" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} />
        <textarea className="border rounded-lg px-3 py-2 md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2">
          <Plus size={16} /> {saving ? "Adding..." : "Add Scheme"}
        </button>
        <button type="button" onClick={fetchSchemes} className="inline-flex items-center justify-center gap-2 border border-green-300 text-green-700 rounded-lg px-4 py-2">
          <RefreshCw size={16} /> Reload
        </button>
      </form>

      <div className="bg-white border border-green-100 rounded-2xl p-4">
        {loading ? (
          <p className="text-gray-500">Loading schemes...</p>
        ) : schemes.length === 0 ? (
          <p className="text-gray-500">No schemes found.</p>
        ) : (
          <div className="space-y-3">
            {schemes.map((scheme) => (
              <div key={scheme._id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{scheme.title}</h3>
                  <p className="text-xs text-green-700 mt-1">{scheme.category}</p>
                  <p className="text-sm text-gray-600 mt-2">{scheme.description}</p>
                </div>
                <button onClick={() => deleteScheme(scheme._id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
