import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Faculty, Student } from '../types';
import { calculateStudentAttendance } from '../utils/attendanceCalculator';
import { downloadCsv, generateCsvString } from '../utils/csvExporter';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileCheck2,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const TeacherPortalView: React.FC = () => {
  const {
    currentUser,
    facultyList,
    studentsList,
    sessions,
    subjects,
    sections,
    correctionRequests,
    config,
    setActiveNavTab,
    reviewCorrectionRequest,
  } = useApp();

  const isFaculty = currentUser.role === 'FACULTY';
  const currentFaculty: Faculty = isFaculty
    ? (currentUser as Faculty)
    : facultyList[0]; // fallback if admin views teacher portal

  // Assigned subjects for this faculty
  const assignedSubjects = useMemo(() => {
    return subjects.filter((s) => currentFaculty.assignedSubjectIds.includes(s.id));
  }, [subjects, currentFaculty]);

  // Sessions for this faculty's subjects
  const teacherSessions = useMemo(() => {
    return sessions.filter((s) => currentFaculty.assignedSubjectIds.includes(s.subjectId));
  }, [sessions, currentFaculty]);

  // Enrolled students in this faculty's classes (Section CSE-3A students)
  const myStudents = useMemo(() => {
    return studentsList.filter((s) => s.isActive && s.sectionId === 'sec-cse-3a');
  }, [studentsList]);

  // Calculate attendance for all students under this teacher
  const studentMetrics = useMemo(() => {
    return myStudents.map((st) => {
      const studentSessions = teacherSessions.filter((s) =>
        s.records.some((r) => r.studentId === st.id)
      );
      const calc = calculateStudentAttendance(st.id, studentSessions, config);
      return { student: st, calc };
    });
  }, [myStudents, teacherSessions, config]);

  const atRiskStudents = studentMetrics.filter((m) => m.calc.riskLevel === 'CRITICAL');
  const warningStudents = studentMetrics.filter((m) => m.calc.riskLevel === 'WARNING');

  // Pending requests for this teacher's subjects
  const pendingRequests = useMemo(() => {
    return correctionRequests.filter(
      (r) =>
        r.status === 'PENDING' &&
        currentFaculty.assignedSubjectIds.includes(r.subjectId)
    );
  }, [correctionRequests, currentFaculty]);

  // Quick review modal
  const [reviewState, setReviewState] = useState<{
    id: string;
    studentName: string;
    action: 'APPROVED' | 'REJECTED';
    notes: string;
  } | null>(null);

  const handleReview = () => {
    if (!reviewState) return;
    reviewCorrectionRequest(
      reviewState.id,
      reviewState.action === 'APPROVED',
      reviewState.notes || 'Verified by course instructor.'
    );
    setReviewState(null);
  };

  // Export teacher class list
  const handleExportTeacherRoster = () => {
    const subject = assignedSubjects[0];
    const headers = [
      'Roll Number',
      'Student Name',
      'Classes Held',
      'Attended',
      'Approved Leaves',
      'Absences',
      'Attendance %',
      'Risk Status',
      'Remediation Needed',
    ];
    const rows = studentMetrics.map((m) => [
      m.student.rollNumber,
      m.student.fullName,
      m.calc.eligibleSessions,
      m.calc.classesAttended,
      m.calc.approvedLeaves,
      m.calc.absences,
      m.calc.percentageFormatted,
      m.calc.riskLevel,
      m.calc.classesNeededForTarget > 0 ? `${m.calc.classesNeededForTarget} classes` : 'None',
    ]);
    const csvContent = generateCsvString(headers, rows);
    downloadCsv(`${subject?.code || 'Teacher'}_Student_Roster.csv`, csvContent);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-medium text-indigo-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Academic Workspace · Fall Term 2026</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {currentFaculty.fullName}
            </h1>
            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
              {currentFaculty.designation} · Employee ID:{' '}
              <span className="font-mono text-white">{currentFaculty.employeeCode}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-indigo-200">
              <span>Teaching Subjects:</span>
              {assignedSubjects.map((s) => (
                <span
                  key={s.id}
                  className="bg-white/10 px-2 py-0.5 rounded text-white font-medium border border-white/15"
                >
                  {s.code}: {s.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveNavTab('mark-attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Mark Today&apos;s Attendance</span>
            </button>
            <button
              onClick={handleExportTeacherRoster}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Class Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes Held */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sessions Conducted</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {teacherSessions.length}
            </span>
            <span className="text-xs text-slate-500">lectures & labs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Target: 24 semester sessions
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Students Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {myStudents.length}
            </span>
            <span className="text-xs text-slate-500">in Section 3A</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            B.Tech Computer Science
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Class Attendance Avg</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {(
                studentMetrics.reduce((acc, m) => acc + (m.calc.percentage || 0), 0) /
                (studentMetrics.length || 1)
              ).toFixed(1)}
              %
            </span>
            <span className="text-xs text-emerald-700 font-medium">on target</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Statutory baseline: {config.thresholdPercentage}%
          </div>
        </div>

        {/* Students At Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Attendance Risk Alert</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              {atRiskStudents.length}
            </span>
            <span className="text-xs text-rose-600 font-medium">below 75%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            + {warningStudents.length} borderline students
          </div>
        </div>
      </div>

      {/* Today's Teaching Schedule & Classes */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Today&apos;s Class Schedule & Attendance Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled academic meetings for Friday, October 23, 2026
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            Week 7 · Day 5
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Lecture 1 */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-mono text-xs font-bold shrink-0 border border-indigo-100">
                <span>10:00</span>
                <span className="text-[10px] text-indigo-500">AM</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    CS301: Object-Oriented Programming (Java)
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Section CSE-3A
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                    Lecture
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Topic: Java Generics, Bounded Wildcards & Reflection
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Room: LH-302</span>
                  <span aria-hidden="true">·</span>
                  <span>12 Students Enrolled</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveNavTab('mark-attendance')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>

          {/* Lecture 2 */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center font-mono text-xs font-bold shrink-0 border border-blue-100">
                <span>02:00</span>
                <span className="text-[10px] text-blue-500">PM</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    CS301: Java Programming Laboratory
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Section CSE-3A
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                    Lab Session
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Topic: Multithreading, Synchronization & Socket I/O Hands-on
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Room: Computing Lab 3</span>
                  <span aria-hidden="true">·</span>
                  <span>12 Students Enrolled</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveNavTab('mark-attendance')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Lab Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Critical Defaulter Watchlist & Pending Dispute Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: At Risk Watchlist for this Teacher */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Course Attendance Defaulters ({atRiskStudents.length})
              </h2>
              <p className="text-xs text-slate-500">
                Students below 75% in your assigned classes
              </p>
            </div>
            <button
              onClick={() => setActiveNavTab('reports')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <span>Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {atRiskStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No students currently in critical risk status.
              </div>
            ) : (
              atRiskStudents.map(({ student, calc }) => (
                <div
                  key={student.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {student.fullName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {student.rollNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Attended {calc.classesAttended} / {calc.eligibleSessions} classes ({calc.absences} absences)
                    </div>
                    <div className="text-[11px] text-rose-700 font-medium">
                      Must attend next {calc.classesNeededForTarget} consecutive classes
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-rose-600">
                      {calc.percentageFormatted}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">CRITICAL</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Pending Student Correction Requests for Teacher */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Pending Correction Disputes ({pendingRequests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Direct student appeals awaiting your review
              </p>
            </div>
            <button
              onClick={() => setActiveNavTab('correction-requests')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No pending correction disputes for your subjects.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {req.studentName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({req.rollNumber})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Session: {req.sessionDate}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <div className="text-[11px] text-slate-500 mb-1">
                      Correction requested: <strong className="text-rose-600">{req.originalStatus}</strong> &rarr;{' '}
                      <strong className="text-emerald-600">{req.requestedStatus}</strong>
                    </div>
                    <p className="italic text-slate-800">&ldquo;{req.reason}&rdquo;</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setReviewState({
                          id: req.id,
                          studentName: req.studentName,
                          action: 'REJECTED',
                          notes: 'Insufficient documentation provided.',
                        })
                      }
                      className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewState({
                          id: req.id,
                          studentName: req.studentName,
                          action: 'APPROVED',
                          notes: 'Verified attendance and academic slip.',
                        })
                      }
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
                    >
                      Approve Correction
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewState && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Confirm {reviewState.action}
            </h3>
            <p className="text-xs text-slate-600">
              Provide instructor decision notes for <strong>{reviewState.studentName}</strong>:
            </p>
            <input
              type="text"
              value={reviewState.notes}
              onChange={(e) =>
                setReviewState({ ...reviewState, notes: e.target.value })
              }
              className="w-full text-xs p-2 border border-slate-200 rounded-lg"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewState(null)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReview}
                className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
