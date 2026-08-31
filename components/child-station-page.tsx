import { ChildProfilePage } from '@/components/child-profile-page';
import { CheckInStation } from '@/components/check-in/check-in-station';
import { children } from '@/lib/mock-data';
import type { ChildId } from '@/lib/types';
import { getAssignments, getSkillCheckins } from '@/app/actions/school';
import { getProjects } from '@/app/actions/projects';
import { getBrainDump } from '@/app/actions/brain-dump';
import { getParentRequests } from '@/app/actions/parent-requests';
import { getFamilyPlan } from '@/lib/family-data';

// Server component: fetches the child's check-in data, renders the
// After-School Check-In Station on top, and the existing profile below.
export async function ChildStationPage({ childId }: { childId: ChildId }) {
  const child = children.find((c) => c.id === childId);
  if (!child) return null;

  const [allAssignments, projects, brainDump, parentRequests, skillCheckins, plan] = await Promise.all([
    getAssignments(),
    getProjects(childId),
    getBrainDump(childId),
    getParentRequests(childId),
    getSkillCheckins(childId),
    getFamilyPlan(),
  ]);

  const assignments = allAssignments.filter((a) => a.childId === childId);

  // Calendar events for this child (or the whole family) surface in "Coming up",
  // so a test/field trip that lives only on the calendar still shows here.
  const comingUpEvents = plan.filter(
    (i) => i.source === 'event' && (i.childId === childId || i.childId === 'family')
  );

  return (
    <div className="space-y-10">
      <CheckInStation
        childId={childId}
        childName={child.name}
        grade={child.grade}
        assignments={assignments}
        projects={projects}
        brainDump={brainDump}
        parentRequests={parentRequests}
        skillCheckins={skillCheckins}
        comingUpEvents={comingUpEvents}
      />

      <div className="pt-2 border-t border-border/60">
        <ChildProfilePage childId={childId} />
      </div>
    </div>
  );
}
