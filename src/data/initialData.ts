import {
  Admin,
  AttendanceConfig,
  AttendanceSession,
  AuditLogEntry,
  CorrectionRequest,
  Course,
  Department,
  Faculty,
  Section,
  Student,
  Subject,
} from '../types';

export const initialDepartments: Department[] = [
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication Engineering' },
];

export const initialCourses: Course[] = [
  { id: 'course-btech-cse', code: 'BT-CSE', name: 'B.Tech in Computer Science & Engineering', departmentId: 'dept-cse' },
  { id: 'course-btech-ece', code: 'BT-ECE', name: 'B.Tech in Electronics & Communication', departmentId: 'dept-ece' },
];

export const initialSections: Section[] = [
  { id: 'sec-cse-3a', name: 'CSE-3A', semester: 3, courseId: 'course-btech-cse' },
  { id: 'sec-cse-3b', name: 'CSE-3B', semester: 3, courseId: 'course-btech-cse' },
  { id: 'sec-ece-3a', name: 'ECE-3A', semester: 3, courseId: 'course-btech-ece' },
];

export const initialAdmin: Admin = {
  id: 'admin-1',
  username: 'admin',
  fullName: 'Dr. Alistair Vance',
  email: 'a.vance@smartattend.edu',
  role: 'ADMIN',
  designation: 'Dean of Academic Affairs & Chief Administrator',
  departmentId: 'dept-cse',
  isActive: true,
};

export const initialFaculty: Faculty[] = [
  {
    id: 'fac-1',
    username: 'prof_elena',
    fullName: 'Prof. Elena Rostova',
    email: 'e.rostova@smartattend.edu',
    role: 'FACULTY',
    employeeCode: 'FAC-2019-041',
    designation: 'Associate Professor & Lead Java Architect',
    departmentId: 'dept-cse',
    assignedSubjectIds: ['subj-cs301'],
    isActive: true,
  },
  {
    id: 'fac-2',
    username: 'prof_chen',
    fullName: 'Prof. Marcus Chen',
    email: 'm.chen@smartattend.edu',
    role: 'FACULTY',
    employeeCode: 'FAC-2021-089',
    designation: 'Assistant Professor, Database Systems',
    departmentId: 'dept-cse',
    assignedSubjectIds: ['subj-cs302'],
    isActive: true,
  },
  {
    id: 'fac-3',
    username: 'prof_priya',
    fullName: 'Prof. Priya Sharma',
    email: 'p.sharma@smartattend.edu',
    role: 'FACULTY',
    employeeCode: 'FAC-2020-015',
    designation: 'Assistant Professor, Algorithms & Data Structures',
    departmentId: 'dept-cse',
    assignedSubjectIds: ['subj-cs303'],
    isActive: true,
  },
];

export const initialSubjects: Subject[] = [
  {
    id: 'subj-cs301',
    code: 'CS301',
    name: 'Object-Oriented Programming (Java)',
    credits: 4,
    courseId: 'course-btech-cse',
    semester: 3,
    facultyId: 'fac-1',
  },
  {
    id: 'subj-cs302',
    code: 'CS302',
    name: 'Database Management Systems',
    credits: 4,
    courseId: 'course-btech-cse',
    semester: 3,
    facultyId: 'fac-2',
  },
  {
    id: 'subj-cs303',
    code: 'CS303',
    name: 'Data Structures & Algorithms',
    credits: 4,
    courseId: 'course-btech-cse',
    semester: 3,
    facultyId: 'fac-3',
  },
];

