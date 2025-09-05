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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ContactItem, value: string) => {
    setForm({ ...form, [field]: value });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  useEffect(() => {
    (async () => {
      try { const res = await ApiService.getContact(); setItem(res.contact); setForm(res.contact); }
      catch (e: any) { setError(e?.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, []);

  const onSave = async (): Promise<void> => {
    if (!token || !item) { setError('Not authorized'); return; }
    
    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }
    
    setSaving(true);
    setError(null);
    try { 
      await ApiService.updateContact(item._id, form, token);
      setItem({ ...item, ...form });
    }
    catch (e: any) { setError(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    if (item) {
      setForm(item);
      setValidationErrors({});
      setError(null);
    }
  };

  if (loading) return <div className="text-gray-600">Loading contact...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            <p className="text-gray-600">Manage your organization's contact details</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetForm} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
            <button 
              onClick={onSave} 
              disabled={saving} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea 
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your organization's address"
              value={form.address || ''} 
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
            />
            {validationErrors.address && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-gray-400">(Optional)</span>
            </label>
            <input 
              type="tel"
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter phone number (e.g., +1 234 567 8900)"
              value={form.phone || ''} 
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-gray-400">(Optional)</span>
            </label>
            <input 
              type="email"
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter email address (e.g., contact@example.com)"
              value={form.email || ''} 
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep your contact information up to date for better user experience</li>
            <li>• Email and phone are optional but recommended for user inquiries</li>
            <li>• Address helps users locate your organization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

