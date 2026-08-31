'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  User,
  ListTodo,
  Star,
  Calendar,
  GraduationCap,
  Wallet,
  Gift,
  Shield,
  Menu,
  X,
  Heart,
  Trophy,
  Lock,
  RotateCcw,
  ClipboardCheck,
  ShoppingCart,
  ListChecks,
  ChefHat,
  CalendarDays,
  Package,
  Mail,
  Database,
  UserCog,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type NavItem = { href: string; label: string; icon: React.ElementType; color?: string };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/family-hub', label: 'Family Hub', icon: Home },
    ],
  },
  {
    title: 'The Boys',
    items: [
      { href: '/alex', label: 'Alex', icon: User, color: 'alex' },
      { href: '/jaxon', label: 'Jaxon', icon: User, color: 'jaxon' },
      { href: '/carson', label: 'Carson', icon: User, color: 'carson' },
    ],
  },
  {
    title: 'Daily',
    items: [
      { href: '/chores', label: 'Chores', icon: ListTodo },
      { href: '/behavior', label: 'Behavior', icon: Star },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
      { href: '/grades', label: 'Grades', icon: GraduationCap },
      { href: '/allowance', label: 'Allowance', icon: Wallet },
      { href: '/rewards', label: 'Rewards', icon: Gift },
    ],
  },
  {
    title: 'School',
    items: [
      { href: '/school', label: 'School Center', icon: GraduationCap },
      { href: '/reward-unlock', label: 'Reward Unlock Center', icon: Trophy },
      { href: '/grounding', label: 'Grounding & Eligibility', icon: Lock },
      { href: '/earn-back', label: 'Earn Back Plan', icon: RotateCcw },
      { href: '/approvals', label: 'Parent Approval Queue', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Food & Home',
    items: [
      { href: '/grocery-list', label: 'Grocery List', icon: ShoppingCart },
      { href: '/grocery-wishlist', label: 'Grocery Wishlist', icon: ListChecks },
      { href: '/meal-ideas', label: 'Meal Ideas', icon: ChefHat },
      { href: '/meal-plan', label: 'Weekly Meal Plan', icon: CalendarDays },
      { href: '/pantry', label: 'Pantry & Staples', icon: Package },
    ],
  },
  {
    title: 'Parents',
    items: [
      { href: '/mom', label: 'Mom Profile', icon: UserCog },
      { href: '/dad', label: 'Dad Profile', icon: UserCog },
    ],
  },
  {
    title: 'Setup',
    items: [
      { href: '/google-accounts', label: 'Google Accounts', icon: Mail },
      { href: '/data-connection', label: 'Data Connection', icon: Database },
      { href: '/admin', label: 'Admin', icon: Shield },
    ],
  },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  const activeColorClass =
    item.color === 'alex'
      ? 'bg-gradient-to-r from-alex to-alex-light text-white shadow-md shadow-alex/25'
      : item.color === 'jaxon'
      ? 'bg-gradient-to-r from-jaxon to-jaxon-light text-white shadow-md shadow-jaxon/25'
      : item.color === 'carson'
      ? 'bg-gradient-to-r from-carson to-carson-light text-carson-foreground shadow-md shadow-carson/25'
      : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25';

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-200 touch-target',
        isActive ? activeColorClass : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5 p-4">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
            {group.title}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-jaxon to-carson flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
        <Heart className="w-5 h-5 text-white fill-white/50" />
      </div>
      <div>
        <h1 className="text-lg font-extrabold text-foreground tracking-tight">Theveny Family</h1>
        <p className="text-xs text-muted-foreground font-medium">Command Center</p>
      </div>
    </Link>
  );
}

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r border-border/40 bg-card/70 backdrop-blur-sm">
        <div className="p-4 border-b border-border/40">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <nav className="lg:hidden flex items-center justify-between p-4 bg-card/90 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50 shadow-sm">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="touch-target rounded-xl hover:bg-accent"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-50 bg-background/98 backdrop-blur-sm overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <NavContent onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
