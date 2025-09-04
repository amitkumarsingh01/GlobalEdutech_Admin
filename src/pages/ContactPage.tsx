import React, { useEffect, useState } from 'react';
import ApiService, { type ContactItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const ContactPage: React.FC = () => {
  const { token } = useAuth();
  const [item, setItem] = useState<ContactItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ContactItem>>({});
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try { const res = await ApiService.getContact(); setItem(res.contact); setForm(res.contact); }
      catch (e: any) { setError(e?.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, []);

  const onSave = async (): Promise<void> => {
    if (!token || !item) { setError('Not authorized'); return; }
    setSaving(true);
    try { await ApiService.updateContact(item._id, form, token); }
    catch (e: any) { setError(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-600">Loading contact...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded-lg px-3 py-2" placeholder="Address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mt-3">
          <button onClick={onSave} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

