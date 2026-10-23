import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { downloadCsv, generateCsvString } from '../utils/csvExporter';

export const AttendanceHistoryView: React.FC = () => {
  const {
    sessions,
    subjects,
    sections,
    studentsList,
    currentUser,
    updateAttendanceRecord,
  } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    sessions[0]?.id || null
  );

  // Inline editing state: { recordId, studentId, sessionId, currentStatus, remarks }
  const [editingRecord, setEditingRecord] = useState<{
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    remarks: string;
  } | null>(null);

  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectFilter !== 'ALL' && s.subjectId !== selectedSubjectFilter)
      return false;
    if (selectedSectionFilter !== 'ALL' && s.sectionId !== selectedSectionFilter)
      return false;
    return true;
  });

  const handleExportSessionCsv = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const subject = subjects.find((sb) => sb.id === session.subjectId);

    const headers = [
      'Roll Number',
      'Student Name',
      'Status',
      'Subject Code',
      'Subject Name',
      'Session Date',
      'Session Type',
      'Lecture Topic',
      'Remarks',
    ];

    const rows = session.records.map((r) => {
      const student = studentsList.find((st) => st.id === r.studentId);
      return [
        student?.rollNumber || '',
        student?.fullName || '',
        r.status,
        subject?.code || '',
        subject?.name || '',
        session.date,
        session.sessionType,
        session.topic,
        r.remarks || '',
      ];
    });

    const csvData = generateCsvString(headers, rows);
    downloadCsv(`Attendance_${subject?.code || 'Session'}_${session.date}.csv`, csvData);
  };

  const handleSaveInlineEdit = () => {
    if (!editingRecord) return;
    updateAttendanceRecord(
      editingRecord.sessionId,
      editingRecord.studentId,
      editingRecord.status,
      editingRecord.remarks
    );
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance Sessions & Records Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse recorded lectures, review individual student status, and apply authorized corrections.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Records List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No attendance sessions found matching the selected filters.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const subject = subjects.find((s) => s.id === session.subjectId);
            const section = sections.find((sec) => sec.id === session.sectionId);
            const isExpanded = expandedSessionId === session.id;

            const presentCount = session.records.filter((r) => r.status === 'PRESENT').length;
            const lateCount = session.records.filter((r) => r.status === 'LATE').length;
            const absentCount = session.records.filter((r) => r.status === 'ABSENT').length;
            const leaveCount = session.records.filter((r) => r.status === 'LEAVE').length;

            return (
              <div
                key={session.id}
                className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all"
              >
                {/* Session Header Strip */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="px-5 py-4 cursor-pointer hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-transparent data-[expanded=true]:border-slate-200 transition-colors"
                  data-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {subject?.code} · {subject?.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {section?.name}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {session.sessionType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        {session.topic}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Date: {session.date} · Recorded: {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Summary counts & CSV export */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-emerald-700">
                      <span className="font-bold">{presentCount}</span> P
                    </div>
                    {lateCount > 0 && (
                      <div className="text-amber-700">
                        <span className="font-bold">{lateCount}</span> L
                      </div>
                    )}
                    <div className="text-rose-700">
                      <span className="font-bold">{absentCount}</span> A
                    </div>
                    {leaveCount > 0 && (
                      <div className="text-blue-700">
                        <span className="font-bold">{leaveCount}</span> LV
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSessionCsv(session.id);
                      }}
                      className="ml-2 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Export this session roster to CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Expanded Student Table */}
                {isExpanded && (
                  <div className="overflow-x-auto bg-slate-50/30">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-4 w-12 text-center">#</th>
                          <th className="py-2 px-4">Student</th>
                          <th className="py-2 px-4">Roll Number</th>
                          <th className="py-2 px-4">Status</th>
                          <th className="py-2 px-4">Remarks</th>
                          <th className="py-2 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {session.records.map((record, index) => {
                          const student = studentsList.find((s) => s.id === record.studentId);
                          const isEditing =
                            editingRecord?.sessionId === session.id &&
                            editingRecord?.studentId === record.studentId;

                          return (
                            <tr key={record.id} className="hover:bg-white transition-colors">
                              <td className="py-2 px-4 text-center text-slate-400 font-mono text-[11px]">
                                {index + 1}
                              </td>
                              <td className="py-2 px-4 font-medium text-slate-900">
                                {student?.fullName || record.studentId}
                              </td>
                              <td className="py-2 px-4 font-mono text-slate-500 text-[11px]">
                                {student?.rollNumber || 'N/A'}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <select
                                    value={editingRecord.status}
                                    onChange={(e) =>
                                      setEditingRecord({
                                        ...editingRecord,
                                        status: e.target.value as AttendanceStatus,
                                      })
                                    }
                                    className="px-2 py-0.5 border border-slate-300 rounded text-xs bg-white"
                                  >
                                    <option value="PRESENT">PRESENT</option>
                                    <option value="ABSENT">ABSENT</option>
                                    <option value="LATE">LATE</option>
                                    <option value="LEAVE">LEAVE</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                      record.status === 'PRESENT'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : record.status === 'ABSENT'
                                        ? 'bg-rose-50 text-rose-800'
                                        : record.status === 'LATE'
                                        ? 'bg-amber-50 text-amber-800'
                                        : 'bg-blue-50 text-blue-800'
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-slate-500">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingRecord.remarks}
                                    onChange={(e) =>
                                      setEditingRecord({
                                        ...editingRecord,
                                        remarks: e.target.value,
                                      })
                                    }
                                    placeholder="Reason for change..."
                                    className="px-2 py-0.5 border border-slate-300 rounded text-xs w-full bg-white"
                                  />
                                ) : (
                                  record.remarks || '—'
                                )}
                              </td>
                              <td className="py-2 px-4 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={handleSaveInlineEdit}
                                      className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                      title="Save change"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingRecord(null)}
                                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingRecord({
                                        sessionId: session.id,
                                        studentId: record.studentId,
                                        status: record.status,
                                        remarks: record.remarks || '',
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-0.5 rounded hover:bg-slate-100"
                                  >
                                    <Edit2 className="w-3 h-3 text-slate-400" />
                                    <span>Correct</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
