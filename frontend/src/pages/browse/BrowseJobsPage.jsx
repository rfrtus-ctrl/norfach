import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JOB_TYPES = ['full-time', 'part-time', 'project', 'temporary'];
const SALARY_TYPES = ['hourly', 'monthly', 'project'];

export default function BrowseJobsPage() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]   = useState({ city: '', job_type: '', salary_type: '' });
  const [search, setSearch]     = useState('');

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.city)        params.city = filters.city;
      if (filters.job_type)    params.job_type = filters.job_type;
      if (filters.salary_type) params.salary_type = filters.salary_type;
      const res = await api.get('/jobs', { params });
      setJobs(res.data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const displayed = search
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company_name?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page-container space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10 pr-10"
          placeholder="Search jobs or companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(s => !s)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
            showFilters || hasFilters
              ? 'bg-brand-50 border-brand-300 text-brand-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </button>

        {hasFilters && (
          <button onClick={() => setFilters({ city: '', job_type: '', salary_type: '' })}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{displayed.length} jobs</span>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 space-y-3">
          <div>
            <label className="label">City</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-8" placeholder="e.g. Bratislava"
                value={filters.city} onChange={e => setF('city', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job type</label>
              <select className="input" value={filters.job_type} onChange={e => setF('job_type', e.target.value)}>
                <option value="">All types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pay type</label>
              <select className="input" value={filters.salary_type} onChange={e => setF('salary_type', e.target.value)}>
                <option value="">All</option>
                {SALARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-10 text-center">
          <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No jobs found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`}
              className="card-hover p-4 flex items-start gap-3 block">
              <div className="avatar w-12 h-12 text-base flex-shrink-0">
                {job.company_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                <p className="text-sm text-gray-500 truncate">{job.company_name}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {job.city && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} />{job.city}
                    </span>
                  )}
                  {job.salary_min && (
                    <span className="badge-green text-xs">
                      €{job.salary_min}{job.salary_max ? `–${job.salary_max}` : '+'}/{job.salary_type === 'hourly' ? 'hr' : 'mo'}
                    </span>
                  )}
                  <span className="badge-gray capitalize">{job.job_type?.replace('-', ' ')}</span>
                  {job.verified && <span className="badge-blue">✓ Verified</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
