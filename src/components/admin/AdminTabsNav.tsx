'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Radio, ShieldCheck } from 'lucide-react';

const ADMIN_TABS = [
  {
    name: 'Command Center',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Broadcasts',
    href: '/admin/announcements',
    icon: Radio,
    exact: false,
  },
  {
    name: 'Verifications & Staging',
    href: '/admin/verifications',
    icon: ShieldCheck,
    exact: false,
  },
];

export default function AdminTabsNav() {
  const pathname = usePathname();

  // Hide the redundant "Command Center" tab when already on the Command Center (/admin) page
  const visibleTabs = ADMIN_TABS.filter((tab) => {
    if (pathname === '/admin' && tab.href === '/admin') {
      return false;
    }
    return true;
  });

  return (
    <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
      <div className="admin-tabs-list">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact 
            ? pathname === tab.href 
            : pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`admin-tab-item ${isActive ? 'admin-tab-item-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} className="admin-tab-icon" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
