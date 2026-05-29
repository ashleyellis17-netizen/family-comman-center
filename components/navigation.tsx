'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
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
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alex', label: 'Alex', icon: User, color: 'alex' },
  { href: '/jaxon', label: 'Jaxon', icon: User, color: 'jaxon' },
  { href: '/carson', label: 'Carson', icon: User, color: 'carson' },
  { href: '/chores', label: 'Chores', icon: ListTodo },
  { href: '/behavior', label: 'Behavior', icon: Star },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/grades', label: 'Grades', icon: GraduationCap },
  { href: '/allowance', label: 'Allowance', icon: Wallet },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1 p-4 bg-card/80 backdrop-blur-sm border-b border-border/40 overflow-x-auto sticky top-0 z-50 shadow-sm">
        <Link href="/" className="mr-6 flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-jaxon to-carson flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-105 duration-300">
            <Heart className="w-5 h-5 text-white fill-white/50" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground whitespace-nowrap tracking-tight">Theveny Boys</h1>
            <p className="text-xs text-muted-foreground font-medium">Family Dashboard</p>
          </div>
        </Link>
        <div className="flex items-center gap-1 bg-muted/50 rounded-2xl p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            const activeColorClass = item.color === 'alex' 
              ? 'bg-gradient-to-r from-alex to-alex-light text-white shadow-lg shadow-alex/25'
              : item.color === 'jaxon'
              ? 'bg-gradient-to-r from-jaxon to-jaxon-light text-white shadow-lg shadow-jaxon/25'
              : item.color === 'carson'
              ? 'bg-gradient-to-r from-carson to-carson-light text-carson-foreground shadow-lg shadow-carson/25'
              : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25';

            const hoverColorClass = item.color === 'alex'
              ? 'hover:text-alex hover:bg-alex-muted'
              : item.color === 'jaxon'
              ? 'hover:text-jaxon hover:bg-jaxon-muted'
              : item.color === 'carson'
              ? 'hover:text-carson hover:bg-carson-muted'
              : 'hover:text-primary hover:bg-accent';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 touch-target whitespace-nowrap',
                  isActive
                    ? activeColorClass
                    : cn('text-muted-foreground', hoverColorClass)
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden flex items-center justify-between p-4 bg-card/90 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-jaxon to-carson flex items-center justify-center shadow-lg">
            <Heart className="w-4 h-4 text-white fill-white/50" />
          </div>
          <h1 className="text-base font-extrabold text-foreground">Theveny Boys</h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="touch-target rounded-xl hover:bg-accent"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-50 bg-background/98 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              const activeColorClass = item.color === 'alex' 
                ? 'bg-gradient-to-br from-alex to-alex-light text-white shadow-xl shadow-alex/25'
                : item.color === 'jaxon'
                ? 'bg-gradient-to-br from-jaxon to-jaxon-light text-white shadow-xl shadow-jaxon/25'
                : item.color === 'carson'
                ? 'bg-gradient-to-br from-carson to-carson-light text-carson-foreground shadow-xl shadow-carson/25'
                : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25';

              const hoverClass = item.color === 'alex'
                ? 'hover:bg-alex-muted hover:border-alex/30'
                : item.color === 'jaxon'
                ? 'hover:bg-jaxon-muted hover:border-jaxon/30'
                : item.color === 'carson'
                ? 'hover:bg-carson-muted hover:border-carson/30'
                : 'hover:bg-accent hover:border-primary/30';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-base font-semibold transition-all duration-200 touch-target hover-lift',
                    isActive
                      ? activeColorClass
                      : cn('bg-card text-muted-foreground border border-border/50', hoverClass)
                  )}
                >
                  <Icon className="w-7 h-7" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
