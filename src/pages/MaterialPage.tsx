import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Material } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const MaterialPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [payload, setPayload] = useState({
    class_name: '',
    course: '',
    subject: '',
    module: '',
    title: '',
    description: '',
    academic_year: '',
    time_period: 0,
    price: 0,
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getMaterials();
      setItems((res.materials || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getMaterials();
        if (active) setItems((res.materials || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load materials');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.course, it.subject, it.module]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      class_name: '', course: '', subject: '', module: '', title: '', description: '', academic_year: '', time_period: 0, price: 0,
    });
    setPdf(null);
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: Material): void => {
    setEditing(it);
    setPayload({
      class_name: it.class_name,
      course: it.course,
      subject: it.subject,
      module: it.module,
      title: it.title,
      description: it.description,
      academic_year: it.academic_year,
      time_period: it.time_period,
      price: it.price,
    });
    setPdf(null);
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateMaterial(editing._id, payload as any, token);
      } else {
        if (!pdf) { setError('PDF is required'); setSubmitting(false); return; }
        await ApiService.createMaterial({ payload, pdf_file: pdf }, token);
      }
      setFormOpen(false);
      resetForm();
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this material?')) return;
    try {
      await ApiService.deleteMaterial(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading materials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search materials" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Material' : 'Create Material'}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Class Name" value={payload.class_name} onChange={(e) => setPayload({ ...payload, class_name: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Course" value={payload.course} onChange={(e) => setPayload({ ...payload, course: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Subject" value={payload.subject} onChange={(e) => setPayload({ ...payload, subject: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Module" value={payload.module} onChange={(e) => setPayload({ ...payload, module: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Title" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Description" value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Academic Year" value={payload.academic_year} onChange={(e) => setPayload({ ...payload, academic_year: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Time Period" type="number" min={0} value={payload.time_period} onChange={(e) => setPayload({ ...payload, time_period: Number(e.target.value) })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Price" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
            {!editing && (
              <input className="border rounded-lg px-3 py-2" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} required />
            )}
            <div className="col-span-1 md:col-span-2 flex gap-2">
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg border">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-500 text-xs rounded-md border">
                    pdf
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.course} / {it.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.academic_year} / {it.module}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-md border">Edit</button>
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialPage;


