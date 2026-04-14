import React, { useState } from 'react';
import {
  User, MapPin, Phone, Globe, Euro, Clock,
  Save, Plus, X, Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CONSTRUCTION_SKILLS = [
  'Carpentry', 'Masonry', 'Electrical', 'Plumbing', 'Welding',
  'Painting', 'Roofing', 'Tiling', 'HVAC', 'Crane Operation',
  'Scaffolding', 'Steel Fixing', 'Concrete Work', 'Excavation',
  'Insulation', 'Drywall', 'Flooring', 'Glass Installation',
];

export default function ProfilePage() {
  const { user, profile, isWorker, isCompany, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // ── Worker form ──────────────────────────────────────────────────────────────
  const [wForm, setWForm] = useState({
    first_name:  profile?.first_name  || '',
    last_name:   profile?.last_name   || '',
    phone:       profile?.phone       || '',
    city:        profile?.city        || '',
    country:     profile?.country     || 'SK',
    bio:         profile?.bio         || '',
    hourly_rate: profile?.hourly_rate || '',
    years_exp:   profile?.years_exp   || 0,
    available:   profile?.available   ?? true,
    skills:      profile?.skills      || [],
  });

  // ── Company form ─────────────────────────────────────────────────────────────
  const [cForm, setCForm] = useState({
    company_name:   profile?.company_name   || '',
    description:    profile?.description    || '',
    city:           profile?.city           || '',
    country:        profile?.country        || 'SK',
    website:        profile?.website        || '',
    phone:          profile?.phone          || '',
    employee_count: profile?.employee_count || '',
  });

  const setW = (k, v) => setWForm(f => ({ ...f, [k]: v }));
  const setC = (k, v) => setCForm(f => ({ ...f, [k]: v }));

  const addSkill = (skill) => {
    if (!skill.trim() || wForm.skills.includes(skill.trim())) return;
    setW('skills', [...wForm.skills, skill.trim()]);
    setNewSkill('');
  };
  const removeSkill = (s) => setW('skills', wForm.skills.filter(x => x !== s));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isWorker) {
        await api.put('/workers/me/profile', wForm);
      } else {
        await api.put('/companies/me/profile', cForm);
      }
      await refreshProfile();
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const initials = isWorker
    ? `${wForm.first_name?.[0] || ''}${wForm.last_name?.[0] || ''}`.toUpperCase()
    : (cForm.company_name?.[0] || '?').toUpperCase();

  return (
    <div className="page-container space-y-5">
      {/* Avatar + name header */}
      <div className="card p-5 flex items-center gap-4">
        <div className="avatar w-16 h-16 text-xl">{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">
            {isWorker
              ? `${wForm.first_name} ${wForm.last_name}`.trim() || 'Your Name'
              : cForm.company_name || 'Company Name'}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge-orange mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* ── Worker form ── */}
      {isWorker && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={17} className="text-brand-500" /> Personal Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input className="input" value={wForm.first_name} onChange={e => setW('first_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" value={wForm.last_name} onChange={e => setW('last_name', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} placeholder="Tell companies about yourself…"
                value={wForm.bio} onChange={e => setW('bio', e.target.value)} />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={17} className="text-brand-500" /> Location & Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Bratislava" value={wForm.city} onChange={e => setW('city', e.target.value)} />
              </div>
              <div>
                <label className="label">Country</label>
                <input className="input" placeholder="SK" maxLength={3} value={wForm.country} onChange={e => setW('country', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label"><Phone size={13} className="inline mr-1" />Phone</label>
              <input className="input" type="tel" placeholder="+421 900 000 000" value={wForm.phone} onChange={e => setW('phone', e.target.value)} />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Euro size={17} className="text-brand-500" /> Work Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hourly rate (€)</label>
                <input className="input" type="number" min="0" placeholder="15" value={wForm.hourly_rate} onChange={e => setW('hourly_rate', e.target.value)} />
              </div>
              <div>
                <label className="label"><Clock size={13} className="inline mr-1" />Years of exp.</label>
                <input className="input" type="number" min="0" max="50" value={wForm.years_exp} onChange={e => setW('years_exp', parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${wForm.available ? 'bg-brand-500' : 'bg-gray-200'}`}
                onClick={() => setW('available', !wForm.available)}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${wForm.available ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {wForm.available ? 'Available for work' : 'Not available'}
              </span>
            </label>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Skills</h3>
            {/* Skill tags */}
            <div className="flex flex-wrap gap-2">
              {wForm.skills.map(s => (
                <span key={s} className="flex items-center gap-1 badge-orange pr-1">
                  {s}
                  <button onClick={() => removeSkill(s)} className="ml-0.5 hover:text-red-500">
                    <X size={11} />
                  </button>
                </span>
              ))}
              {wForm.skills.length === 0 && (
                <p className="text-sm text-gray-400">No skills added yet</p>
              )}
            </div>
            {/* Add skill */}
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Add a skill…"
                value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))} />
              <button onClick={() => addSkill(newSkill)} className="btn-primary px-3 py-2">
                <Plus size={16} />
              </button>
            </div>
            {/* Quick-add common skills */}
            <div className="flex flex-wrap gap-1.5">
              {CONSTRUCTION_SKILLS.filter(s => !wForm.skills.includes(s)).slice(0, 10).map(s => (
                <button key={s} onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-brand-100 hover:text-brand-700 transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Company form ── */}
      {isCompany && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={17} className="text-brand-500" /> Company Info
            </h3>
            <div>
              <label className="label">Company name</label>
              <input className="input" value={cForm.company_name} onChange={e => setC('company_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={3} placeholder="Tell workers about your company…"
                value={cForm.description} onChange={e => setC('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Number of employees</label>
              <select className="input" value={cForm.employee_count} onChange={e => setC('employee_count', e.target.value)}>
                <option value="">Select range</option>
                {['1–10','11–50','51–200','201–500','500+'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={17} className="text-brand-500" /> Location & Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Bratislava" value={cForm.city} onChange={e => setC('city', e.target.value)} />
              </div>
              <div>
                <label className="label">Country</label>
                <input className="input" placeholder="SK" maxLength={3} value={cForm.country} onChange={e => setC('country', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label"><Phone size={13} className="inline mr-1" />Phone</label>
              <input className="input" type="tel" value={cForm.phone} onChange={e => setC('phone', e.target.value)} />
            </div>
            <div>
              <label className="label"><Globe size={13} className="inline mr-1" />Website</label>
              <input className="input" type="url" placeholder="https://yourcompany.com" value={cForm.website} onChange={e => setC('website', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <button onClick={handleSave} disabled={saving} className="btn-primary btn-lg w-full sticky bottom-20 lg:bottom-6 shadow-lg">
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving…
          </span>
        ) : (
          <><Save size={17} /> Save profile</>
        )}
      </button>
    </div>
  );
}
