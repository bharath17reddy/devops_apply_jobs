'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trello, ClipboardList, UserCircle, Settings, Zap } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Trello },
  { name: 'Applications', href: '/applications', icon: ClipboardList },
  { name: 'Auto-Apply', href: '/auto-apply', icon: Zap },
  { name: 'Profile / CV', href: '/profile', icon: UserCircle },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid var(--card-border)',
      background: 'var(--background)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: 'var(--primary)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>G</div>
        <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em' }}>CAREER OPS</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? 'white' : 'var(--muted)',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '600' : '400'
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
        <Link 
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            color: 'var(--muted)',
            fontSize: '0.9rem'
          }}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </nav>
  );
}