// 24 Fictional Students in Semester 3
export const initialStudents: Student[] = [
  { id: 'stu-1', username: 'aarav_patel', fullName: 'Aarav Patel', email: 'aarav.patel@student.edu', role: 'STUDENT', rollNumber: '2024CSE001', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-2', username: 'ananya_iyer', fullName: 'Ananya Iyer', email: 'ananya.iyer@student.edu', role: 'STUDENT', rollNumber: '2024CSE002', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-3', username: 'rohan_gupta', fullName: 'Rohan Gupta', email: 'rohan.gupta@student.edu', role: 'STUDENT', rollNumber: '2024CSE003', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-4', username: 'maya_lin', fullName: 'Maya Lin', email: 'maya.lin@student.edu', role: 'STUDENT', rollNumber: '2024CSE004', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-5', username: 'vikram_malhotra', fullName: 'Vikram Malhotra', email: 'vikram.m@student.edu', role: 'STUDENT', rollNumber: '2024CSE005', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-6', username: 'sara_khan', fullName: 'Sara Khan', email: 'sara.khan@student.edu', role: 'STUDENT', rollNumber: '2024CSE006', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-7', username: 'dev_varma', fullName: 'Dev Varma', email: 'dev.varma@student.edu', role: 'STUDENT', rollNumber: '2024CSE007', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-8', username: 'kavita_nair', fullName: 'Kavita Nair', email: 'kavita.nair@student.edu', role: 'STUDENT', rollNumber: '2024CSE008', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-9', username: 'arjun_reddy', fullName: 'Arjun Reddy', email: 'arjun.reddy@student.edu', role: 'STUDENT', rollNumber: '2024CSE009', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-10', username: 'tanya_sen', fullName: 'Tanya Sen', email: 'tanya.sen@student.edu', role: 'STUDENT', rollNumber: '2024CSE010', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-11', username: 'neil_deshmukh', fullName: 'Neil Deshmukh', email: 'neil.d@student.edu', role: 'STUDENT', rollNumber: '2024CSE011', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-12', username: 'simran_kaur', fullName: 'Simran Kaur', email: 'simran.k@student.edu', role: 'STUDENT', rollNumber: '2024CSE012', semester: 3, sectionId: 'sec-cse-3a', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-13', username: 'aditya_joshi', fullName: 'Aditya Joshi', email: 'aditya.j@student.edu', role: 'STUDENT', rollNumber: '2024CSE013', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-14', username: 'zoya_akhtar', fullName: 'Zoya Akhtar', email: 'zoya.a@student.edu', role: 'STUDENT', rollNumber: '2024CSE014', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-15', username: 'rahul_mehta', fullName: 'Rahul Mehta', email: 'rahul.m@student.edu', role: 'STUDENT', rollNumber: '2024CSE015', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-16', username: 'ishaan_bose', fullName: 'Ishaan Bose', email: 'ishaan.b@student.edu', role: 'STUDENT', rollNumber: '2024CSE016', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-17', username: 'pooja_chawla', fullName: 'Pooja Chawla', email: 'pooja.c@student.edu', role: 'STUDENT', rollNumber: '2024CSE017', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-18', username: 'sameer_sheikh', fullName: 'Sameer Sheikh', email: 'sameer.s@student.edu', role: 'STUDENT', rollNumber: '2024CSE018', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-19', username: 'tanvi_kulkarni', fullName: 'Tanvi Kulkarni', email: 'tanvi.k@student.edu', role: 'STUDENT', rollNumber: '2024CSE019', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-20', username: 'yash_singh', fullName: 'Yash Singh', email: 'yash.s@student.edu', role: 'STUDENT', rollNumber: '2024CSE020', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-21', username: 'kriti_shukla', fullName: 'Kriti Shukla', email: 'kriti.s@student.edu', role: 'STUDENT', rollNumber: '2024CSE021', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-22', username: 'kabir_das', fullName: 'Kabir Das', email: 'kabir.d@student.edu', role: 'STUDENT', rollNumber: '2024CSE022', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-23', username: 'diya_menon', fullName: 'Diya Menon', email: 'diya.m@student.edu', role: 'STUDENT', rollNumber: '2024CSE023', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
  { id: 'stu-24', username: 'manish_tiwari', fullName: 'Manish Tiwari', email: 'manish.t@student.edu', role: 'STUDENT', rollNumber: '2024CSE024', semester: 3, sectionId: 'sec-cse-3b', courseId: 'course-btech-cse', departmentId: 'dept-cse', isActive: true },
];

export const initialConfig: AttendanceConfig = {
  thresholdPercentage: 75,
  warningMargin: 5,
  excludeApprovedLeaveFromEligible: true,
  lateCountsAsPresent: true,
};

// Helper to seed sessions
function buildSampleSessions(): AttendanceSession[] {
  const dates = [
    '2026-10-05',
    '2026-10-07',
    '2026-10-09',
    '2026-10-12',
    '2026-10-14',
    '2026-10-16',
    '2026-10-19',
    '2026-10-21',
  ];

  const topicsCS301 = [
    'Introduction to Java OOP & JVM Architecture',
    'Classes, Objects, Constructors & this Keyword',
    'Inheritance Hierarchy & super Invocations',
    'Polymorphism, Overloading & Dynamic Method Dispatch',
    'Abstract Classes & Interface Realization',
    'Java Collections Framework: ArrayList & HashMap',
    'Exception Handling, try-with-resources & Custom Exceptions',
    'Multithreading, Runnable & Synchronization',
  ];

  const topicsCS302 = [
    'Relational Model Concepts & ER Modeling',
    'Relational Algebra & Tuple Calculus',
    'SQL DDL & Integrity Constraints',
    'Complex SQL Queries, Joins & Subqueries',
    'Database Normalization: 1NF to BCNF',
    'Transaction Management & ACID Properties',
    'Concurrency Control & Locking Protocols',
    'Indexing Strategies: B-Trees & Hash Indexes',
  ];

  const topicsCS303 = [
    'Asymptotic Analysis & Big-O Notation',
    'Linked Lists: Singly, Doubly & Circular',
    'Stack Applications & Queue Implementations',
    'Binary Search Trees & Tree Traversals',
    'AVL Trees & Self-Balancing Operations',
    'Graph Representations, BFS & DFS',
    'Dijkstra Shortest Path & Prim MST',
    'Dynamic Programming & Greedy Paradigms',
  ];

  const sessions: AttendanceSession[] = [];
  const sectionAStudents = initialStudents.filter((s) => s.sectionId === 'sec-cse-3a');

  // Let's create reproducible attendance patterns:
  // stu-1 (Aarav): High (Present mostly) -> ~92%
  // stu-2 (Ananya): Excellent (Present all) -> 100%
  // stu-3 (Rohan): Warning range (~75-78%)
  // stu-4 (Maya): Safe (~88%)
  // stu-5 (Vikram): Critical Low (~55-60%) -> Needs 3-4 consecutive classes
  // stu-6 (Sara): Borderline (~74%) -> Needs 1 class
  // stu-7 to 12: Mix of Safe and Warning

  const studentStatusMatrix: Record<string, ('PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE')[]> = {
    'stu-1': ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE'],
    'stu-2': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'],
    'stu-3': ['PRESENT', 'ABSENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT'],
    'stu-4': ['PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'LEAVE', 'PRESENT', 'PRESENT', 'PRESENT'],
    'stu-5': ['ABSENT', 'PRESENT', 'ABSENT', 'ABSENT', 'PRESENT', 'ABSENT', 'PRESENT', 'ABSENT'], // 3/8 = 37.5% Critical
    'stu-6': ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'ABSENT'], // 5/8 = 62.5% Critical
    'stu-7': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'PRESENT'],
    'stu-8': ['PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'LEAVE', 'PRESENT', 'PRESENT', 'PRESENT'],
    'stu-9': ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT'],
    'stu-10': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'],
    'stu-11': ['ABSENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT'],
    'stu-12': ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'],
  };

  // Build CS301 Sessions (Prof. Elena)
  dates.forEach((date, index) => {
    const sessionId = `sess-cs301-${index + 1}`;
    const records = sectionAStudents.map((st) => {
      const pattern = studentStatusMatrix[st.id] || [
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
      ];
      const status = pattern[index % pattern.length];
      return {
        id: `rec-${sessionId}-${st.id}`,
        sessionId,
        studentId: st.id,
        status,
        recordedAt: `${date}T10:00:00Z`,
        remarks: status === 'LEAVE' ? 'Medical leave slip verified' : status === 'LATE' ? 'Admitted 10m late' : undefined,
      };
    });

    sessions.push({
      id: sessionId,
      subjectId: 'subj-cs301',
      sectionId: 'sec-cse-3a',
      facultyId: 'fac-1',
      date,
      sessionType: index % 4 === 1 ? 'LAB' : 'LECTURE',
      topic: topicsCS301[index],
      createdAt: `${date}T09:30:00Z`,
      records,
    });
  });

  // Build CS302 Sessions (Prof. Marcus Chen)
  dates.slice(0, 6).forEach((date, index) => {
    const sessionId = `sess-cs302-${index + 1}`;
    const records = sectionAStudents.map((st) => {
      const pattern = studentStatusMatrix[st.id] || ['PRESENT'];
      // slight variation
      const rawStatus = pattern[(index + 2) % pattern.length];
      return {
        id: `rec-${sessionId}-${st.id}`,
        sessionId,
        studentId: st.id,
        status: rawStatus,
        recordedAt: `${date}T11:30:00Z`,
      };
    });

    sessions.push({
      id: sessionId,
      subjectId: 'subj-cs302',
      sectionId: 'sec-cse-3a',
      facultyId: 'fac-2',
      date,
      sessionType: 'LECTURE',
      topic: topicsCS302[index],
      createdAt: `${date}T11:00:00Z`,
      records,
    });
  });

  // Build CS303 Sessions (Prof. Priya Sharma)
  dates.slice(0, 6).forEach((date, index) => {
    const sessionId = `sess-cs303-${index + 1}`;
    const records = sectionAStudents.map((st) => {
      const pattern = studentStatusMatrix[st.id] || ['PRESENT'];
      const rawStatus = pattern[(index + 4) % pattern.length];
      return {
        id: `rec-${sessionId}-${st.id}`,
        sessionId,
        studentId: st.id,
        status: rawStatus,
        recordedAt: `${date}T14:00:00Z`,
      };
    });

    sessions.push({
      id: sessionId,
      subjectId: 'subj-cs303',
      sectionId: 'sec-cse-3a',
      facultyId: 'fac-3',
      date,
      sessionType: 'LECTURE',
      topic: topicsCS303[index],
      createdAt: `${date}T13:45:00Z`,
      records,
    });
  });

  return sessions;
}

export const initialSessions: AttendanceSession[] = buildSampleSessions();

export const initialCorrectionRequests: CorrectionRequest[] = [
  {
    id: 'cr-101',
    studentId: 'stu-1',
    studentName: 'Aarav Patel',
    rollNumber: '2024CSE001',
    sessionId: 'sess-cs301-4',
    subjectId: 'subj-cs301',
    subjectName: 'Object-Oriented Programming (Java)',
    sessionDate: '2026-10-12',
    originalStatus: 'ABSENT',
    requestedStatus: 'LEAVE',
    reason: 'I was representing our college in the Inter-University Hackathon with prior permission.',
    status: 'PENDING',
    createdAt: '2026-10-13T10:15:00Z',
  },
  {
    id: 'cr-102',
    studentId: 'stu-3',
    studentName: 'Rohan Gupta',
    rollNumber: '2024CSE003',
    sessionId: 'sess-cs301-2',
    subjectId: 'subj-cs301',
    subjectName: 'Object-Oriented Programming (Java)',
    sessionDate: '2026-10-07',
    originalStatus: 'ABSENT',
    requestedStatus: 'PRESENT',
    reason: 'I arrived 12 minutes late due to university transit delay and stayed for the entire rest of lecture.',
    status: 'PENDING',
    createdAt: '2026-10-08T14:30:00Z',
  },
  {
    id: 'cr-103',
    studentId: 'stu-4',
    studentName: 'Maya Lin',
    rollNumber: '2024CSE004',
    sessionId: 'sess-cs301-3',
    subjectId: 'subj-cs301',
    subjectName: 'Object-Oriented Programming (Java)',
    sessionDate: '2026-10-09',
    originalStatus: 'LATE',
    requestedStatus: 'PRESENT',
    reason: 'Biometric device delay at lab door; student was seated before lecture started.',
    status: 'APPROVED',
    createdAt: '2026-10-10T09:00:00Z',
    reviewerId: 'fac-1',
    reviewerName: 'Prof. Elena Rostova',
    reviewedAt: '2026-10-10T16:20:00Z',
    reviewRemarks: 'Verified with lab attendant records. Attendance updated.',
  },
  {
    id: 'cr-104',
    studentId: 'stu-5',
    studentName: 'Vikram Malhotra',
    rollNumber: '2024CSE005',
    sessionId: 'sess-cs301-1',
    subjectId: 'subj-cs301',
    subjectName: 'Object-Oriented Programming (Java)',
    sessionDate: '2026-10-05',
    originalStatus: 'ABSENT',
    requestedStatus: 'LEAVE',
    reason: 'Sick leave requested after 10 days.',
    status: 'REJECTED',
    createdAt: '2026-10-15T11:00:00Z',
    reviewerId: 'fac-1',
    reviewerName: 'Prof. Elena Rostova',
    reviewedAt: '2026-10-16T11:30:00Z',
    reviewRemarks: 'Rejected: Medical certificate not submitted within the 48-hour institutional deadline.',
  },
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-10T16:20:00Z',
    action: 'CORRECTION_APPROVED',
    userId: 'fac-1',
    userName: 'Prof. Elena Rostova',
    role: 'FACULTY',
    details: 'Approved correction request cr-103 for Maya Lin (2024CSE004). Status changed from LATE to PRESENT in session sess-cs301-3.',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-16T11:30:00Z',
    action: 'CORRECTION_REJECTED',
    userId: 'fac-1',
    userName: 'Prof. Elena Rostova',
    role: 'FACULTY',
    details: 'Rejected correction request cr-104 for Vikram Malhotra (2024CSE005): Outside 48-hour submission window.',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-21T10:45:00Z',
    action: 'SESSION_CREATED',
    userId: 'fac-1',
    userName: 'Prof. Elena Rostova',
    role: 'FACULTY',
    details: 'Created attendance session sess-cs301-8 for CS301 (Multithreading) with 12 student records.',
  },
];
