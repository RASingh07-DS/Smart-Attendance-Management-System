import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateStudentAttendance,
  calculateStudentSubjectSummaries,
  simulateAttendance,
} from '../utils/attendanceCalculator';
import { Student } from '../types';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Sparkles,
  TrendingUp,
  Clock,
  Send,
  ShieldCheck,
  Award,
  UploadCloud,
} from 'lucide-react';

export const StudentPortalView: React.FC = () => {
  const {
    currentUser,
    studentsList,
    subjects,
    facultyList,
    sessions,
    config,
    setActiveNavTab,
    submitCorrectionRequest,
  } = useApp();

  const isStudent = currentUser.role === 'STUDENT';
  const currentStudent: Student = isStudent
    ? (currentUser as Student)
    : studentsList[0]; // fallback if admin/teacher previews

  // Quick switch student dropdown (when testing as student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent.id);
  const activeStudent = studentsList.find((s) => s.id === selectedStudentId) || currentStudent;

  // Personal Attendance Goal (default 85% distinction)
  const [personalGoal, setPersonalGoal] = useState<number>(85);

  // Leave / Correction Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubjectId, setLeaveSubjectId] = useState<string>(subjects[0]?.id || '');
  const [leaveDate, setLeaveDate] = useState<string>('2026-10-23');
  const [leaveType, setLeaveType] = useState<string>('Medical');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveFileAttached, setLeaveFileAttached] = useState<boolean>(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string | null>(null);

  // Faculty mapping
  const facultyMap = useMemo(() => {
    const map = new Map<string, string>();
    facultyList.forEach((f) => map.set(f.id, f.fullName));
    return map;
  }, [facultyList]);

  // Subject summaries for this student
  const subjectSummaries = useMemo(() => {
    return calculateStudentSubjectSummaries(
      activeStudent.id,
      subjects,
      sessions,
      config,
      facultyMap
    );
  }, [activeStudent.id, subjects, sessions, config, facultyMap]);

  // Overall attendance across all subjects
  const overallResult = useMemo(() => {
    const studentSessions = sessions.filter((s) =>
      s.records.some((r) => r.studentId === activeStudent.id)
    );
    return calculateStudentAttendance(activeStudent.id, studentSessions, config);
  }, [activeStudent.id, sessions, config]);

  // Interactive What-If Simulator state
  const [selectedSubjectForSim, setSelectedSubjectForSim] = useState<string>(
    subjects[0]?.id || ''
  );
  const [futureTotalClasses, setFutureTotalClasses] = useState<number>(5);
  const [futureAttendedClasses, setFutureAttendedClasses] = useState<number>(5);

  const selectedSummary =
    subjectSummaries.find((s) => s.subjectId === selectedSubjectForSim) ||
    subjectSummaries[0];

  const simResult = useMemo(() => {
    if (!selectedSummary) return null;
    return simulateAttendance(
      selectedSummary.classesAttended,
      selectedSummary.eligibleClassesHeld,
      futureTotalClasses,
      futureAttendedClasses,
      config.thresholdPercentage
    );
  }, [selectedSummary, futureTotalClasses, futureAttendedClasses, config.thresholdPercentage]);

  // Attendance History sorted by date
  const attendanceHistory = useMemo(() => {
    const list: {
      date: string;
      subjectCode: string;
      subjectName: string;
      topic: string;
      status: string;
      remarks?: string;
    }[] = [];

    sessions.forEach((session) => {
      const record = session.records.find((r) => r.studentId === activeStudent.id);
      if (record) {
        const subj = subjects.find((s) => s.id === session.subjectId);
        list.push({
          date: session.date,
          subjectCode: subj?.code || '',
          subjectName: subj?.name || '',
          topic: session.topic,
          status: record.status,
          remarks: record.remarks,
        });
      }
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, activeStudent.id, subjects]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    // Find a session matching date or generic
    const targetSession = sessions.find((s) => s.subjectId === leaveSubjectId) || sessions[0];
    const subj = subjects.find((s) => s.id === leaveSubjectId);

    submitCorrectionRequest({
      studentId: activeStudent.id,
      studentName: activeStudent.fullName,
      rollNumber: activeStudent.rollNumber,
      sessionId: targetSession.id,
      subjectId: leaveSubjectId,
      subjectName: subj?.name || 'Class Session',
      sessionDate: leaveDate,
      originalStatus: 'ABSENT',
      requestedStatus: 'LEAVE',
      reason: `[${leaveType} Leave Application] ${leaveReason} ${
        leaveFileAttached ? '(Medical certificate document attached)' : ''
      }`,
    });

    setLeaveSuccessMsg('Leave / correction application successfully submitted to your instructor.');
    setTimeout(() => {
      setShowLeaveModal(false);
      setLeaveSuccessMsg(null);
      setLeaveReason('');
      setLeaveFileAttached(false);
    }, 2000);
  };

  const isDistinction = (overallResult.percentage ?? 0) >= personalGoal;
  const isSafe = overallResult.riskLevel === 'SAFE';

  return (
    <div className="space-y-6">
      {/* Student Profile Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Award className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-medium text-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Academic Hub · Fall Semester 2026</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {activeStudent.fullName}
              </h1>
              <span className="font-mono text-xs bg-white/15 px-2.5 py-0.5 rounded-md text-emerald-200 border border-white/10 font-bold">
                {activeStudent.rollNumber}
              </span>
            </div>

            <p className="text-xs text-emerald-200 max-w-xl">
              B.Tech Computer Science & Engineering · Semester {activeStudent.semester} (Section CSE-3A)
            </p>

            {/* Quick student picker if testing */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="text-emerald-300">View as student:</span>
              <select
                value={activeStudent.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-black/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-white text-xs focus:outline-hidden"
              >
                {studentsList.slice(0, 8).map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.fullName} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Apply for Leave / Slip</span>
            </button>
            <button
              onClick={() => setActiveNavTab('correction-requests')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Track My Requests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Strip with Circular Gauge Metric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Cumulative Attendance & Goal Ring */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Cumulative Standing
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                Attendance Percentage & Threshold Status
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                overallResult.riskLevel === 'SAFE'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : overallResult.riskLevel === 'WARNING'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {overallResult.riskLevel} STANDING
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Visual Percentage Display */}
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-slate-50 border-8 border-slate-100 shrink-0 shadow-inner">
              <div className="text-center">
                <span className="text-3xl font-extrabold font-mono text-slate-900 block tracking-tight">
                  {overallResult.percentageFormatted}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Target: {config.thresholdPercentage}%
                </span>
              </div>
            </div>

            {/* Breakdown & Insight Text */}
            <div className="space-y-3 flex-1 text-xs">
              <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                {overallResult.insightText}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="text-emerald-800 font-bold text-sm">
                    {overallResult.classesAttended}
                  </div>
                  <div className="text-[10px] text-emerald-600">Attended</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-900 font-bold text-sm">
                    {overallResult.eligibleSessions}
                  </div>
                  <div className="text-[10px] text-slate-500">Eligible</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-blue-800 font-bold text-sm">
                    {overallResult.approvedLeaves}
                  </div>
                  <div className="text-[10px] text-blue-600">Approved Leaves</div>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                  <div className="text-rose-800 font-bold text-sm">
                    {overallResult.absences}
                  </div>
                  <div className="text-[10px] text-rose-600">Absences</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Class Timetable for Student */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Classes</h2>
            <span className="text-[11px] text-slate-500 font-mono">Oct 23</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-900">10:00 AM · CS301 (Java)</div>
                <div className="text-[11px] text-slate-600">LH-302 · Prof. Elena Rostova</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                MARKED PRESENT
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-900">11:30 AM · CS302 (DBMS)</div>
                <div className="text-[11px] text-slate-600">Hall B · Prof. Marcus Chen</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                MARKED PRESENT
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-900">02:00 PM · CS303 (Algorithms)</div>
                <div className="text-[11px] text-slate-600">Room 204 · Prof. Priya Sharma</div>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                UPCOMING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Subject-wise Attendance Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            Statutory Threshold: {config.thresholdPercentage}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectSummaries.map((summary) => {
            const pct = summary.percentage !== null ? summary.percentage : 0;
            const isCritical = summary.riskLevel === 'CRITICAL';
            const isWarning = summary.riskLevel === 'WARNING';

            return (
              <div
                key={summary.subjectId}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {summary.subjectCode}
                      </div>
                      <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                        {summary.subjectName}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {summary.riskLevel}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">
                    Instructor: {summary.facultyName}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                      {summary.percentage !== null ? `${summary.percentage.toFixed(2)}%` : 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {summary.classesAttended} / {summary.eligibleClassesHeld} attended
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                {/* Insight footer */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  {isCritical ? (
                    <div className="text-rose-700 font-medium">
                      Attend next {summary.classesNeededForThreshold} consecutive classes to reach {config.thresholdPercentage}%.
                    </div>
                  ) : summary.maxClassesCanMiss > 0 ? (
                    <div className="text-emerald-700">
                      Can miss at most {summary.maxClassesCanMiss} upcoming classes while maintaining target.
                    </div>
                  ) : (
                    <div className="text-amber-700">
                      Borderline: missing 1 upcoming class will breach the threshold.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive What-If Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Smart Attendance Simulator (What-If Projection)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Simulate how attending or missing future sessions will impact your percentage. Uses the exact mathematical formula without guesswork.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectForSim}
              onChange={(e) => setSelectedSubjectForSim(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Future Total Classes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Upcoming Classes Scheduled: <span className="font-mono font-bold text-slate-900">{futureTotalClasses}</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={futureTotalClasses}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFutureTotalClasses(val);
                if (futureAttendedClasses > val) setFutureAttendedClasses(val);
              }}
              className="w-full cursor-pointer accent-slate-900"
            />
          </div>

          {/* Future Classes You Will Attend */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Classes You Plan to Attend: <span className="font-mono font-bold text-slate-900">{futureAttendedClasses}</span>
            </label>
            <input
              type="range"
              min={0}
              max={futureTotalClasses}
              value={futureAttendedClasses}
              onChange={(e) => setFutureAttendedClasses(Number(e.target.value))}
              className="w-full cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* Simulator Results Box */}
        {simResult && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              simResult.meetsTarget
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {simResult.meetsTarget ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  Projected Attendance: {simResult.projectedPercentage.toFixed(2)}%
                </span>
                <span className="text-[11px] font-normal text-slate-600">
                  ({simResult.delta >= 0 ? `+${simResult.delta.toFixed(2)}%` : `${simResult.delta.toFixed(2)}%`} from current)
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                {simResult.meetsTarget
                  ? `Success: You will satisfy the statutory ${config.thresholdPercentage}% attendance threshold!`
                  : `Warning: You will still be below the ${config.thresholdPercentage}% threshold. You need to attend more classes.`}
              </p>
            </div>

            <div className="text-xs font-mono shrink-0">
              New Ratio: <strong>{simResult.projectedAttended}</strong> /{' '}
              <strong>{simResult.projectedEligible}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Attendance Record Log
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {attendanceHistory.length} total sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Topic</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-600">{item.date}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {item.subjectCode}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{item.topic}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        item.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-800'
                          : item.status === 'ABSENT'
                          ? 'bg-rose-50 text-rose-800'
                          : item.status === 'LATE'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{item.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleApplyLeave}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Apply for Leave / Duty Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {leaveSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{leaveSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={leaveSubjectId}
                    onChange={(e) => setLeaveSubjectId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Leave Date
                    </label>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Medical">Medical Leave</option>
                      <option value="Institutional Duty">College Duty / Hackathon</option>
                      <option value="Bereavement">Family Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Reason & Details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide detailed explanation for your instructor..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Attach Supporting Document / Medical Certificate
                  </label>
                  <div
                    onClick={() => setLeaveFileAttached(!leaveFileAttached)}
                    className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                      leaveFileAttached
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    {leaveFileAttached ? (
                      <span className="font-semibold text-emerald-700">
                        ✓ medical_certificate_verified.pdf attached (Click to remove)
                      </span>
                    ) : (
                      <span>Click to attach hospital / event slip (PDF or JPG)</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                  >
                    Submit Leave Application
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
