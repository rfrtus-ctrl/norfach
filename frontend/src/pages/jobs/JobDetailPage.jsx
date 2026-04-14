import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Euro, Clock, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWorker, isCompany } = useAuth();
  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch {
        toast.error('Job not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/applications', { job_id: id });
      setApplied(true);
      toast.success('Application submitted!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to apply';
      if (msg.includes('already')) {
        setApplied(true);
        toast('You already applied to this job');
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="card p-5 animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 -ml-1">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="avatar w-14 h-14 text-lg flex-shrink-0">
            {job.company_name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{job.title}</h1>
            <p className="text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Building2 size={14} />{job.company_name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.city && (
            <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
              <MapPin size={14} />{job.city}{job.country ? `, ${job.country}` : ''}
            </span>
          )}
          {job.salary_min && (
            <span className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-medium">
              <Euro size={14} />
              {job.salary_min}{job.salary_max ? `–${job.salary_max}` : '+'}
              /{job.salary_type === 'hourly' ? 'hr' : job.salary_type === 'monthly' ? 'mo' : 'project'}
            </span>
          )}
          <span className="flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl capitalize">
            <Briefcase size={14} />{job.job_type?.replace('-', ' ')}
          </span>
          {job.verified && (
            <span className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl">
              <CheckCircle size={14} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">About the role</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">Requirements</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
        </div>
      )}

      {/* About company */}
      {job.company_description && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">About {job.company_name}</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{job.company_description}</p>
          {job.company_city && (
            <p className="flex items-center gap-1 text-sm text-gray-400 mt-2">
              <MapPin size={13} />{job.company_city}
            </p>
          )}
        </div>
      )}

      {/* Posted date */}
      <p className="text-xs text-center text-gray-400">
        <Clock size={11} className="inline mr-1" />
        Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {/* Apply button (workers only) */}
      {isWorker && (
        <button
          onClick={handleApply}
          disabled={applying || applied || job.status !== 'active'}
          className={`btn-primary btn-lg w-full sticky bottom-20 lg:bottom-6 shadow-lg ${
            applied ? 'opacity-75 cursor-default' : ''
          }`}>
          {applied ? (
            <span className="flex items-center gap-2"><CheckCircle size={18} /> Applied</span>
          ) : applying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying…
            </span>
          ) : job.status !== 'active' ? 'Position Closed' : 'Apply Now'}
        </button>
      )}
    </div>
  );
}
