import { NavLink } from 'react-router-dom';
import { Compass, Heart, MessageCircle, Shield, User, Settings } from 'lucide-react';

const navItems = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/safety-hub', label: 'Safety', icon: Shield },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}