import { SchoolView } from '@/components/school-view';
import { children } from '@/lib/mock-data';
import { getAssignments, getSchoolBehavior } from '@/app/actions/school';

export const dynamic = 'force-dynamic';

export default async function SchoolPage() {
  const [assignments, behavior] = await Promise.all([getAssignments(), getSchoolBehavior()]);

  const childrenData = children.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    school: c.school,
  }));

  return <SchoolView childrenData={childrenData} assignments={assignments} behavior={behavior} />;
}
