import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  Wheat,
  CloudSun,
  Cpu,
  Bug,
  Sparkles,
  BellRing,
  FileText,
  Settings,
  LogOut,
  Sprout
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/farms', label: 'Farms & fields', icon: Home },
    { path: '/crops', label: 'Crops', icon: Wheat },
    { path: '/weather', label: 'Weather', icon: CloudSun },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside style={{ width: 250, minHeight: '100vh', background: '#FFFFFF', borderRight: '1px solid #E2ECE5', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2" style={{ marginBottom: '2rem', paddingLeft: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ background: '#E6F2EB', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
            <Sprout size={22} color="#183D2D" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#183D2D', fontWeight: 800, lineHeight: 1.1 }}>fieldnote</h2>
            <span style={{ fontSize: '0.65rem', color: '#6B8074', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>SMART FARMER</span>
          </div>
        </div>

        {/* User Card */}
        <div style={{ background: '#F4F7F4', padding: '0.75rem 0.9rem', borderRadius: '14px', marginBottom: '1.5rem', border: '1px solid #E4ECE7', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#183D2D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            {user?.name ? user.name[0] : 'R'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#183D2D', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.name || 'Robert Miller'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B8074' }}>Farm manager</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  color: isActive ? '#183D2D' : '#52665A',
                  background: isActive ? '#E6F2EB' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <IconComponent size={18} color={undefined} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sign out */}
      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          fontWeight: 500,
          fontSize: '0.88rem',
          color: '#52665A',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <LogOut size={18} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}
