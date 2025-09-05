import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Material } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const MaterialPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [payload, setPayload] = useState({
    class_name: '',
    course: '',
    sub_category: '',
    module: '',
    title: '',
    description: '',
    academic_year: '',
    time_period: 0,
    price: 0,
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Course categories structure
  const courseCategories = {
    'PUC': ['I PUC', 'II PUC'],
    'UG Courses': ['B.Com', 'BBA', 'BCA', 'B.Sc'],
    'PG Courses': ['M.Com', 'MBA', 'MCA', 'MFA', 'MTA', 'M.Ed'],
    'UGC Exams': ['NET', 'KSET', 'NEET', 'JEE'],
    'Professional Courses': ['CA (Chartered Accountant)', 'CS (Company Secretary)', 'CMA (Cost & Management Accountant)', 'ACCA (Association of Chartered Certified Accountants)'],
    'Competitive Exams': ['KPSC (Karnataka Public Service Commission)', 'UPSC (Union Public Service Commission)', 'FDA (First Division Assistant)', 'SDA (Second Division Assistant)', 'Current Affairs', 'Banking Exams', 'Railway Exams', 'PDO (Panchayat Development Officer)', 'Others']
  };

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
    return items.filter((it) => {
      const matchesSearch = !q || [it.title, it.course, it.sub_category, it.module]
        .some((v) => v.toLowerCase().includes(q));
      
      const matchesCategory = !filterCategory || it.course === filterCategory;
      const matchesSubCategory = !filterSubCategory || it.sub_category === filterSubCategory;
      
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [items, query, filterCategory, filterSubCategory]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      class_name: '', course: '', sub_category: '', module: '', title: '', description: '', academic_year: '', time_period: 0, price: 0,
    });
    setPdf(null);
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: Material): void => {
    setEditing(it);
    setPayload({
      class_name: it.class_name,
      course: it.course,
      sub_category: it.sub_category,
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

  const openPdfViewer = (material: Material) => {
    setSelectedMaterial(material);
    setPdfViewerOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPdfUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `https://server.globaledutechlearn.com/${fileUrl}`;
  };

  const handleCategoryChange = (category: string) => {
    setFilterCategory(category);
    setFilterSubCategory(''); // Reset subcategory when category changes
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setFilterSubCategory(subCategory);
  };

  const clearFilters = () => {
    setQuery('');
    setFilterCategory('');
    setFilterSubCategory('');
  };

  const getSubCategories = () => {
    return filterCategory ? courseCategories[filterCategory as keyof typeof courseCategories] || [] : [];
  };

  if (loading) return <div className="text-gray-600">Loading materials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
            <p className="text-gray-600">Total: {items.length} | Filtered: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search materials" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Course:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Courses</option>
                {Object.keys(courseCategories).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Sub-Category:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterSubCategory} 
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!filterCategory}
              >
                <option value="">All Sub-Categories</option>
                {getSubCategories().map((subCategory) => (
                  <option key={subCategory} value={subCategory}>{subCategory}</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={clearFilters} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Material' : 'Create Material'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Professional" value={payload.class_name} onChange={(e) => setPayload({ ...payload, class_name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course Category</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.course} 
                    onChange={(e) => setPayload({ ...payload, course: e.target.value, sub_category: '' })}
                    required
                  >
                    <option value="">Select Course Category</option>
                    {Object.keys(courseCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.sub_category} 
                    onChange={(e) => setPayload({ ...payload, sub_category: e.target.value })}
                    required
                    disabled={!payload.course}
                  >
                    <option value="">Select Sub-Category</option>
                    {payload.course && courseCategories[payload.course as keyof typeof courseCategories]?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Module</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Module 2" value={payload.module} onChange={(e) => setPayload({ ...payload, module: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Marketing - Module 2" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Material description..." value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 2023-24" value={payload.academic_year} onChange={(e) => setPayload({ ...payload, academic_year: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time Period (days)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.time_period} onChange={(e) => setPayload({ ...payload, time_period: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
                </div>
                {!editing && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PDF File</label>
                    <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} required />
                  </div>
                )}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Sub-Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{it.title}</div>
                    <div className="text-sm text-gray-500">{it.class_name}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{it.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{it.course}</div>
                  <div className="text-sm text-gray-500">{it.sub_category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{it.academic_year}</div>
                  <div className="text-sm text-gray-500">{it.module}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatFileSize(it.file_size || 0)}</div>
                  <div className="text-xs text-gray-500">{it.time_period} days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-green-600">₹{it.price}</span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{it.download_count || 0}</span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button 
                    onClick={() => openPdfViewer(it)} 
                    className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                  >
                    View PDF
                  </button>
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs">Edit</button>
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Viewer Modal - Centered */}
      {pdfViewerOpen && selectedMaterial && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setPdfViewerOpen(false); }}>
          <div className="w-1/2 h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header Bar */}
            <div className="px-4 py-3 bg-blue-900 flex items-center justify-between border-b border-blue-700">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">PDF Viewer</h3>
                <p className="text-blue-200 text-sm truncate">{selectedMaterial.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3 text-sm text-blue-200">
                  <span>Size: {formatFileSize(selectedMaterial.file_size || 0)}</span>
                  <span>Downloads: {selectedMaterial.download_count || 0}</span>
                  <span>Price: ₹{selectedMaterial.price}</span>
                </div>
                <a 
                  href={getPdfUrl(selectedMaterial.file_url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                >
                  Download
                </a>
                <button 
                  className="text-yellow-400 hover:text-white text-xl font-bold ml-2" 
                  onClick={() => { setPdfViewerOpen(false); }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* PDF Content */}
            <div className="flex-1 bg-gray-100">
              <iframe
                src={getPdfUrl(selectedMaterial.file_url)}
                className="w-full h-full border-0"
                title={`PDF Viewer - ${selectedMaterial.title}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialPage;


