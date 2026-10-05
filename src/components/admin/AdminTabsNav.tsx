'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, ShieldCheck, ClipboardList } from 'lucide-react';

const ADMIN_TABS = [
  {
    name: 'Broadcasts',
    href: '/admin/announcements',
    icon: Radio,
    enabled: true,
  },
  {
    name: 'Verifications & Staging',
    href: '/admin/verifications',
    icon: ShieldCheck,
    enabled: true,
  },
  {
    name: 'Logistics',
    href: '/admin/logistics',
    icon: ClipboardList,
    // For testing, set to true. For production, check Date.now() >= new Date('2026-10-09T00:00:00+05:30').getTime()
    enabled: Date.now() >= Date.now(), // Temporarily set to now as requested
  },
];

export default function AdminTabsNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
      <div className="admin-tabs-list">
        {ADMIN_TABS.filter(tab => tab.enabled).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');

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
