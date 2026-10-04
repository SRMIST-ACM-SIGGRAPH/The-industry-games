'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, ShieldCheck } from 'lucide-react';

const ADMIN_TABS = [
  {
    name: 'Broadcasts',
    href: '/admin/announcements',
    icon: Radio,
  },
  {
    name: 'Verifications & Staging',
    href: '/admin/verifications',
    icon: ShieldCheck,
  },
];

export default function AdminTabsNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
      <div className="admin-tabs-list">
        {ADMIN_TABS.map((tab) => {
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
