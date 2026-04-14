import React, { useState } from 'react';
import { Lock, Bell, Trash2, LogOut, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function Section({ title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sublabel, onClick, danger, rightEl }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${danger ? 'text-red-600' : 'text-gray-800'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
        <Icon size={16} className={danger ? 'text-red-500' : 'text-gray-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {rightEl || <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChangePassword = async () => {
    if (pwdForm.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwdForm.next !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPwd(true);
    try {
      await api.put('/auth/password', { current_password: pwdForm.current, new_password: pwdForm.next });
      toast.success('Password updated');
      setShowPwdModal(false);
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="page-container space-y-5">
      {/* Account info */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="avatar w-14 h-14 text-lg">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.email}</p>
            <span className="badge-orange capitalize mt-1">{user?.role}</span>
          </div>
        </div>
      </div>

      <Section title="Security">
        <SettingsRow
          icon={Lock}
          label="Change Password"
          sublabel="Update your login password"
          onClick={() => setShowPwdModal(true)}
        />
        <SettingsRow
          icon={Shield}
          label="Account Type"
          sublabel={`Registered as ${user?.role}`}
          onClick={() => {}}
          rightEl={<span className="text-xs text-gray-400 capitalize">{user?.role}</span>}
        />
      </Section>

      <Section title="Notifications">
        <SettingsRow
          icon={Bell}
          label="Push Notifications"
          sublabel="Coming soon"
          onClick={() => toast('Notifications coming soon')}
        />
      </Section>

      <Section title="Account">
        <SettingsRow
          icon={LogOut}
          label="Sign Out"
          onClick={logout}
          danger
        />
        <SettingsRow
          icon={Trash2}
          label="Delete Account"
          sublabel="This action cannot be undone"
          onClick={() => toast.error('Please contact support to delete your account')}
          danger
        />
      </Section>

      <p className="text-center text-xs text-gray-400 pb-2">Norfach v1.0.0</p>

      {/* Change password modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && setShowPwdModal(false)}>
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Change Password</h3>
            <div>
              <label className="label">Current password</label>
              <input className="input" type="password" value={pwdForm.current}
                onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))} />
            </div>
            <div>
              <label className="label">New password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" value={pwdForm.next}
                onChange={e => setPwdForm(f => ({ ...f, next: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input className="input" type="password" value={pwdForm.confirm}
                onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-secondary flex-1" onClick={() => setShowPwdModal(false)}>Cancel</button>
              <button className="btn-primary flex-1" disabled={savingPwd} onClick={handleChangePassword}>
                {savingPwd ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
