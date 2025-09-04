import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Course } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CoursePage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [payload, setPayload] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    sub_category: '',
    start_date: '',
    end_date: '',
    duration: '',
    instructor: '',
    price: 0,
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.name, it.category, it.sub_category, it.instructor]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getCourses();
      setItems((res.courses || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getCourses();
        if (active) setItems((res.courses || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load courses');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      name: '', title: '', description: '', category: '', sub_category: '',
      start_date: '', end_date: '', duration: '', instructor: '', price: 0,
    });
    setThumbnail(null);
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: Course): void => {
    setEditing(it);
    setPayload({
      name: it.name,
      title: it.title,
      description: it.description,
      category: it.category,
      sub_category: it.sub_category,
      start_date: it.start_date,
      end_date: it.end_date,
      duration: it.duration,
      instructor: it.instructor,
      price: it.price,
    });
    setThumbnail(null);
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateCourse(editing._id, payload as any, token);
      } else {
        if (!thumbnail) { setError('Thumbnail is required'); setSubmitting(false); return; }
        await ApiService.createCourse({ payload, thumbnail }, token);
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
    if (!confirm('Delete this course?')) return;
    try {
      await ApiService.deleteCourse(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading courses...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Course' : 'Create Course'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., PUC1-SCI" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., I PUC Science" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-28" placeholder="Brief description of the course" value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., PUC" value={payload.category} onChange={(e) => setPayload({ ...payload, category: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Category</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., I PUC" value={payload.sub_category} onChange={(e) => setPayload({ ...payload, sub_category: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date (ISO)</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="YYYY-MM-DDTHH:mm:ss" value={payload.start_date} onChange={(e) => setPayload({ ...payload, start_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (ISO)</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="YYYY-MM-DDTHH:mm:ss" value={payload.end_date} onChange={(e) => setPayload({ ...payload, end_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., 16 weeks" value={payload.duration} onChange={(e) => setPayload({ ...payload, duration: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Instructor name" value={payload.instructor} onChange={(e) => setPayload({ ...payload, instructor: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="0" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail</label>
                    <input className="border rounded-lg px-3 py-2 w-full" type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} required={!editing} />
                  </div>
                  {editing && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Current Thumbnail</label>
                      <img src={ApiService.fileUrl((editing as Course).thumbnail_image) || ''} alt={(editing as Course).title} className="w-36 h-20 object-cover rounded-md border" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((it) => (
          <div key={it._id} className="rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-white flex flex-col">
            <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
              {ApiService.fileUrl(it.thumbnail_image) ? (
                <img src={ApiService.fileUrl(it.thumbnail_image) || ''} alt={it.title} className="w-full h-40 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="text-gray-500">img not available</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{it.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{it.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 rounded-lg p-2"><span className="font-semibold text-blue-900">Category:</span> {it.category} / {it.sub_category}</div>
                <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Instructor:</span> {it.instructor}</div>
                <div className="bg-blue-50 rounded-lg p-2"><span className="font-semibold text-blue-900">Price:</span> ₹ {it.price}</div>
                <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Updated:</span> {new Date(it.updated_at).toLocaleString()}</div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => openEdit(it)} className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 hover:bg-yellow-400 hover:border-yellow-400">Edit</button>
                <button onClick={() => onDelete(it._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
);
};

export default CoursePage;


