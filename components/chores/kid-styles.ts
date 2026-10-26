// Literal class names so Tailwind can see them (template-built names like `bg-${color}` are never generated).
export const KID_STYLES: Record<string, { soft: string; text: string; solid: string; ring: string }> = {
  alex: { soft: 'bg-alex/10', text: 'text-alex', solid: 'bg-alex text-alex-foreground hover:bg-alex/90', ring: 'border-alex/40' },
  jaxon: { soft: 'bg-jaxon/10', text: 'text-jaxon', solid: 'bg-jaxon text-jaxon-foreground hover:bg-jaxon/90', ring: 'border-jaxon/40' },
  carson: { soft: 'bg-carson/10', text: 'text-carson', solid: 'bg-carson text-carson-foreground hover:bg-carson/90', ring: 'border-carson/40' },
}

export function kidStyle(id: string) {
  return KID_STYLES[id] ?? { soft: 'bg-muted', text: 'text-foreground', solid: 'bg-primary text-primary-foreground', ring: 'border-border' }
}
