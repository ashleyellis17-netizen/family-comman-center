import { SchoolCenter } from '@/components/school-center';
import { children } from '@/lib/mock-data';
import { getAssignments } from '@/app/actions/school';
import { getProjects } from '@/app/actions/projects';

export const dynamic = 'force-dynamic';

export default async function SchoolPage() {
  const [assignments, projects] = await Promise.all([getAssignments(), getProjects()]);

  const childrenData = children.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    school: c.school,
  }));

  return <SchoolCenter childrenData={childrenData} assignments={assignments} projects={projects} />;
}
