import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Search, Briefcase, User, Settings,
  HardHat, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function NavItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-brand-50 text-brand-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600'} />
          <span className="flex-1">{label}</span>
          {!isActive && <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, profile, isWorker, isCompany, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const displayName = isWorker
    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user?.email
    : profile?.company_name || user?.email;

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <HardHat size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Norfach</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="pb-2 mb-2 border-b border-gray-50">
          <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {isWorker ? 'Worker' : 'Company'}
          </p>
        </div>

        <NavItem to="/"         icon={Home}     label="Dashboard"    end />

        {isWorker && (
          <>
            <NavItem to="/browse/jobs"    icon={Search}    label="Browse Jobs" />
            <NavItem to="/profile"        icon={User}      label="My Profile" />
          </>
        )}

        {isCompany && (
          <>
            <NavItem to="/browse/workers" icon={Search}    label="Find Workers" />
            <NavItem to="/jobs"           icon={Briefcase} label="My Jobs" />
            <NavItem to="/profile"        icon={User}      label="Company Profile" />
          </>
        )}

        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer group">
          <div className="avatar w-9 h-9 text-sm">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
