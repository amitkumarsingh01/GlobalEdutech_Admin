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
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Course' : 'Create Course'}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Title" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Category" value={payload.category} onChange={(e) => setPayload({ ...payload, category: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Sub Category" value={payload.sub_category} onChange={(e) => setPayload({ ...payload, sub_category: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Start Date (ISO)" value={payload.start_date} onChange={(e) => setPayload({ ...payload, start_date: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="End Date (ISO)" value={payload.end_date} onChange={(e) => setPayload({ ...payload, end_date: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Duration" value={payload.duration} onChange={(e) => setPayload({ ...payload, duration: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Instructor" value={payload.instructor} onChange={(e) => setPayload({ ...payload, instructor: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Price" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
            {!editing && (
              <input className="border rounded-lg px-3 py-2" type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} required />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ApiService.fileUrl(it.thumbnail_image) ? (
                    <img
                      src={ApiService.fileUrl(it.thumbnail_image) || ''}
                      alt={it.title}
                      className="w-16 h-16 object-cover rounded-md border"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-500 text-xs rounded-md border">
                      img not available
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.category} / {it.sub_category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.instructor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹ {it.price}</td>
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

export default CoursePage;


