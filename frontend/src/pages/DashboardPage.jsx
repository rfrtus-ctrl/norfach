import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Briefcase, MapPin, Star, ChevronRight,
  TrendingUp, Users, Clock, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    blue:  'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card-hover p-4 flex items-start gap-3 block">
      <div className="avatar w-11 h-11 text-sm flex-shrink-0">
        {job.company_name?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{job.title}</p>
        <p className="text-sm text-gray-500 truncate">{job.company_name}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {job.city && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} /> {job.city}
            </span>
          )}
          {job.salary_min && (
            <span className="badge-green">
              €{job.salary_min}{job.salary_max ? `–${job.salary_max}` : '+'}/{job.salary_type === 'hourly' ? 'hr' : 'mo'}
            </span>
          )}
          <span className="badge-gray capitalize">{job.job_type?.replace('-', ' ')}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
    </Link>
  );
}

function WorkerCard({ worker }) {
  const name = `${worker.first_name} ${worker.last_name}`.trim();
  return (
    <Link to={`/workers/${worker.id}`} className="card-hover p-4 flex items-start gap-3 block">
      <div className="avatar w-11 h-11 text-sm flex-shrink-0">
        {worker.first_name?.[0] || '?'}{worker.last_name?.[0] || ''}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {worker.city && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} /> {worker.city}
            </span>
          )}
          {worker.available && <span className="badge-green">Available</span>}
          {worker.hourly_rate && <span className="text-xs text-gray-500">€{worker.hourly_rate}/hr</span>}
        </div>
        {worker.skills?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {worker.skills.slice(0, 3).map(s => (
              <span key={s} className="badge-gray">{s}</span>
            ))}
            {worker.skills.length > 3 && <span className="text-xs text-gray-400">+{worker.skills.length - 3}</span>}
          </div>
        )}
      </div>
      <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
    </Link>
  );
}

export default function DashboardPage() {
  const { user, profile, isWorker, isCompany } = useAuth();
  const [recentJobs, setRecentJobs]       = useState([]);
  const [recentWorkers, setRecentWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = isWorker
    ? profile?.first_name || user?.email
    : profile?.company_name || user?.email;

  useEffect(() => {
    async function load() {
      try {
        if (isWorker) {
          const r = await api.get('/jobs', { params: { limit: 5 } });
          setRecentJobs(r.data);
        } else {
          const r = await api.get('/workers', { params: { limit: 5 } });
          setRecentWorkers(r.data);
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [isWorker]);

  return (
    <div className="page-container space-y-6">
      {/* Greeting */}
      <div className="card p-5 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <p className="text-brand-100 text-sm">{greeting()},</p>
        <h2 className="text-2xl font-bold mt-0.5 truncate">{displayName} 👋</h2>
        <p className="text-brand-100 text-sm mt-1">
          {isWorker ? 'Find your next construction opportunity' : 'Find skilled workers for your projects'}
        </p>
        <Link
          to={isWorker ? '/browse/jobs' : '/browse/workers'}
          className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Search size={15} />
          {isWorker ? 'Browse Jobs' : 'Find Workers'}
        </Link>
      </div>

      {/* Stats */}
      {isWorker && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Briefcase}   label="Available jobs"  value="—"  color="brand" />
          <StatCard icon={CheckCircle} label="Applied"         value="0"  color="green" />
          <StatCard icon={Star}        label="Profile views"   value="—"  color="amber" />
          <StatCard icon={Clock}       label="Days active"     value="1"  color="blue" />
        </div>
      )}
      {isCompany && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Briefcase}  label="Active jobs"    value="—"  color="brand" />
          <StatCard icon={Users}      label="Applications"   value="0"  color="green" />
          <StatCard icon={TrendingUp} label="Profile views"  value="—"  color="amber" />
          <StatCard icon={CheckCircle} label="Hired"         value="0"  color="blue" />
        </div>
      )}

      {/* Recent jobs / workers */}
      {isWorker && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Recent Jobs</h3>
            <Link to="/browse/jobs" className="text-brand-600 text-sm font-medium hover:underline">
              See all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-2">
              {recentJobs.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No jobs available yet</p>
            </div>
          )}
        </section>
      )}

      {isCompany && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Available Workers</h3>
            <Link to="/browse/workers" className="text-brand-600 text-sm font-medium hover:underline">
              See all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentWorkers.length > 0 ? (
            <div className="space-y-2">
              {recentWorkers.map(w => <WorkerCard key={w.id} worker={w} />)}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No workers registered yet</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
