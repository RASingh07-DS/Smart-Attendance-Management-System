import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateStudentAttendance } from '../utils/attendanceCalculator';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  PlusCircle,
} from 'lucide-react';
import { Faculty, Student } from '../types';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    studentsList,
    sessions,
    subjects,
    correctionRequests,
    config,
    setActiveNavTab,
  } = useApp();

  const isFaculty = currentUser.role === 'FACULTY';
  const facultyUser = isFaculty ? (currentUser as Faculty) : null;

  // Filter sessions if faculty
  const relevantSessions = isFaculty
    ? sessions.filter((s) => facultyUser?.assignedSubjectIds.includes(s.subjectId))
    : sessions;

  const relevantSubjects = isFaculty
    ? subjects.filter((s) => facultyUser?.assignedSubjectIds.includes(s.id))
    : subjects;

  // Calculate statistics for each active student
  const studentMetrics = studentsList
    .filter((s) => s.isActive)
    .map((student) => {
      const studentSessions = relevantSessions.filter((s) =>
        s.records.some((r) => r.studentId === student.id)
      );
      const calc = calculateStudentAttendance(student.id, studentSessions, config);
      return {
        student,
        calc,
      };
    });

  const totalStudents = studentsList.filter((s) => s.isActive).length;
  const totalSessions = relevantSessions.length;
  const pendingRequests = correctionRequests.filter((r) => r.status === 'PENDING').length;

  // Calculate overall college/faculty attendance percentage
  const validPercentages = studentMetrics
    .map((m) => m.calc.percentage)
    .filter((p): p is number => p !== null);

  const averageAttendance =
    validPercentages.length > 0
      ? validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length
      : 0;

  const safeStudents = studentMetrics.filter((m) => m.calc.riskLevel === 'SAFE');
  const warningStudents = studentMetrics.filter((m) => m.calc.riskLevel === 'WARNING');
  const criticalStudents = studentMetrics.filter((m) => m.calc.riskLevel === 'CRITICAL');

  const recentSessions = [...relevantSessions].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isFaculty ? `Faculty Dashboard — ${currentUser.fullName}` : 'College Attendance Overview'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active Attendance Threshold is configured at{' '}
              <span className="font-semibold text-slate-800">{config.thresholdPercentage}%</span>
              {config.excludeApprovedLeaveFromEligible
                ? ' · Approved leaves are excluded from eligible sessions'
                : ' · Approved leaves are counted as eligible sessions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNavTab('mark-attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record New Session</span>
            </button>
            <button
              onClick={() => setActiveNavTab('reports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">active records</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Sem 3 (Sections 3A & 3B)</span>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Classes Conducted</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {totalSessions}
            </span>
            <span className="text-xs text-slate-500">recorded sessions</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {relevantSubjects.length} subjects
          </div>
        </div>

        {/* Card 3: Average Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {averageAttendance.toFixed(2)}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">overall</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Target threshold: {config.thresholdPercentage}%
          </div>
        </div>

        {/* Card 4: Students at Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Attendance Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              {criticalStudents.length}
            </span>
            <span className="text-xs text-rose-600 font-medium">below threshold</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            + {warningStudents.length} in warning range
          </div>
        </div>
      </div>

      {/* Two Column Layout: Risk Distribution & Critical Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Critical Students Alert Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Students Requiring Immediate Attendance Remediation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students currently below the {config.thresholdPercentage}% statutory threshold
              </p>
            </div>
            <button
              onClick={() => setActiveNavTab('reports')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span>Full Risk List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {criticalStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No students are currently below the {config.thresholdPercentage}% threshold. Excellent attendance health!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Roll Number</th>
                    <th className="py-2.5 px-4 text-right">Attended / Total</th>
                    <th className="py-2.5 px-4 text-right">Current %</th>
                    <th className="py-2.5 px-4">Required Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalStudents.map(({ student, calc }) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {student.rollNumber}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {calc.classesAttended} / {calc.eligibleSessions}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-semibold text-rose-600 font-mono tabular-nums">
                          {calc.percentageFormatted}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <span className="text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                          Attend next {calc.classesNeededForTarget} consecutive classes
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Risk Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Attendance Distribution
          </h2>

          <div className="space-y-3">
            {/* Safe */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">
                  Safe (≥ {config.thresholdPercentage + config.warningMargin}%)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {safeStudents.length} students ({((safeStudents.length / totalStudents) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${(safeStudents.length / totalStudents) * 100}%` }}
                />
              </div>
            </div>

            {/* Warning */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">
                  Warning ({config.thresholdPercentage}% to {config.thresholdPercentage + config.warningMargin}%)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {warningStudents.length} students ({((warningStudents.length / totalStudents) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${(warningStudents.length / totalStudents) * 100}%` }}
                />
              </div>
            </div>

            {/* Critical */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">
                  Critical (&lt; {config.thresholdPercentage}%)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {criticalStudents.length} students ({((criticalStudents.length / totalStudents) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-2 rounded-full"
                  style={{ width: `${(criticalStudents.length / totalStudents) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Pending Correction Requests:</span>
              <button
                onClick={() => setActiveNavTab('correction-requests')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {pendingRequests} requests to review →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Sessions List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent Attendance Sessions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last recorded class meetings</p>
          </div>
          <button
            onClick={() => setActiveNavTab('history')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
          >
            <span>View All Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentSessions.map((session) => {
            const subject = subjects.find((s) => s.id === session.subjectId);
            const presentCount = session.records.filter((r) => r.status === 'PRESENT').length;
            const lateCount = session.records.filter((r) => r.status === 'LATE').length;
            const absentCount = session.records.filter((r) => r.status === 'ABSENT').length;
            const leaveCount = session.records.filter((r) => r.status === 'LEAVE').length;

            return (
              <div
                key={session.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {subject?.code}: {subject?.name}
                    </span>
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {session.sessionType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{session.topic}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Date: {session.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>Session ID: {session.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-emerald-700">
                    <span className="font-bold">{presentCount}</span> Present
                  </div>
                  {lateCount > 0 && (
                    <div className="text-amber-700">
                      <span className="font-bold">{lateCount}</span> Late
                    </div>
                  )}
                  <div className="text-rose-700">
                    <span className="font-bold">{absentCount}</span> Absent
                  </div>
                  {leaveCount > 0 && (
                    <div className="text-blue-700">
                      <span className="font-bold">{leaveCount}</span> Leave
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
