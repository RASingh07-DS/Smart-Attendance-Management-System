import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, Faculty } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  Save,
} from 'lucide-react';

export const MarkAttendanceView: React.FC = () => {
  const {
    currentUser,
    subjects,
    sections,
    studentsList,
    sessions,
    createAttendanceSession,
    setActiveNavTab,
  } = useApp();

  const isFaculty = currentUser.role === 'FACULTY';
  const facultyUser = isFaculty ? (currentUser as Faculty) : null;

  // Filter available subjects for faculty
  const availableSubjects = useMemo(() => {
    if (isFaculty && facultyUser) {
      return subjects.filter((s) => facultyUser.assignedSubjectIds.includes(s.id));
    }
    return subjects;
  }, [subjects, isFaculty, facultyUser]);

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || ''
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ''
  );
  const [sessionDate, setSessionDate] = useState<string>('2026-10-23');
  const [sessionType, setSessionType] = useState<'LECTURE' | 'LAB' | 'TUTORIAL'>('LECTURE');
  const [topic, setTopic] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Attendance Records State: Map studentId -> { status: AttendanceStatus, remarks: string }
  const [recordsMap, setRecordsMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter active enrolled students for selected section
  const enrolledStudents = useMemo(() => {
    return studentsList.filter(
      (s) => s.isActive && s.sectionId === selectedSectionId
    );
  }, [studentsList, selectedSectionId]);

  // Initialize or maintain records when section changes
  React.useEffect(() => {
    setRecordsMap((prev) => {
      const next: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      enrolledStudents.forEach((student) => {
        next[student.id] = prev[student.id] || { status: 'PRESENT', remarks: '' };
      });
      return next;
    });
  }, [enrolledStudents]);

  // Check if session already exists for this subject, section, date, sessionType
  const duplicateSession = useMemo(() => {
    return sessions.find(
      (s) =>
        s.subjectId === selectedSubjectId &&
        s.sectionId === selectedSectionId &&
        s.date === sessionDate &&
        s.sessionType === sessionType
    );
  }, [sessions, selectedSubjectId, selectedSectionId, sessionDate, sessionType]);

  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setStudentRemarks = (studentId: string, remarks: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    setRecordsMap((prev) => {
      const updated = { ...prev };
      enrolledStudents.forEach((st) => {
        updated[st.id] = { ...updated[st.id], status };
      });
      return updated;
    });
  };

  // Summaries
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    enrolledStudents.forEach((st) => {
      const rec = recordsMap[st.id];
      if (!rec) return;
      if (rec.status === 'PRESENT') present++;
      if (rec.status === 'ABSENT') absent++;
      if (rec.status === 'LATE') late++;
      if (rec.status === 'LEAVE') leave++;
    });

    return { present, absent, late, leave, total: enrolledStudents.length };
  }, [enrolledStudents, recordsMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!topic.trim()) {
      setNotification({
        type: 'error',
        text: 'Please specify a lecture or session topic before saving.',
      });
      return;
    }

    if (duplicateSession) {
      setNotification({
        type: 'error',
        text: `A ${sessionType} session for this class on ${sessionDate} already exists. Duplicate session entries are prohibited.`,
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSaveSession = () => {
    setShowConfirmModal(false);

    const recordList = enrolledStudents.map((st) => {
      const r = recordsMap[st.id] || { status: 'PRESENT', remarks: '' };
      return {
        id: '',
        sessionId: '',
        studentId: st.id,
        status: r.status,
        remarks: r.remarks ? r.remarks : undefined,
        recordedAt: new Date().toISOString(),
      };
    });

    const result = createAttendanceSession({
      subjectId: selectedSubjectId,
      sectionId: selectedSectionId,
      facultyId: currentUser.id,
      date: sessionDate,
      sessionType,
      topic: topic.trim(),
      records: recordList,
    });

    if (result.success) {
      setNotification({
        type: 'success',
        text: `Attendance session successfully submitted! Recorded ${recordList.length} student entries.`,
      });
      setTopic('');
    } else {
      setNotification({
        type: 'error',
        text: result.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Mark Attendance Session
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select class parameters, verify student enrollment roster, and mark daily attendance.
        </p>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          {notification.type === 'success' && (
            <button
              onClick={() => setActiveNavTab('history')}
              className="font-semibold underline hover:no-underline"
            >
              View in Session Logs →
            </button>
          )}
        </div>
      )}

      {/* Session Parameters Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Session Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Section *
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} (Semester {sec.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Session Date *
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Session Type *
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="LECTURE">Theory Lecture</option>
              <option value="LAB">Practical Laboratory</option>
              <option value="TUTORIAL">Tutorial / Discussion</option>
            </select>
          </div>

          {/* Lecture Topic */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Lecture Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Java Streams & Lambdas"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {duplicateSession && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Duplicate Conflict:</strong> A {sessionType} session for this subject and section already exists on {sessionDate} (Topic: &quot;{duplicateSession.topic}&quot;).
            </span>
          </div>
        )}
      </form>

      {/* Roster & Quick Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter student name or roll..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-56 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <span className="text-xs text-slate-500">
              {enrolledStudents.length} students enrolled
            </span>
          </div>

          {/* Quick Mark Batch Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll('PRESENT')}
              className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => markAll('ABSENT')}
              className="px-2.5 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Live Status Counter Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-6 text-xs font-mono">
          <div className="text-slate-600">
            Total: <span className="font-semibold text-slate-900">{stats.total}</span>
          </div>
          <div className="text-emerald-700">
            Present: <span className="font-semibold">{stats.present}</span>
          </div>
          <div className="text-rose-700">
            Absent: <span className="font-semibold">{stats.absent}</span>
          </div>
          <div className="text-amber-700">
            Late: <span className="font-semibold">{stats.late}</span>
          </div>
          <div className="text-blue-700">
            Leave: <span className="font-semibold">{stats.leave}</span>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Roll Number</th>
                <th className="py-2.5 px-4 text-center">Attendance Status</th>
                <th className="py-2.5 px-4">Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No students match the criteria for section {selectedSectionId}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const currentRecord = recordsMap[student.id] || {
                    status: 'PRESENT',
                    remarks: '',
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'PRESENT')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              currentRecord.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            P
                          </button>
                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'ABSENT')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              currentRecord.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            A
                          </button>
                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'LATE')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              currentRecord.status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            L
                          </button>
                          {/* Leave */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'LEAVE')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              currentRecord.status === 'LEAVE'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            LV
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={currentRecord.remarks}
                          onChange={(e) => setStudentRemarks(student.id, e.target.value)}
                          className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Submit Bar */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {stats.present} Present · {stats.absent} Absent · {stats.late} Late · {stats.leave} Leave
          </div>

          <button
            type="button"
            disabled={!!duplicateSession}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Confirm & Save Attendance Session</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5">
            <h3 className="text-base font-semibold text-slate-900">
              Confirm Attendance Submission
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              You are about to submit the attendance session for:
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200/60 font-mono">
              <div>
                <strong>Subject:</strong> {subjects.find((s) => s.id === selectedSubjectId)?.name}
              </div>
              <div>
                <strong>Date & Type:</strong> {sessionDate} ({sessionType})
              </div>
              <div>
                <strong>Topic:</strong> {topic}
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                Summary: {stats.present} Present, {stats.absent} Absent, {stats.late} Late, {stats.leave} Leave
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={confirmSaveSession}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
