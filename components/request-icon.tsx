import {
  Cookie,
  CupSoda,
  GlassWater,
  Utensils,
  Gamepad2,
  Tv,
  Tablet,
  TreePine,
  UserRoundPlus,
  Hand,
  CheckCheck,
  Heart,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  cookie: Cookie,
  'cup-soda': CupSoda,
  'glass-water': GlassWater,
  utensils: Utensils,
  'gamepad-2': Gamepad2,
  tv: Tv,
  tablet: Tablet,
  'tree-pine': TreePine,
  'user-round-plus': UserRoundPlus,
  hand: Hand,
  'check-check': CheckCheck,
  heart: Heart,
};

export function RequestIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && iconMap[name]) || MessageCircle;
  return <Icon className={className} />;
}
