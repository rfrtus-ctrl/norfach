import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Briefcase, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function NavTab({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-150 ${
          isActive ? 'text-brand-500' : 'text-gray-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-1.5 rounded-xl transition-all duration-150 ${isActive ? 'bg-brand-50' : ''}`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          </div>
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const { isWorker, isCompany } = useAuth();

  return (
    <div
      className="bg-white border-t border-gray-100 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <NavTab to="/"       icon={Home}     label="Home"     end />

      {isWorker && (
        <>
          <NavTab to="/browse/jobs" icon={Search}   label="Jobs" />
          <NavTab to="/profile"     icon={User}     label="Profile" />
        </>
      )}

      {isCompany && (
        <>
          <NavTab to="/browse/workers" icon={Search}    label="Workers" />
          <NavTab to="/jobs"           icon={Briefcase} label="My Jobs" />
          <NavTab to="/profile"        icon={User}      label="Profile" />
        </>
      )}

      <NavTab to="/settings" icon={Settings} label="Settings" />
    </div>
  );
}
