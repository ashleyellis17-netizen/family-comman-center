'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { grades, children, getChildStats } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { GraduationCap, TrendingUp, Filter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChildId } from '@/lib/types';

type ChildFilterType = 'all' | ChildId;

function getGradeColor(grade: number) {
  if (grade >= 90) return 'text-success';
  if (grade >= 80) return 'text-primary';
  if (grade >= 70) return 'text-warning-foreground';
  return 'text-destructive';
}

export default function GradesPage() {
  const [childFilter, setChildFilter] = useState<ChildFilterType>('all');

  const filteredGrades = grades
    .filter((grade) => {
      if (childFilter !== 'all' && grade.childId !== childFilter) return false;
      return true;
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  // Calculate averages by child
  const gradesByChild = children.map((child) => {
    const stats = getChildStats(child.id);
    const childGrades = grades.filter((g) => g.childId === child.id);
    const subjectAverages = childGrades.reduce(
      (acc, g) => {
        if (!acc[g.subject]) {
          acc[g.subject] = { total: 0, count: 0 };
        }
        acc[g.subject].total += g.grade;
        acc[g.subject].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return {
      child,
      average: stats.gradeAverage,
      subjects: Object.entries(subjectAverages).map(([subject, data]) => ({
        subject,
        average: Math.round(data.total / data.count),
      })),
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="cozyla-heading text-foreground flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          Grades
        </h1>
        <p className="text-muted-foreground mt-1">
          Track academic performance
        </p>
      </div>

      {/* Grade Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gradesByChild.map(({ child, average, subjects }) => (
          <div
            key={child.id}
            className={cn(
              'rounded-2xl p-4 shadow-lg border-2',
              `border-${child.color}/50 bg-${child.color}-muted/20`
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <ChildAvatar childId={child.id as ChildId} name={child.name} size="md" />
              <div>
                <p className="font-bold text-foreground">{child.name}</p>
                <p
                  className={cn('text-2xl font-bold', getGradeColor(average))}
                >
                  {average}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {subjects.map(({ subject, average: subAvg }) => (
                <div
                  key={subject}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {subject}
                  </span>
                  <span className={cn('font-medium', getGradeColor(subAvg))}>
                    {subAvg}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filter by Child</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={childFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setChildFilter('all')}
            className="touch-target"
          >
            All Kids
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={childFilter === child.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setChildFilter(child.id as ChildId)}
              className={cn(
                'touch-target',
                childFilter === child.id &&
                  `bg-${child.color} hover:bg-${child.color}/90`
              )}
            >
              {child.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Grades List */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Recent Grades</h2>
          <p className="text-sm text-muted-foreground">
            {filteredGrades.length} grades
          </p>
        </div>

        <div className="divide-y divide-border">
          {filteredGrades.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No grades recorded yet</p>
            </div>
          ) : (
            filteredGrades.map((grade) => {
              const child = children.find((c) => c.id === grade.childId);
              if (!child) return null;

              return (
                <div
                  key={grade.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <ChildAvatar
                    childId={child.id as ChildId}
                    name={child.name}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {grade.subject}
                      </p>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          `bg-${child.color}/20 text-${child.color}`
                        )}
                      >
                        {child.name}
                      </span>
                    </div>
                    {grade.assignment && (
                      <p className="text-sm text-muted-foreground">
                        {grade.assignment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(grade.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        getGradeColor(grade.grade)
                      )}
                    >
                      {grade.letterGrade}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {grade.grade}%
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grade Scale Legend */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <p className="text-sm font-medium text-foreground mb-3">Grade Scale</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span className="text-sm text-muted-foreground">A (90-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">B (80-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span className="text-sm text-muted-foreground">C (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-sm text-muted-foreground">{'D/F (<70%)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
