'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  Calendar,
  CalendarDays,
  ChefHat,
  ClipboardCheck,
  Database,
  Gift,
  Heart,
  Home,
  ListChecks,
  ListTodo,
  Lock,
  LogOut,
  Mail,
  Menu,
  Monitor,
  Package,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Sun,
  Trophy,
  User,
  UserCog,
  Wallet,
  X,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { unpairThisDisplay } from '@/app/actions/account';
import { SAMPLE_ROUTES } from '@/lib/sample-routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ShellActor = {
  kind: 'user' | 'display';
  role: 'parent' | 'member' | 'display';
  name: string;
  householdName: string;
};

type NavItem = { href: string; label: string; icon: React.ElementType; color?: 'alex' | 'jaxon' | 'carson'; parentOnly?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Home',
    items: [
      { href: '/', label: 'Today', icon: Sun },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
      { href: '/family-hub', label: 'Family Hub', icon: Home },
    ],
  },
  {
    title: 'Food',
    items: [
      { href: '/grocery-list', label: 'Grocery List', icon: ShoppingCart },
      { href: '/grocery-wishlist', label: 'Grocery Wishlist', icon: ListChecks },
      { href: '/meal-plan', label: 'Weekly Meal Plan', icon: CalendarDays },
      { href: '/meal-ideas', label: 'Meal Ideas', icon: ChefHat },
      { href: '/pantry', label: 'Pantry & Staples', icon: Package },
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
      { href: '/allowance', label: 'Allowance', icon: Wallet },
      { href: '/rewards', label: 'Rewards', icon: Gift },
      { href: '/reward-unlock', label: 'Reward Unlock Center', icon: Trophy },
      { href: '/grounding', label: 'Grounding & Eligibility', icon: Lock },
      { href: '/earn-back', label: 'Earn Back Plan', icon: RotateCcw },
    ],
  },
  {
    title: 'Parents',
    items: [
      { href: '/approvals', label: 'Parent Approval Queue', icon: ClipboardCheck, parentOnly: true },
      { href: '/mom', label: 'Mom Profile', icon: UserCog, parentOnly: true },
      { href: '/dad', label: 'Dad Profile', icon: UserCog, parentOnly: true },
      { href: '/settings', label: 'Household Settings', icon: Settings, parentOnly: true },
      { href: '/google-accounts', label: 'Google Accounts', icon: Mail, parentOnly: true },
      { href: '/data-connection', label: 'Data Connection', icon: Database, parentOnly: true },
      { href: '/admin', label: 'Admin', icon: Shield, parentOnly: true },
    ],
  },
];

const ACTIVE_CLASS: Record<string, string> = {
  alex: 'bg-alex text-white shadow-md shadow-alex/25',
  jaxon: 'bg-jaxon text-white shadow-md shadow-jaxon/25',
  carson: 'bg-carson text-carson-foreground shadow-md shadow-carson/25',
  default: 'bg-primary text-primary-foreground shadow-md shadow-primary/25',
};

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const isSample = SAMPLE_ROUTES.has(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors touch-target',
        isActive ? ACTIVE_CLASS[item.color ?? 'default'] : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="truncate flex-1">{item.label}</span>
      {isSample && (
        <span className={cn('text-[10px] font-bold uppercase tracking-wide', isActive ? 'opacity-80' : 'text-muted-foreground/70')}>
          Sample
        </span>
      )}
    </Link>
  );
}

function NavContent({ actor, onNavigate }: { actor: ShellActor; onNavigate?: () => void }) {
  const isParent = actor.role === 'parent';
  return (
    <nav aria-label="Main" className="flex flex-col gap-5 p-4">
      {navGroups.map((group) => {
        const items = group.items.filter((i) => !i.parentOnly || isParent);
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{group.title}</p>
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <NavLink key={item.href} item={item} onClick={onNavigate} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ householdName }: { householdName: string }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
        <Heart className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-foreground tracking-tight truncate">{householdName}</p>
        <p className="text-xs text-muted-foreground font-medium">Command Center</p>
      </div>
    </Link>
  );
}

function AccountFooter({ actor }: { actor: ShellActor }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      if (actor.kind === 'display') await unpairThisDisplay();
      else await authClient.signOut();
      router.push(actor.kind === 'display' ? '/display/pair' : '/sign-in');
      router.refresh();
    });
  }

  const roleLabel = actor.role === 'parent' ? 'Parent' : actor.role === 'display' ? 'Shared display' : 'Family member';
  return (
    <div className="flex items-center gap-3 border-t border-border/40 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {actor.kind === 'display' ? <Monitor className="w-5 h-5" aria-hidden="true" /> : <User className="w-5 h-5" aria-hidden="true" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{actor.name}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={signOut} disabled={pending} aria-label={actor.kind === 'display' ? 'Unpair this display' : 'Sign out of this device'}>
        <LogOut className="w-5 h-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function Navigation({ actor }: { actor: ShellActor }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r border-border/40 bg-card/80">
        <div className="p-4 border-b border-border/40">
          <Brand householdName={actor.householdName} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavContent actor={actor} />
        </div>
        <AccountFooter actor={actor} />
      </aside>

      <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border/40 sticky top-0 z-50 shadow-sm">
        <Brand householdName={actor.householdName} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="touch-target rounded-xl"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[77px] z-50 flex flex-col bg-background overflow-y-auto">
          <div className="flex-1">
            <NavContent actor={actor} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <AccountFooter actor={actor} />
        </div>
      )}
    </>
  );
}
