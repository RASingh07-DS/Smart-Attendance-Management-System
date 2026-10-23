import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const SubjectsCatalogView: React.FC = () => {
  const {
    subjects,
    facultyList,
    sessions,
    departments,
    currentUser,
    setActiveNavTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const facultyMap = useMemo(() => {
    const map = new Map<string, (typeof facultyList)[0]>();
    facultyList.forEach((f) => map.set(f.id, f));
    return map;
  }, [facultyList]);

  // Aggregate stats per subject
  const subjectCards = useMemo(() => {
    return subjects.map((subj) => {
      const subjectSessions = sessions.filter((s) => s.subjectId === subj.id);
      let totalAttended = 0;
      let totalEligible = 0;

      subjectSessions.forEach((sess) => {
        sess.records.forEach((rec) => {
          if (rec.status !== 'LEAVE') {
            totalEligible++;
            if (rec.status === 'PRESENT' || rec.status === 'LATE') {
              totalAttended++;
            }
          }
        });
      });

      const avgPct =
        totalEligible > 0 ? (totalAttended / totalEligible) * 100 : null;

      const faculty = facultyMap.get(subj.facultyId);

      return {
        subject: subj,
        faculty,
        sessionsCount: subjectSessions.length,
        avgPct,
      };
    });
  }, [subjects, sessions, facultyMap]);

  const filteredCards = subjectCards.filter(({ subject }) => {
    const matchesSearch =
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Curriculum Subjects & Course Directory
            </h1>
            <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
              {subjects.length} Active Courses
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse all semester academic courses, assigned faculty instructors, credit weights, and live attendance metrics.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-64 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(({ subject, faculty, sessionsCount, avgPct }) => (
          <div
            key={subject.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                  {subject.code}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {subject.credits} Credits · Sem {subject.semester}
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-2.5 line-clamp-1">
                {subject.name}
              </h2>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Course Instructor
                </div>
                <div className="font-semibold text-slate-900">
                  {faculty?.fullName || 'Unassigned Faculty'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {faculty?.designation || 'Department of Computer Science'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sessionsCount} classes recorded</span>
                </div>

                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{avgPct !== null ? `${avgPct.toFixed(1)}%` : 'New Course'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setActiveNavTab('reports')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  <span>View Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {currentUser.role !== 'STUDENT' && (
                  <button
                    onClick={() => setActiveNavTab('mark-attendance')}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Take Roll Call
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
