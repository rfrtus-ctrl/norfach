import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, Eye, EyeOff, HardHat as WorkerIcon, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=role, 2=details
  const [form, setForm] = useState({
    role: '', email: '', password: '',
    first_name: '', last_name: '', company_name: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Norfach 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <HardHat size={34} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Norfach</h1>
          <p className="text-brand-100 text-sm mt-1">Construction marketplace</p>
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">
            {step === 1 ? 'Choose your account type' : 'Fill in your details'}
          </p>

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-3">
              <button
                onClick={() => { set('role', 'worker'); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left hover:border-brand-400 hover:bg-brand-50 ${
                  form.role === 'worker' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                }`}>
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <WorkerIcon size={24} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">I'm a Worker</p>
                  <p className="text-xs text-gray-500 mt-0.5">Find jobs, get hired by companies</p>
                </div>
              </button>

              <button
                onClick={() => { set('role', 'company'); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left hover:border-brand-400 hover:bg-brand-50 ${
                  form.role === 'company' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                }`}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">I'm a Company</p>
                  <p className="text-xs text-gray-500 mt-0.5">Post jobs, find skilled workers</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {form.role === 'worker' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">First name</label>
                    <input className="input" placeholder="John" value={form.first_name}
                      onChange={e => set('first_name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input className="input" placeholder="Smith" value={form.last_name}
                      onChange={e => set('last_name', e.target.value)} required />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Company name</label>
                  <input className="input" placeholder="Acme Construction Ltd." value={form.company_name}
                    onChange={e => set('company_name', e.target.value)} required />
                </div>
              )}

              <div>
                <label className="label">Email address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  autoComplete="email" required />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
