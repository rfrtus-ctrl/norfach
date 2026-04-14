import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BrowseWorkersPage() {
  const [workers, setWorkers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]   = useState({ city: '', skill: '', available: '' });
  const [search, setSearch]     = useState('');

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.city)      params.city = filters.city;
      if (filters.skill)     params.skill = filters.skill;
      if (filters.available) params.available = 'true';
      const res = await api.get('/workers', { params });
      setWorkers(res.data);
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const displayed = search
    ? workers.filter(w =>
        `${w.first_name} ${w.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        w.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : workers;

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page-container space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-10 pr-10" placeholder="Search workers or skills…"
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(s => !s)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
            showFilters || hasFilters
              ? 'bg-brand-50 border-brand-300 text-brand-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          <SlidersHorizontal size={15} /> Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </button>
        {hasFilters && (
          <button onClick={() => setFilters({ city: '', skill: '', available: '' })}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{displayed.length} workers</span>
      </div>

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
          <div>
            <label className="label">Skill</label>
            <input className="input" placeholder="e.g. Welding, Electrical…"
              value={filters.skill} onChange={e => setF('skill', e.target.value)} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-11 h-6 rounded-full transition-colors relative ${filters.available ? 'bg-brand-500' : 'bg-gray-200'}`}
              onClick={() => setF('available', filters.available ? '' : 'true')}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.available ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Available only</span>
          </label>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-10 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No workers found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(w => {
            const name = `${w.first_name} ${w.last_name}`.trim();
            return (
              <Link key={w.id} to={`/workers/${w.id}`}
                className="card-hover p-4 flex items-start gap-3 block">
                <div className="avatar w-12 h-12 text-base flex-shrink-0">
                  {w.first_name?.[0]}{w.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{name}</p>
                    {w.available && <span className="badge-green">Available</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {w.city && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />{w.city}
                      </span>
                    )}
                    {w.hourly_rate && <span className="text-xs text-gray-500">€{w.hourly_rate}/hr</span>}
                    {w.years_exp > 0 && <span className="text-xs text-gray-400">{w.years_exp}y exp</span>}
                  </div>
                  {w.skills?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {w.skills.slice(0, 4).map(s => <span key={s} className="badge-orange">{s}</span>)}
                      {w.skills.length > 4 && <span className="text-xs text-gray-400">+{w.skills.length - 4}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
