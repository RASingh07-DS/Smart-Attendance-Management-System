export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Student extends User {
  role: 'STUDENT';
  rollNumber: string;
  semester: number;
  sectionId: string;
  courseId: string;
}

export interface Faculty extends User {
  role: 'FACULTY';
  employeeCode: string;
  designation: string;
  assignedSubjectIds: string[];
}

export interface Admin extends User {
  role: 'ADMIN';
  designation: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
}

export interface Section {
  id: string;
  name: string;
  semester: number;
  courseId: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  courseId: string;
  semester: number;
  facultyId: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedAt: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  sectionId: string;
  facultyId: string;
  date: string; // YYYY-MM-DD
  sessionType: 'LECTURE' | 'LAB' | 'TUTORIAL';
  topic: string;
  createdAt: string;
  records: AttendanceRecord[];
}

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  sessionId: string;
  subjectId: string;
  subjectName: string;
  sessionDate: string;
  originalStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: CorrectionStatus;
  createdAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface AttendanceConfig {
  thresholdPercentage: number; // default 75
  warningMargin: number; // default 5 (i.e., 75-80 is Warning)
  excludeApprovedLeaveFromEligible: boolean; // default true
  lateCountsAsPresent: boolean; // default true (or 0.5)
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  role: UserRole;
  details: string;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalClassesHeld: number;
  approvedLeaves: number;
  eligibleClassesHeld: number;
  classesAttended: number;
  absences: number;
  percentage: number | null; // null if 0 eligible
  riskLevel: RiskLevel;
  classesNeededForThreshold: number; // n to reach 75%
  maxClassesCanMiss: number; // m while maintaining 75%
}
