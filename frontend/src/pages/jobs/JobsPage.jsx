import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MapPin, Edit2, Eye, EyeOff, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JOB_TYPES    = ['full-time', 'part-time', 'project', 'temporary'];
const SALARY_TYPES = ['hourly', 'monthly', 'project'];

const emptyForm = {
  title: '', description: '', city: '', country: 'SK',
  job_type: 'full-time', salary_type: 'monthly',
  salary_min: '', salary_max: '', requirements: '',
};

function JobModal({ job, onClose, onSaved }) {
  const editing = Boolean(job?.id);
  const [form, setForm] = useState(job ? {
    title: job.title || '', description: job.description || '',
    city: job.city || '', country: job.country || 'SK',
    job_type: job.job_type || 'full-time', salary_type: job.salary_type || 'monthly',
    salary_min: job.salary_min || '', salary_max: job.salary_max || '',
    requirements: job.requirements || '',
  } : emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/jobs/${job.id}`, form);
        toast.success('Job updated');
      } else {
        await api.post('/jobs', form);
        toast.success('Job posted!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{editing ? 'Edit Job' : 'Post a Job'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Job title *</label>
            <input className="input" placeholder="e.g. Senior Electrician" value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={4} placeholder="Describe the role, responsibilities…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="label">Requirements</label>
            <textarea className="input resize-none" rows={3} placeholder="Skills, certifications, experience needed…"
              value={form.requirements} onChange={e => set('requirements', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input className="input" placeholder="Bratislava" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" placeholder="SK" maxLength={3} value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job type</label>
              <select className="input" value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pay type</label>
              <select className="input" value={form.salary_type} onChange={e => set('salary_type', e.target.value)}>
                {SALARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Min salary (€)</label>
              <input className="input" type="number" min="0" placeholder="1200" value={form.salary_min}
                onChange={e => set('salary_min', e.target.value)} />
            </div>
            <div>
              <label className="label">Max salary (€)</label>
              <input className="input" type="number" min="0" placeholder="2000" value={form.salary_max}
                onChange={e => set('salary_max', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (editing ? 'Save changes' : 'Post job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'new' | job object

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/my/posts');
      setJobs(res.data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.put(`/jobs/${job.id}`, { ...job, status: newStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      toast.success(newStatus === 'active' ? 'Job activated' : 'Job closed');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    try {
      await api.delete(`/jobs/${job.id}`);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setModal('new')} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Post job
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No jobs posted yet</p>
          <p className="text-sm text-gray-400 mt-1">Post your first job to find skilled workers</p>
          <button onClick={() => setModal('new')} className="btn-primary mt-4 px-6 py-2">
            Post a Job
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <div key={job.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-brand-600 truncate">
                      {job.title}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{job.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {job.city && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />{job.city}
                      </span>
                    )}
                    {job.salary_min && (
                      <span className="text-xs text-gray-500">
                        €{job.salary_min}{job.salary_max ? `–${job.salary_max}` : '+'}/{job.salary_type === 'hourly' ? 'hr' : 'mo'}
                      </span>
                    )}
                    <span className="badge-gray capitalize">{job.job_type?.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleStatus(job)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title={job.status === 'active' ? 'Close job' : 'Reactivate'}>
                    {job.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => setModal(job)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => deleteJob(job)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <JobModal
          job={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
