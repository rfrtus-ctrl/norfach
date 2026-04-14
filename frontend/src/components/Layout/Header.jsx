import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HardHat, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/':               'Dashboard',
  '/browse/jobs':    'Browse Jobs',
  '/browse/workers': 'Find Workers',
  '/profile':        'My Profile',
  '/jobs':           'My Jobs',
  '/settings':       'Settings',
};

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const title = PAGE_TITLES[pathname] || 'Norfach';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo (mobile) / Page title (desktop sidebar present) */}
        <div className="flex items-center gap-2.5">
          {/* Mobile: show logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <HardHat size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Norfach</span>
          </div>
          {/* Desktop: show page title */}
          <h1 className="hidden lg:block text-lg font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Notifications placeholder */}
          <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={20} />
          </button>

          {/* Desktop logout */}
          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors ml-1">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
