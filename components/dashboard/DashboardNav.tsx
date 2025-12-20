import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { 
    icon: '🔮', 
    title: 'Ask Merlin', 
    description: 'Get instant cosmic guidance',
    href: '/dashboard/ask'
  },
  { 
    icon: '📊', 
    title: 'View Chart', 
    description: 'See your natal chart',
    href: '/dashboard/chart'
  },
  { 
    icon: '🌟', 
    title: 'Transits', 
    description: 'Current cosmic influences',
    href: '/dashboard/transits'
  },
  { 
    icon: '📅', 
    title: 'Forecast', 
    description: 'Weekly predictions',
    href: '/dashboard/forecast'
  },
  { 
    icon: '⚙️', 
    title: 'Settings', 
    description: 'Manage your profile',
    href: '/dashboard/settings'
  }
];

export function DashboardNav() {
  const pathname = usePathname();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`p-4 rounded-lg border transition-all duration-200 ${
            pathname === item.href
              ? 'bg-white/10 border-white/20 shadow-lg'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="font-medium text-white">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
