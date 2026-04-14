import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Euro, Clock, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCompany, user } = useAuth();
  const [worker, setWorker]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(res.data);
      } catch {
        toast.error('Worker not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="card p-5 animate-pulse space-y-3">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!worker) return null;

  const name = `${worker.first_name} ${worker.last_name}`.trim();
  const initials = `${worker.first_name?.[0] || ''}${worker.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 -ml-1">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="avatar w-16 h-16 text-xl flex-shrink-0">{initials || '?'}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{name || 'Worker'}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {worker.available && <span className="badge-green">Available</span>}
              {worker.hourly_rate && (
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Euro size={13} />€{worker.hourly_rate}/hr
                </span>
              )}
              {worker.years_exp > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock size={13} />{worker.years_exp}y exp
                </span>
              )}
            </div>
            {(worker.city || worker.country) && (
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-1.5">
                <MapPin size={13} />{[worker.city, worker.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {worker.bio && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-2">About</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{worker.bio}</p>
        </div>
      )}

      {/* Skills */}
      {worker.skills?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map(s => (
              <span key={s} className="badge-orange">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Contact — only shown to companies */}
      {isCompany && (worker.phone || worker.email) && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">Contact</h2>
          <div className="space-y-2">
            {worker.phone && (
              <a href={`tel:${worker.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">{worker.phone}</span>
              </a>
            )}
            {worker.email && (
              <a href={`mailto:${worker.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">{worker.email}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {!isCompany && (
        <p className="text-xs text-center text-gray-400">
          Contact details are only visible to companies
        </p>
      )}
    </div>
  );
}
