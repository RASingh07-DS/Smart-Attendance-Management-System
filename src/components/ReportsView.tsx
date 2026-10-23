import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateStudentAttendance } from '../utils/attendanceCalculator';
import { downloadCsv, generateCsvString } from '../utils/csvExporter';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    studentsList,
    sessions,
    subjects,
    sections,
    correctionRequests,
    config,
  } = useApp();

  type ReportType =
    | 'STUDENT_MASTER'
    | 'BELOW_THRESHOLD'
    | 'SUBJECT_WISE'
    | 'ABSENT_LIST'
    | 'CORRECTIONS_AUDIT';

  const [reportType, setReportType] = useState<ReportType>('STUDENT_MASTER');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'name' | 'roll' | 'percentage'>('roll');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Active students
  const activeStudents = useMemo(() => {
    return studentsList.filter((s) => s.isActive);
  }, [studentsList]);

  // Compute master student attendance calculations
  const studentMasterData = useMemo(() => {
    return activeStudents.map((student) => {
      // Filter sessions by subject if chosen
      const relevantSessions = sessions.filter((s) => {
        if (selectedSubject !== 'ALL' && s.subjectId !== selectedSubject) return false;
        if (selectedSection !== 'ALL' && s.sectionId !== selectedSection) return false;
        return s.records.some((r) => r.studentId === student.id);
      });

      const calc = calculateStudentAttendance(student.id, relevantSessions, config);
      const section = sections.find((sec) => sec.id === student.sectionId);

      return {
        student,
        sectionName: section?.name || '',
        calc,
      };
    });
  }, [activeStudents, sessions, selectedSubject, selectedSection, config, sections]);

  // Filtered and sorted master student data
  const filteredStudentMasterData = useMemo(() => {
    let result = studentMasterData;

    // Report specific filters
    if (reportType === 'BELOW_THRESHOLD') {
      result = result.filter((item) => item.calc.riskLevel === 'CRITICAL');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.student.fullName.toLowerCase().includes(q) ||
          item.student.rollNumber.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.student.fullName.localeCompare(b.student.fullName);
      } else if (sortField === 'roll') {
        cmp = a.student.rollNumber.localeCompare(b.student.rollNumber);
      } else if (sortField === 'percentage') {
        const pA = a.calc.percentage ?? -1;
        const pB = b.calc.percentage ?? -1;
        cmp = pA - pB;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [studentMasterData, reportType, searchQuery, sortField, sortAsc]);

  // Absent student list records
  const absentRecords = useMemo(() => {
    const list: {
      studentName: string;
      rollNumber: string;
      subjectCode: string;
      sessionDate: string;
      topic: string;
      remarks?: string;
    }[] = [];

    sessions.forEach((s) => {
      if (selectedSubject !== 'ALL' && s.subjectId !== selectedSubject) return;
      if (selectedSection !== 'ALL' && s.sectionId !== selectedSection) return;

      const subject = subjects.find((sb) => sb.id === s.subjectId);

      s.records.forEach((r) => {
        if (r.status === 'ABSENT') {
          const st = studentsList.find((std) => std.id === r.studentId);
          if (st) {
            list.push({
              studentName: st.fullName,
              rollNumber: st.rollNumber,
              subjectCode: subject?.code || '',
              sessionDate: s.date,
              topic: s.topic,
              remarks: r.remarks,
            });
          }
        }
      });
    });

    return list;
  }, [sessions, selectedSubject, selectedSection, subjects, studentsList]);

  // Subject-wise aggregated statistics
  const subjectWiseAggregates = useMemo(() => {
    return subjects.map((subj) => {
      const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
      let totalRecords = 0;
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;

      subjSessions.forEach((s) => {
        s.records.forEach((r) => {
          totalRecords++;
          if (r.status === 'PRESENT') presentCount++;
          if (r.status === 'ABSENT') absentCount++;
          if (r.status === 'LATE') lateCount++;
          if (r.status === 'LEAVE') leaveCount++;
        });
      });

      const eligibleTotal = config.excludeApprovedLeaveFromEligible
        ? Math.max(0, totalRecords - leaveCount)
        : totalRecords;

      const attendedTotal = config.lateCountsAsPresent
        ? presentCount + lateCount
        : presentCount + lateCount * 0.5;

      const avgPct = eligibleTotal > 0 ? (attendedTotal / eligibleTotal) * 100 : 0;

      return {
        subject: subj,
        sessionsCount: subjSessions.length,
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        averagePercentage: Math.round(avgPct * 100) / 100,
      };
    });
  }, [subjects, sessions, config]);

  // Export CSV Handler
  const handleExportCsv = () => {
    let filename = 'SmartAttend_Report';
    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];

    if (reportType === 'STUDENT_MASTER' || reportType === 'BELOW_THRESHOLD') {
      filename =
        reportType === 'BELOW_THRESHOLD'
          ? 'Students_Below_Threshold_Risk'
          : 'Student_Attendance_Master';

      headers = [
        'Roll Number',
        'Student Name',
        'Section',
        'Total Sessions',
        'Approved Leaves',
        'Eligible Sessions',
        'Classes Attended',
        'Absences',
        'Attendance %',
        'Risk Status',
        'Consecutive Classes Needed For 75%',
      ];

      rows = filteredStudentMasterData.map((item) => [
        item.student.rollNumber,
        item.student.fullName,
        item.sectionName,
        item.calc.totalSessionsHeld,
        item.calc.approvedLeaves,
        item.calc.eligibleSessions,
        item.calc.classesAttended,
        item.calc.absences,
        item.calc.percentage !== null ? item.calc.percentage.toFixed(2) : 'N/A',
        item.calc.riskLevel,
        item.calc.classesNeededForTarget,
      ]);
    } else if (reportType === 'SUBJECT_WISE') {
      filename = 'Subject_Wise_Attendance_Summary';
      headers = [
        'Subject Code',
        'Subject Name',
        'Sessions Held',
        'Total Student Entries',
        'Present Count',
        'Absent Count',
        'Late Count',
        'Leave Count',
        'Average Attendance %',
      ];
      rows = subjectWiseAggregates.map((item) => [
        item.subject.code,
        item.subject.name,
        item.sessionsCount,
        item.totalRecords,
        item.presentCount,
        item.absentCount,
        item.lateCount,
        item.leaveCount,
        item.averagePercentage.toFixed(2),
      ]);
    } else if (reportType === 'ABSENT_LIST') {
      filename = 'Absent_Students_Roster';
      headers = [
        'Roll Number',
        'Student Name',
        'Subject',
        'Session Date',
        'Topic',
        'Remarks',
      ];
      rows = absentRecords.map((r) => [
        r.rollNumber,
        r.studentName,
        r.subjectCode,
        r.sessionDate,
        r.topic,
        r.remarks || '',
      ]);
    } else if (reportType === 'CORRECTIONS_AUDIT') {
      filename = 'Attendance_Corrections_Audit';
      headers = [
        'Request ID',
        'Roll Number',
        'Student Name',
        'Subject',
        'Session Date',
        'Original Status',
        'Requested Status',
        'Review Status',
        'Reason',
        'Reviewer',
        'Reviewed At',
        'Review Remarks',
      ];
      rows = correctionRequests.map((r) => [
        r.id,
        r.rollNumber,
        r.studentName,
        r.subjectName,
        r.sessionDate,
        r.originalStatus,
        r.requestedStatus,
        r.status,
        r.reason,
        r.reviewerName || '',
        r.reviewedAt || '',
        r.reviewRemarks || '',
      ]);
    }

    const csvContent = generateCsvString(headers, rows);
    downloadCsv(filename, csvContent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate audited attendance sheets, risk analysis lists, and export RFC-4180 CSV files.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Current View to CSV</span>
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setReportType('STUDENT_MASTER')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'STUDENT_MASTER'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Master Report
        </button>
        <button
          onClick={() => setReportType('BELOW_THRESHOLD')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'BELOW_THRESHOLD'
              ? 'bg-white text-slate-900 shadow-xs font-semibold text-rose-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Below Threshold (&lt; {config.thresholdPercentage}%)
        </button>
        <button
          onClick={() => setReportType('SUBJECT_WISE')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'SUBJECT_WISE'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Subject-wise Aggregate
        </button>
        <button
          onClick={() => setReportType('ABSENT_LIST')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'ABSENT_LIST'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Absence Log
        </button>
        <button
          onClick={() => setReportType('CORRECTIONS_AUDIT')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'CORRECTIONS_AUDIT'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Corrections Audit Log
        </button>
      </div>

      {/* Filtering Toolbar */}
      {(reportType === 'STUDENT_MASTER' ||
        reportType === 'BELOW_THRESHOLD' ||
        reportType === 'ABSENT_LIST') && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {reportType === 'ABSENT_LIST'
              ? `${absentRecords.length} absent entries`
              : `${filteredStudentMasterData.length} students listed`}
          </div>
        </div>
      )}

      {/* Report Table Display */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* VIEW 1 & 2: Student Master & Below Threshold */}
        {(reportType === 'STUDENT_MASTER' || reportType === 'BELOW_THRESHOLD') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th
                    className="py-2.5 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => {
                      if (sortField === 'roll') setSortAsc(!sortAsc);
                      else {
                        setSortField('roll');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Roll Number</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => {
                      if (sortField === 'name') setSortAsc(!sortAsc);
                      else {
                        setSortField('name');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Student Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-4">Section</th>
                  <th className="py-2.5 px-4 text-right">Eligible</th>
                  <th className="py-2.5 px-4 text-right">Attended</th>
                  <th className="py-2.5 px-4 text-right">Leaves</th>
                  <th className="py-2.5 px-4 text-right">Absences</th>
                  <th
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-slate-900"
                    onClick={() => {
                      if (sortField === 'percentage') setSortAsc(!sortAsc);
                      else {
                        setSortField('percentage');
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Percentage</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Remediation Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudentMasterData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudentMasterData.map((item) => (
                    <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {item.student.rollNumber}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {item.student.fullName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{item.sectionName}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                        {item.calc.eligibleSessions}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900 font-medium">
                        {item.calc.classesAttended}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
                        {item.calc.approvedLeaves}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-700">
                        {item.calc.absences}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            item.calc.riskLevel === 'CRITICAL'
                              ? 'text-rose-600'
                              : item.calc.riskLevel === 'WARNING'
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {item.calc.percentageFormatted}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.calc.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : item.calc.riskLevel === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.calc.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                        {item.calc.riskLevel === 'CRITICAL' ? (
                          <span className="text-rose-700 font-medium">
                            Need {item.calc.classesNeededForTarget} consecutive classes
                          </span>
                        ) : item.calc.maxClassesCanMiss > 0 ? (
                          <span className="text-slate-500">
                            Can miss {item.calc.maxClassesCanMiss} classes
                          </span>
                        ) : (
                          <span className="text-amber-700">At boundary</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: Subject-wise Aggregation */}
        {reportType === 'SUBJECT_WISE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Subject Name</th>
                  <th className="py-2.5 px-4 text-right">Classes Held</th>
                  <th className="py-2.5 px-4 text-right">Total Entries</th>
                  <th className="py-2.5 px-4 text-right">Present</th>
                  <th className="py-2.5 px-4 text-right">Late</th>
                  <th className="py-2.5 px-4 text-right">Absent</th>
                  <th className="py-2.5 px-4 text-right">Leave</th>
                  <th className="py-2.5 px-4 text-right">Average Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectWiseAggregates.map((item) => (
                  <tr key={item.subject.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {item.subject.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.subject.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {item.sessionsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {item.totalRecords}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      {item.presentCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                      {item.lateCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-700">
                      {item.absentCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">
                      {item.leaveCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {item.averagePercentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 4: Absent Students Log */}
        {reportType === 'ABSENT_LIST' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Roll Number</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Lecture Topic</th>
                  <th className="py-2.5 px-4">Recorded Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absentRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-600">{r.sessionDate}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                      {r.rollNumber}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {r.studentName}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {r.subjectCode}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{r.topic}</td>
                    <td className="py-2.5 px-4 text-slate-500">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 5: Corrections Audit Log */}
        {reportType === 'CORRECTIONS_AUDIT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Correction</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Reviewer Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {correctionRequests.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-600">{cr.sessionDate}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {cr.studentName} ({cr.rollNumber})
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">{cr.subjectName}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {cr.originalStatus} →{' '}
                      <span className="font-bold text-slate-900">{cr.requestedStatus}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cr.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cr.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cr.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                      {cr.reason}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {cr.reviewRemarks || 'Pending review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
