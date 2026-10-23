import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Faculty, Student, Subject } from '../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  Database,
  Plus,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const {
    studentsList,
    facultyList,
    subjects,
    sections,
    departments,
    courses,
    config,
    addStudent,
    toggleStudentStatus,
    addFaculty,
    addSubject,
    updateConfig,
    exportDatabaseJson,
    importDatabaseJson,
    resetToDemoData,
  } = useApp();

  type AdminTab = 'STUDENTS' | 'FACULTY' | 'ACADEMIC' | 'POLICY' | 'BACKUP';
  const [activeTab, setActiveTab] = useState<AdminTab>('STUDENTS');

  // New Student Modal Form
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    username: '',
    sectionId: sections[0]?.id || '',
    semester: 3,
    courseId: courses[0]?.id || '',
    departmentId: departments[0]?.id || '',
  });

  // New Faculty Modal Form
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [newFacultyForm, setNewFacultyForm] = useState({
    fullName: '',
    employeeCode: '',
    email: '',
    username: '',
    designation: 'Assistant Professor',
    departmentId: departments[0]?.id || '',
    assignedSubjectIds: [] as string[],
  });

  // Policy Form
  const [thresholdInput, setThresholdInput] = useState<number>(config.thresholdPercentage);
  const [warningMarginInput, setWarningMarginInput] = useState<number>(config.warningMargin);
  const [excludeLeave, setExcludeLeave] = useState<boolean>(
    config.excludeApprovedLeaveFromEligible
  );
  const [lateAsPresent, setLateAsPresent] = useState<boolean>(config.lateCountsAsPresent);

  // Status message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newStudentForm.fullName.trim() || !newStudentForm.rollNumber.trim()) {
      setMessage({ type: 'error', text: 'Name and Roll Number are required.' });
      return;
    }

    const email =
      newStudentForm.email.trim() ||
      `${newStudentForm.rollNumber.toLowerCase()}@student.edu`;
    const username =
      newStudentForm.username.trim() ||
      newStudentForm.fullName.toLowerCase().replace(/\s+/g, '_');

    const res = addStudent({
      ...newStudentForm,
      email,
      username,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setShowAddStudentModal(false);
      setNewStudentForm({
        fullName: '',
        rollNumber: '',
        email: '',
        username: '',
        sectionId: sections[0]?.id || '',
        semester: 3,
        courseId: courses[0]?.id || '',
        departmentId: departments[0]?.id || '',
      });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newFacultyForm.fullName.trim() || !newFacultyForm.employeeCode.trim()) {
      setMessage({ type: 'error', text: 'Name and Employee Code are required.' });
      return;
    }

    const email =
      newFacultyForm.email.trim() ||
      `${newFacultyForm.fullName.toLowerCase().replace(/\s+/g, '.')}@smartattend.edu`;
    const username =
      newFacultyForm.username.trim() ||
      `prof_${newFacultyForm.fullName.toLowerCase().split(' ')[0]}`;

    const res = addFaculty({
      ...newFacultyForm,
      email,
      username,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setShowAddFacultyModal(false);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      thresholdPercentage: Number(thresholdInput),
      warningMargin: Number(warningMarginInput),
      excludeApprovedLeaveFromEligible: excludeLeave,
      lateCountsAsPresent: lateAsPresent,
    });
    setMessage({
      type: 'success',
      text: 'Institutional attendance calculation policy successfully updated.',
    });
  };

  const handleBackupDownload = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartAttend_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDatabaseJson(content);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Administration & Configuration Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage institutional entities, student rosters, faculty assignments, attendance policies, and system backup/restore.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'STUDENTS'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Students ({studentsList.length})
        </button>
        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'FACULTY'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Faculty ({facultyList.length})
        </button>
        <button
          onClick={() => setActiveTab('ACADEMIC')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'ACADEMIC'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Courses & Subjects
        </button>
        <button
          onClick={() => setActiveTab('POLICY')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'POLICY'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Policy Rules
        </button>
        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'BACKUP'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Backup & Recovery
        </button>
      </div>

      {/* TAB 1: STUDENTS */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Student Directory</h2>
              <p className="text-xs text-slate-500">
                Enroll, manage, or deactivate student records
              </p>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Student</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Roll Number</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Section</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsList.map((st) => {
                  const sec = sections.find((s) => s.id === st.sectionId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-600 font-medium">
                        {st.rollNumber}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{st.email}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-mono">
                        {sec?.name || 'CSE-3A'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            st.isActive
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(st.id)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
                            st.isActive
                              ? 'text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {st.isActive ? (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY */}
      {activeTab === 'FACULTY' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Faculty Members</h2>
              <p className="text-xs text-slate-500">
                Staff credentials and subject assignment
              </p>
            </div>
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Faculty</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Employee Code</th>
                  <th className="py-2.5 px-4">Faculty Name</th>
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Assigned Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyList.map((fac) => {
                  const assignedSubjs = subjects.filter((s) =>
                    fac.assignedSubjectIds.includes(s.id)
                  );
                  return (
                    <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {fac.employeeCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {fac.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{fac.designation}</td>
                      <td className="py-3 px-4 text-slate-500">{fac.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {assignedSubjs.length > 0 ? (
                            assignedSubjs.map((sb) => (
                              <span
                                key={sb.id}
                                className="bg-blue-50 text-blue-800 text-[11px] font-medium px-2 py-0.5 rounded"
                              >
                                {sb.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">None assigned</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC */}
      {activeTab === 'ACADEMIC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subjects Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Curriculum Subjects</h2>
            <div className="divide-y divide-slate-100">
              {subjects.map((s) => {
                const fac = facultyList.find((f) => f.id === s.facultyId);
                return (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        {s.code}: {s.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Instructor: {fac?.fullName || 'Unassigned'} · Credits: {s.credits}
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Sem {s.semester}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Departments & Sections */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Departments & Sections</h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Departments
                </span>
                <div className="mt-1 space-y-1">
                  {departments.map((d) => (
                    <div key={d.id} className="text-xs text-slate-800 p-2 bg-slate-50 rounded-lg">
                      <strong>{d.code}</strong> — {d.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Active Sections
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {sections.map((sec) => (
                    <span
                      key={sec.id}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 text-slate-800 rounded-md"
                    >
                      {sec.name} (Semester {sec.semester})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: POLICY */}
      {activeTab === 'POLICY' && (
        <form
          onSubmit={handleSavePolicy}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-2xl space-y-5"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Institutional Attendance Policy Rules
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure attendance thresholds, risk margins, and leave calculation rules.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Statutory Attendance Threshold Percentage (%) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Number(e.target.value))}
                  className="w-28 text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
                <span className="text-xs text-slate-500">
                  (College baseline: typically 75%)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Warning Threshold Margin (% above baseline) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={warningMarginInput}
                  onChange={(e) => setWarningMarginInput(Number(e.target.value))}
                  className="w-28 text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
                <span className="text-xs text-slate-500">
                  (e.g., 5% margin means 75% to 80% is categorized as WARNING)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeLeave}
                  onChange={(e) => setExcludeLeave(e.target.checked)}
                  className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-medium text-slate-900">
                    Exclude Approved Leaves from Total Eligible Sessions
                  </span>
                  <p className="text-[11px] text-slate-500">
                    When enabled, eligible classes = (Total Held - Approved Leaves). Student attendance percentage will not be penalized for verified official leave.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lateAsPresent}
                  onChange={(e) => setLateAsPresent(e.target.checked)}
                  className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-medium text-slate-900">
                    Count Late Arrivals as Full Attendance
                  </span>
                  <p className="text-[11px] text-slate-500">
                    If disabled, late arrivals count as 0.5 class credit instead of full credit.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Save Policy Configuration
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: BACKUP & RECOVERY */}
      {activeTab === 'BACKUP' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Data Backup & Disaster Recovery
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Export the current database state to an offline JSON backup or restore from a previous archive file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-slate-700" />
                <span>Export System Backup</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Downloads all students, subjects, attendance sessions, and correction logs to a local file.
              </p>
              <button
                type="button"
                onClick={handleBackupDownload}
                className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Download JSON Backup
              </button>
            </div>

            {/* Restore */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-slate-700" />
                <span>Restore from File</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload a valid JSON backup to restore previous attendance records and rosters.
              </p>
              <label className="block w-full mt-2 text-center px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                Choose Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-rose-700">Factory Reset</div>
              <p className="text-[11px] text-slate-500">
                Reset everything back to the pristine 24-student demo dataset.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to restore the default sample dataset?')) {
                  resetToDemoData();
                  setMessage({ type: 'success', text: 'Dataset reset to factory sample state.' });
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              Reset Database
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4"
          >
            <h3 className="text-base font-semibold text-slate-900">
              Enroll New Student
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentForm.fullName}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, fullName: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024CSE025"
                  value={newStudentForm.rollNumber}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Section *
                </label>
                <select
                  value={newStudentForm.sectionId}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, sectionId: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} (Semester {sec.semester})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddFacultyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateFaculty}
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4"
          >
            <h3 className="text-base font-semibold text-slate-900">
              Add Faculty Member
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={newFacultyForm.fullName}
                  onChange={(e) =>
                    setNewFacultyForm({ ...newFacultyForm, fullName: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Employee Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FAC-2024-001"
                  value={newFacultyForm.employeeCode}
                  onChange={(e) =>
                    setNewFacultyForm({ ...newFacultyForm, employeeCode: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={newFacultyForm.designation}
                  onChange={(e) =>
                    setNewFacultyForm({ ...newFacultyForm, designation: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFacultyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Save Faculty
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
