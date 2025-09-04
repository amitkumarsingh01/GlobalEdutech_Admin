import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Institution } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const InstitutionsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vision, setVision] = useState<string>('');
  const [mission, setMission] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.name, it.description, it.vision || '', it.mission || '']
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getInstitutions();
      setItems((res.institutions || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getInstitutions();
        if (active) setItems((res.institutions || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load institutions');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setName('');
    setDescription('');
    setVision('');
    setMission('');
  };

  const openCreate = (): void => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (it: Institution): void => {
    setEditing(it);
    setName(it.name);
    setDescription(it.description);
    setVision(it.vision || '');
    setMission(it.mission || '');
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateInstitution(editing._id, {
          name, description, vision, mission
        } as Partial<Institution>, token);
      } else {
        await ApiService.createInstitution({ name, description, vision, mission } as any, token);
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
    if (!confirm('Delete this institution?')) return;
    try {
      await ApiService.deleteInstitution(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading institutions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Institutions</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search institutions" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Institution' : 'Create Institution'}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Vision" value={vision} onChange={(e) => setVision(e.target.value)} />
            <input className="border rounded-lg px-3 py-2" placeholder="Mission" value={mission} onChange={(e) => setMission(e.target.value)} />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.description}</td>
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

export default InstitutionsPage;


