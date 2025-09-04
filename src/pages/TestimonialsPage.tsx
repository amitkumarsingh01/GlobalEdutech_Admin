import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Testimonial } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TestimonialsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [mediaType, setMediaType] = useState<string>('video');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.student_name, it.course, String(it.rating)]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTestimonials();
      setItems((res.testimonials || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getTestimonials();
        if (active) setItems((res.testimonials || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load testimonials');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setStudentName('');
    setCourse('');
    setRating(5);
    setMediaType('video');
    setMediaFile(null);
    setStudentImage(null);
  };

  const openCreate = (): void => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (it: Testimonial): void => {
    setEditing(it);
    setTitle(it.title);
    setDescription(it.description);
    setStudentName(it.student_name);
    setCourse(it.course);
    setRating(it.rating);
    setMediaType(it.media_type);
    setMediaFile(null);
    setStudentImage(null);
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateTestimonial(editing._id, {
          title,
          description,
          student_name: studentName,
          course,
          rating,
          media_type: mediaType,
        } as Partial<Testimonial>, token);
      } else {
        if (!mediaFile) { setError('Media file is required'); setSubmitting(false); return; }
        await ApiService.createTestimonial({
          payload: { title, description, student_name: studentName, course, rating, media_type: mediaType },
          media_file: mediaFile,
          student_image: studentImage || undefined,
        }, token);
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
    if (!confirm('Delete this testimonial?')) return;
    try {
      await ApiService.deleteTestimonial(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading testimonials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search testimonials" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Testimonial' : 'Create Testimonial'}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Rating (1-5)" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} required />
            <select className="border rounded-lg px-3 py-2" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
              <option value="video">video</option>
              <option value="image">image</option>
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            {!editing && (
              <input className="border rounded-lg px-3 py-2" type="file" accept="video/*,image/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} required />
            )}
            <input className="border rounded-lg px-3 py-2" type="file" accept="image/*" onChange={(e) => setStudentImage(e.target.files?.[0] || null)} />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.student_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.rating}</td>
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

export default TestimonialsPage;


