import { requireParentPage } from '@/lib/household';

export async function ParentOnlyLayout({ children }: { children: React.ReactNode }) {
  await requireParentPage();
  return <>{children}</>;
}
