import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialAdmin,
  initialAuditLogs,
  initialConfig,
  initialCorrectionRequests,
  initialCourses,
  initialDepartments,
  initialFaculty,
  initialSections,
  initialSessions,
  initialStudents,
  initialSubjects,
} from '../data/initialData';
import {
  Admin,
  AttendanceConfig,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AuditLogEntry,
  CorrectionRequest,
  Course,
  Department,
  Faculty,
  Section,
  Student,
  Subject,
  User,
} from '../types';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  allUsers: User[];
  departments: Department[];
  courses: Course[];
  sections: Section[];
  subjects: Subject[];
  facultyList: Faculty[];
  studentsList: Student[];
  sessions: AttendanceSession[];
  correctionRequests: CorrectionRequest[];
  config: AttendanceConfig;
  auditLogs: AuditLogEntry[];
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  backgroundTheme: string;
  setBackgroundTheme: (theme: string) => void;

  // Actions
  createAttendanceSession: (
    session: Omit<AttendanceSession, 'id' | 'createdAt'>
  ) => { success: boolean; message: string; session?: AttendanceSession };
  updateAttendanceRecord: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => void;
  submitCorrectionRequest: (
    request: Omit<CorrectionRequest, 'id' | 'createdAt' | 'status'>
  ) => { success: boolean; message: string };
  reviewCorrectionRequest: (
    requestId: string,
    approved: boolean,
    remarks: string
  ) => { success: boolean; message: string };

  // Admin CRUD
  addStudent: (student: Omit<Student, 'id' | 'role' | 'isActive'>) => { success: boolean; message: string };
  updateStudent: (student: Student) => { success: boolean; message: string };
  toggleStudentStatus: (studentId: string) => void;
  addFaculty: (faculty: Omit<Faculty, 'id' | 'role' | 'isActive'>) => { success: boolean; message: string };
  updateFaculty: (faculty: Faculty) => { success: boolean; message: string };
  addSubject: (subject: Omit<Subject, 'id'>) => { success: boolean; message: string };
  updateSubject: (subject: Subject) => { success: boolean; message: string };
  updateConfig: (newConfig: Partial<AttendanceConfig>) => void;

  // Storage utilities
  resetToDemoData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'smartattend_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_depts`);
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_courses`);
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sections`);
    return saved ? JSON.parse(saved) : initialSections;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_faculty`);
    return saved ? JSON.parse(saved) : initialFaculty;
  });

  const [studentsList, setStudentsList] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_corrections`);
    return saved ? JSON.parse(saved) : initialCorrectionRequests;
  });

  const [config, setConfig] = useState<AttendanceConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Current active user (defaults to Admin or student/faculty as needed)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    return saved || 'admin-1';
  });

  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');

  const [backgroundTheme, setBackgroundTheme] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bg_theme`);
    return saved || 'theme-indigo-mesh';
  });

  // Synchronize to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_bg_theme`, backgroundTheme);
    } catch (e) {}
  }, [backgroundTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_depts`, JSON.stringify(departments));
      localStorage.setItem(`${STORAGE_KEY}_courses`, JSON.stringify(courses));
      localStorage.setItem(`${STORAGE_KEY}_sections`, JSON.stringify(sections));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_faculty`, JSON.stringify(facultyList));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(studentsList));
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY}_corrections`, JSON.stringify(correctionRequests));
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, currentUserId);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [
    departments,
    courses,
    sections,
    subjects,
    facultyList,
    studentsList,
    sessions,
    correctionRequests,
    config,
    auditLogs,
    currentUserId,
  ]);

  const allUsers: User[] = [initialAdmin, ...facultyList, ...studentsList];
  const currentUser: User =
    allUsers.find((u) => u.id === currentUserId) || initialAdmin;

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target = allUsers.find((u) => u.id === userId);
    // If student, switch to student portal or dashboard
    if (target?.role === 'STUDENT') {
      setActiveNavTab('student-portal');
    } else {
      setActiveNavTab('dashboard');
    }
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      userId: currentUser.id,
      userName: currentUser.fullName,
      role: currentUser.role,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createAttendanceSession = (
    data: Omit<AttendanceSession, 'id' | 'createdAt'>
  ): { success: boolean; message: string; session?: AttendanceSession } => {
    // Check for duplicate session for same subject, section, and date
    const duplicate = sessions.find(
      (s) =>
        s.subjectId === data.subjectId &&
        s.sectionId === data.sectionId &&
        s.date === data.date &&
        s.sessionType === data.sessionType
    );

    if (duplicate) {
      return {
        success: false,
        message: `A ${data.sessionType} session for this subject and section already exists on ${data.date}. Duplicate sessions are prohibited.`,
      };
    }

    const newSessionId = `sess-${Date.now()}`;
    const newSession: AttendanceSession = {
      ...data,
      id: newSessionId,
      createdAt: new Date().toISOString(),
      records: data.records.map((r, idx) => ({
        ...r,
        id: `rec-${newSessionId}-${idx}`,
        sessionId: newSessionId,
        recordedAt: new Date().toISOString(),
      })),
    };

    setSessions((prev) => [newSession, ...prev]);
    const subject = subjects.find((s) => s.id === data.subjectId);
    addAuditLog(
      'SESSION_CREATED',
      `Created ${data.sessionType} attendance session for ${subject?.code || data.subjectId} on ${data.date} with ${data.records.length} records.`
    );

    return {
      success: true,
      message: `Attendance session successfully submitted and recorded.`,
      session: newSession,
    };
  };

  const updateAttendanceRecord = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const updatedRecords = s.records.map((r) => {
          if (r.studentId !== studentId) return r;
          return {
            ...r,
            status,
            remarks: remarks !== undefined ? remarks : r.remarks,
          };
        });
        return { ...s, records: updatedRecords };
      })
    );

    const student = studentsList.find((st) => st.id === studentId);
    addAuditLog(
      'RECORD_MANUALLY_EDITED',
      `Manual update: Student ${student?.fullName || studentId} marked ${status} in session ${sessionId}.`
    );
  };

  const submitCorrectionRequest = (
    data: Omit<CorrectionRequest, 'id' | 'createdAt' | 'status'>
  ): { success: boolean; message: string } => {
    // Prevent duplicate pending requests for same session and student
    const existing = correctionRequests.find(
      (r) =>
        r.studentId === data.studentId &&
        r.sessionId === data.sessionId &&
        r.status === 'PENDING'
    );

    if (existing) {
      return {
        success: false,
        message: 'A pending correction request already exists for this attendance session.',
      };
    }

    const newRequest: CorrectionRequest = {
      ...data,
      id: `cr-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setCorrectionRequests((prev) => [newRequest, ...prev]);
    addAuditLog(
      'CORRECTION_SUBMITTED',
      `Correction request submitted by ${data.studentName} (${data.rollNumber}) for session ${data.sessionDate}.`
    );

    return {
      success: true,
      message: 'Correction request submitted successfully for faculty review.',
    };
  };

  const reviewCorrectionRequest = (
    requestId: string,
    approved: boolean,
    remarks: string
  ): { success: boolean; message: string } => {
    const target = correctionRequests.find((r) => r.id === requestId);
    if (!target) {
      return { success: false, message: 'Request not found.' };
    }

    if (target.status !== 'PENDING') {
      return { success: false, message: 'This request has already been reviewed.' };
    }

    const status: 'APPROVED' | 'REJECTED' = approved ? 'APPROVED' : 'REJECTED';
    const now = new Date().toISOString();

    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewerId: currentUser.id,
              reviewerName: currentUser.fullName,
              reviewedAt: now,
              reviewRemarks: remarks,
            }
          : r
      )
    );

    // If approved, update the actual session record!
    if (approved) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== target.sessionId) return s;
          const updatedRecords = s.records.map((rec) => {
            if (rec.studentId !== target.studentId) return rec;
            return {
              ...rec,
              status: target.requestedStatus,
              remarks: `Corrected via request #${target.id}: ${remarks}`,
            };
          });
          return { ...s, records: updatedRecords };
        })
      );
    }

    addAuditLog(
      approved ? 'CORRECTION_APPROVED' : 'CORRECTION_REJECTED',
      `${approved ? 'Approved' : 'Rejected'} request #${requestId} for ${target.studentName}: ${remarks}`
    );

    return {
      success: true,
      message: `Request has been marked as ${status}.`,
    };
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'role' | 'isActive'>) => {
    const duplicateRoll = studentsList.find(
      (s) => s.rollNumber.toLowerCase() === studentData.rollNumber.toLowerCase()
    );
    if (duplicateRoll) {
      return { success: false, message: `Roll Number '${studentData.rollNumber}' is already registered.` };
    }

    const duplicateEmail = studentsList.find(
      (s) => s.email.toLowerCase() === studentData.email.toLowerCase()
    );
    if (duplicateEmail) {
      return { success: false, message: `Email '${studentData.email}' is already in use.` };
    }

    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      role: 'STUDENT',
      isActive: true,
    };

    setStudentsList((prev) => [...prev, newStudent]);
    addAuditLog('STUDENT_ADDED', `Enrolled new student: ${newStudent.fullName} (${newStudent.rollNumber}).`);
    return { success: true, message: 'Student successfully enrolled.' };
  };

  const updateStudent = (student: Student) => {
    setStudentsList((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    addAuditLog('STUDENT_UPDATED', `Updated record for student: ${student.fullName} (${student.rollNumber}).`);
    return { success: true, message: 'Student details updated.' };
  };

  const toggleStudentStatus = (studentId: string) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newStatus = !s.isActive;
        addAuditLog(
          'STUDENT_STATUS_TOGGLED',
          `${newStatus ? 'Activated' : 'Deactivated'} student: ${s.fullName} (${s.rollNumber}).`
        );
        return { ...s, isActive: newStatus };
      })
    );
  };

  // Faculty CRUD
  const addFaculty = (facultyData: Omit<Faculty, 'id' | 'role' | 'isActive'>) => {
    const duplicateCode = facultyList.find(
      (f) => f.employeeCode.toLowerCase() === facultyData.employeeCode.toLowerCase()
    );
    if (duplicateCode) {
      return { success: false, message: `Employee Code '${facultyData.employeeCode}' already exists.` };
    }

    const newFac: Faculty = {
      ...facultyData,
      id: `fac-${Date.now()}`,
      role: 'FACULTY',
      isActive: true,
    };

    setFacultyList((prev) => [...prev, newFac]);
    addAuditLog('FACULTY_ADDED', `Added faculty member: ${newFac.fullName} (${newFac.employeeCode}).`);
    return { success: true, message: 'Faculty member successfully created.' };
  };

  const updateFaculty = (faculty: Faculty) => {
    setFacultyList((prev) => prev.map((f) => (f.id === faculty.id ? faculty : f)));
    addAuditLog('FACULTY_UPDATED', `Updated faculty member: ${faculty.fullName}.`);
    return { success: true, message: 'Faculty details updated.' };
  };

  // Subject CRUD
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const duplicateCode = subjects.find(
      (s) => s.code.toLowerCase() === subjectData.code.toLowerCase()
    );
    if (duplicateCode) {
      return { success: false, message: `Subject code '${subjectData.code}' is already registered.` };
    }

    const newSubj: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
    };

    setSubjects((prev) => [...prev, newSubj]);
    addAuditLog('SUBJECT_CREATED', `Created new subject: ${newSubj.code} - ${newSubj.name}.`);
    return { success: true, message: 'Subject created successfully.' };
  };

  const updateSubject = (subject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? subject : s)));
    addAuditLog('SUBJECT_UPDATED', `Updated subject: ${subject.code} - ${subject.name}.`);
    return { success: true, message: 'Subject updated successfully.' };
  };

  const updateConfig = (newConfig: Partial<AttendanceConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      addAuditLog(
        'CONFIG_UPDATED',
        `Attendance policy updated: Threshold = ${merged.thresholdPercentage}%, Exclude Leave = ${merged.excludeApprovedLeaveFromEligible}.`
      );
      return merged;
    });
  };

  const resetToDemoData = () => {
    setDepartments(initialDepartments);
    setCourses(initialCourses);
    setSections(initialSections);
    setSubjects(initialSubjects);
    setFacultyList(initialFaculty);
    setStudentsList(initialStudents);
    setSessions(initialSessions);
    setCorrectionRequests(initialCorrectionRequests);
    setConfig(initialConfig);
    setAuditLogs(initialAuditLogs);
    setCurrentUserId('admin-1');
    setActiveNavTab('dashboard');
    localStorage.clear();
  };

  const exportDatabaseJson = (): string => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      departments,
      courses,
      sections,
      subjects,
      facultyList,
      studentsList,
      sessions,
      correctionRequests,
      config,
      auditLogs,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importDatabaseJson = (json: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(json);
      if (!data.studentsList || !data.sessions) {
        return { success: false, message: 'Invalid backup file format: missing essential collections.' };
      }
      if (data.departments) setDepartments(data.departments);
      if (data.courses) setCourses(data.courses);
      if (data.sections) setSections(data.sections);
      if (data.subjects) setSubjects(data.subjects);
      if (data.facultyList) setFacultyList(data.facultyList);
      if (data.studentsList) setStudentsList(data.studentsList);
      if (data.sessions) setSessions(data.sessions);
      if (data.correctionRequests) setCorrectionRequests(data.correctionRequests);
      if (data.config) setConfig(data.config);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      return { success: true, message: 'Data backup successfully restored.' };
    } catch (err: unknown) {
      return { success: false, message: `Failed to parse backup JSON: ${err instanceof Error ? err.message : String(err)}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        allUsers,
        departments,
        courses,
        sections,
        subjects,
        facultyList,
        studentsList,
        sessions,
        correctionRequests,
        config,
        auditLogs,
        activeNavTab,
        setActiveNavTab,
        backgroundTheme,
        setBackgroundTheme,
        createAttendanceSession,
        updateAttendanceRecord,
        submitCorrectionRequest,
        reviewCorrectionRequest,
        addStudent,
        updateStudent,
        toggleStudentStatus,
        addFaculty,
        updateFaculty,
        addSubject,
        updateSubject,
        updateConfig,
        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
