import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type TestItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TestPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [payload, setPayload] = useState({
    class_name: '',
    course: '',
    subject: '',
    module: '',
    test_title: '',
    description: '',
    total_questions: 0,
    total_marks: 0,
    duration: 0,
    difficulty_level: 'Medium',
    time_period: 0,
    pass_mark: 0,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getAllTests();
      setItems((res.tests || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getAllTests();
        if (active) setItems((res.tests || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load tests');
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
      [it.test_title, it.course, it.subject, it.module, it.difficulty_level]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      class_name: '', course: '', subject: '', module: '', test_title: '', description: '', total_questions: 0, total_marks: 0, duration: 0, difficulty_level: 'Medium', time_period: 0, pass_mark: 0,
    });
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: TestItem): void => {
    setEditing(it);
    setPayload({
      class_name: it.class_name,
      course: it.course,
      subject: it.subject,
      module: it.module,
      test_title: it.test_title,
      description: it.description,
      total_questions: it.total_questions,
      total_marks: it.total_marks,
      duration: it.duration,
      difficulty_level: it.difficulty_level,
      time_period: it.time_period,
      pass_mark: it.pass_mark,
    });
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateTest(editing._id, payload as any, token);
      } else {
        await ApiService.createTest(payload as any, token);
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
    if (!confirm('Delete this test?')) return;
    try {
      await ApiService.deleteTest(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading tests...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search tests" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Test' : 'Create Test'}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Class Name" value={payload.class_name} onChange={(e) => setPayload({ ...payload, class_name: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Course" value={payload.course} onChange={(e) => setPayload({ ...payload, course: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Subject" value={payload.subject} onChange={(e) => setPayload({ ...payload, subject: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Module" value={payload.module} onChange={(e) => setPayload({ ...payload, module: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Test Title" value={payload.test_title} onChange={(e) => setPayload({ ...payload, test_title: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Description" value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Total Questions" type="number" min={0} value={payload.total_questions} onChange={(e) => setPayload({ ...payload, total_questions: Number(e.target.value) })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Total Marks" type="number" min={0} value={payload.total_marks} onChange={(e) => setPayload({ ...payload, total_marks: Number(e.target.value) })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Duration (mins)" type="number" min={0} value={payload.duration} onChange={(e) => setPayload({ ...payload, duration: Number(e.target.value) })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Difficulty Level" value={payload.difficulty_level} onChange={(e) => setPayload({ ...payload, difficulty_level: e.target.value })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Time Period" type="number" min={0} value={payload.time_period} onChange={(e) => setPayload({ ...payload, time_period: Number(e.target.value) })} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Pass Mark" type="number" min={0} value={payload.pass_mark} onChange={(e) => setPayload({ ...payload, pass_mark: Number(e.target.value) })} required />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.test_title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.course} / {it.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.difficulty_level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.duration} mins</td>
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

export default TestPage;


