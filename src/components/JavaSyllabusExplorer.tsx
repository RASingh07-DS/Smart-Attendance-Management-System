import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Download,
} from 'lucide-react';

interface JavaSyllabusExplorerProps {
  onOpenUmlModal: () => void;
  onOpenJavaModal: () => void;
}

export const JavaSyllabusExplorer: React.FC<JavaSyllabusExplorerProps> = ({
  onOpenUmlModal,
  onOpenJavaModal,
}) => {
  const [activeUnit, setActiveUnit] = useState<number>(1);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const syllabusUnits = [
    {
      unit: 1,
      title: 'Unit 1: OOP Foundations, Modeling & JVM Architecture',
      topics: [
        'Four OOP Pillars: Encapsulation, Abstraction, Inheritance, Polymorphism',
        'JVM Internal Architecture: Class Loader, Heap, Stack, Execution Engine (JIT), GC',
        'Object Relationships: Association, Aggregation, Composition, Realization',
        'Deprecated finalize() vs modern try-with-resources and AutoCloseable',
      ],
      codeSample: `// smartattend/model/AttendanceSession.java
package smartattend.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Demonstrates COMPOSITION: The AttendanceSession strictly owns its
 * AttendanceRecord lifecycle. Records cannot exist independently.
 */
public class AttendanceSession implements Serializable {
    private static final long serialVersionUID = 1001L;

    private final String sessionId;
    private final String subjectId;
    private final String sectionId;
    private final LocalDate sessionDate;
    private final String topic;
    
    // COMPOSITION: The session owns its internal list of records
    private final List<AttendanceRecord> records;

    public AttendanceSession(String sessionId, String subjectId, String sectionId, 
                             LocalDate sessionDate, String topic) {
        this.sessionId = sessionId;
        this.subjectId = subjectId;
        this.sectionId = sectionId;
        this.sessionDate = sessionDate;
        this.topic = topic;
        this.records = new ArrayList<>();
    }

    public void addRecord(String studentId, AttendanceStatus status, String remarks) {
        // Enforces composition: records are created and encapsulated within this session
        AttendanceRecord record = new AttendanceRecord(
            this.sessionId + "_" + studentId,
            this.sessionId,
            studentId,
            status,
            remarks
        );
        this.records.add(record);
    }

    public List<AttendanceRecord> getRecords() {
        // Encapsulation: Return unmodifiable view to prevent external mutation
        return Collections.unmodifiableList(records);
    }
}`,
    },
    {
      unit: 2,
      title: 'Unit 2: Inheritance, Polymorphism, Lambdas & Arrays',
      topics: [
        'Inheritance: User base class -> Admin, Faculty, Student subclasses',
        'Method Overloading vs Dynamic Method Overriding (runtime polymorphism)',
        'Lambda Expressions & Functional Interfaces (Predicate, Comparator)',
        '2D and Jagged Arrays for student timetable matrix',
      ],
      codeSample: `// smartattend/model/Student.java
package smartattend.model;

public class Student extends User implements Comparable<Student> {
    private static final long serialVersionUID = 2001L;

    private final String rollNumber;
    private final int semester;
    private final String sectionId;

    public Student(String id, String username, String fullName, String email, 
                   String departmentId, String rollNumber, int semester, String sectionId) {
        super(id, username, fullName, email, UserRole.STUDENT, departmentId);
        this.rollNumber = rollNumber;
        this.semester = semester;
        this.sectionId = sectionId;
    }

    // Method Overriding: Polymorphic behavior
    @Override
    public String getRoleDescription() {
        return "Enrolled Student [Roll: " + this.rollNumber + ", Sem: " + this.semester + "]";
    }

    // Comparable implementation using lambda/method reference equivalent
    @Override
    public int compareTo(Student other) {
        return this.rollNumber.compareTo(other.rollNumber);
    }

    public String getRollNumber() { return rollNumber; }
}

// Lambda usage in AttendanceService:
// List<Student> atRisk = students.stream()
//     .filter(s -> calculator.calculate(s.getId()).getRiskLevel() == RiskLevel.CRITICAL)
//     .sorted(Comparator.comparing(Student::getRollNumber))
//     .toList();`,
    },
    {
      unit: 3,
      title: 'Unit 3: Packages, Custom Exceptions, Assertions & Strings',
      topics: [
        'Clean package hierarchy: model, service, repository, exception, ui',
        'Custom Checked & Unchecked Exceptions: DuplicateAttendanceException',
        'Resource Bundles & Localization support',
        'String immutability vs StringBuilder vs legacy StringTokenizer',
      ],
      codeSample: `// smartattend/exception/DuplicateAttendanceException.java
package smartattend.exception;

/**
 * Custom checked exception thrown when an attendance record or session
 * is submitted twice for the exact same class parameters.
 */
public class DuplicateAttendanceException extends Exception {
    private final String sessionId;
    private final String studentId;

    public DuplicateAttendanceException(String message, String sessionId, String studentId) {
        super(message);
        this.sessionId = sessionId;
        this.studentId = studentId;
    }

    public String getSessionId() { return sessionId; }
    public String getStudentId() { return studentId; }
}

// In AttendanceService.java:
// public void validateSession(String subjectId, String sectionId, LocalDate date) 
//         throws DuplicateAttendanceException {
//     assert subjectId != null : "Subject ID invariant failed!";
//     if (repository.existsByDateAndSubject(date, subjectId, sectionId)) {
//         throw new DuplicateAttendanceException("Session duplicate detected", subjectId, date.toString());
//     }
// }`,
    },
    {
      unit: 4,
      title: 'Unit 4: Concurrency, Safe I/O Streams & TCP Networking',
      topics: [
        'Thread safety with ReentrantReadWriteLock and synchronized state',
        'Swing Event Dispatch Thread safety: SwingUtilities.invokeLater()',
        'Object serialization with serialVersionUID and robust recovery',
        'TCP ServerSocket & Socket for real-time remote attendance broadcast',
      ],
      codeSample: `// smartattend/service/AttendanceService.java
package smartattend.service;

import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.io.*;

public class AttendanceService {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    public void recordSessionSafely(AttendanceSession session) throws IOException {
        // Concurrency safeguard: acquire write lock
        rwLock.writeLock().lock();
        try {
            // Write to disk using buffered object stream
            File file = new File("data/sessions.ser");
            try (ObjectOutputStream oos = new ObjectOutputStream(
                    new BufferedOutputStream(new FileOutputStream(file)))) {
                oos.writeObject(session);
                oos.flush();
            }
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}

// Optional TCP Broadcast Server:
// ServerSocket serverSocket = new ServerSocket(8080);
// Socket clientSocket = serverSocket.accept();
// PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
// out.println("ATTENDANCE_EVENT: SESSION_RECORDED: " + session.getId());`,
    },
    {
      unit: 5,
      title: 'Unit 5: Swing GUI, Generics & Collections Framework',
      topics: [
        'Swing UI: JFrame, JPanel, JTable, CardLayout, FlowLayout, BoxLayout',
        'Generic Repository pattern: CrudRepository<T extends Identifiable, ID>',
        'Collections: ArrayList, HashMap, HashSet, TreeSet, LinkedList, Queue',
        'Upper-bounded & Lower-bounded Wildcards: <? extends User>, <? super Student>',
      ],
      codeSample: `// smartattend/repository/CrudRepository.java
package smartattend.repository;

import java.util.List;
import java.util.Optional;

/**
 * Generic repository demonstrating bounded type parameters.
 */
public interface CrudRepository<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
    
    // Wildcard demonstration: accepts any collection of subtypes
    void saveAll(List<? extends T> entities);
}

// Collections in Action:
// 1. HashMap<String, Student> -> O(1) lookup by roll number
// 2. TreeSet<Student> -> Naturally ordered students by roll number
// 3. Queue<CorrectionRequest> -> FIFO pending review queue
// 4. HashSet<LocalDate> -> Unique session dates`,
    },
  ];

  const currentUnitData = syllabusUnits.find((u) => u.unit === activeUnit)!;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Java OOP Syllabus Architecture & Code Hub
            </h1>
            <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
              Java 17+ · Swing · Clean Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore how each unit of your college Java syllabus is realized in clean, runnable object-oriented code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUmlModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>View UML Diagrams</span>
          </button>
          <button
            onClick={onOpenJavaModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Java Source Files</span>
          </button>
        </div>
      </div>

      {/* Unit Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {syllabusUnits.map((u) => (
          <button
            key={u.unit}
            onClick={() => setActiveUnit(u.unit)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeUnit === u.unit
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`text-[11px] font-mono font-semibold ${activeUnit === u.unit ? 'text-slate-300' : 'text-slate-400'}`}>
              UNIT {u.unit}
            </div>
            <div className="text-xs font-semibold truncate mt-0.5">
              {u.unit === 1 ? 'Foundations & JVM' : u.unit === 2 ? 'Inheritance & Lambdas' : u.unit === 3 ? 'Packages & Exceptions' : u.unit === 4 ? 'Concurrency & I/O' : 'Swing & Generics'}
            </div>
          </button>
        ))}
      </div>

      {/* Active Unit Deep Dive */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{currentUnitData.title}</h2>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {currentUnitData.topics.map((t, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Sample Box */}
        <div className="relative pt-2">
          <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
            <span>Production Java 17 Source Implementation</span>
            <button
              onClick={() => copyToClipboard(currentUnitData.codeSample, currentUnitData.unit)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedCodeIndex === currentUnitData.unit ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy Java Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-100 rounded-b-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
            <code>{currentUnitData.codeSample}</code>
          </pre>
        </div>
      </div>

      {/* Syllabus Mapping Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Syllabus Topic to Class & Method Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exact architectural mapping showing where every syllabus concept lives in the Java codebase
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">OOP Syllabus Topic</th>
                <th className="py-2.5 px-4">Java Class Name</th>
                <th className="py-2.5 px-4">Method / Signature</th>
                <th className="py-2.5 px-4">Realized Design Principle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Inheritance & Generalization
                </td>
                <td className="py-2.5 px-4 text-indigo-700">User &rarr; Student, Faculty, Admin</td>
                <td className="py-2.5 px-4 text-slate-600">super(id, username, email...)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Subclass reuse with role-specific specialization
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Composition & Lifecycle
                </td>
                <td className="py-2.5 px-4 text-indigo-700">AttendanceSession</td>
                <td className="py-2.5 px-4 text-slate-600">addRecord(studentId, status)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Session strictly owns AttendanceRecord instances
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Aggregation
                </td>
                <td className="py-2.5 px-4 text-indigo-700">Department</td>
                <td className="py-2.5 px-4 text-slate-600">assignFaculty(facultyId)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Department groups independently existing faculty
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Custom Checked Exceptions
                </td>
                <td className="py-2.5 px-4 text-indigo-700">DuplicateAttendanceException</td>
                <td className="py-2.5 px-4 text-slate-600">throw new DuplicateAttendanceException(...)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Prevents duplicate session submissions safely
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Lambdas & Streams
                </td>
                <td className="py-2.5 px-4 text-indigo-700">AttendanceCalculator</td>
                <td className="py-2.5 px-4 text-slate-600">sessions.stream().filter(...).map(...)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Functional calculation of percentages & risk levels
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Generics & Wildcards
                </td>
                <td className="py-2.5 px-4 text-indigo-700">CrudRepository&lt;T, ID&gt;</td>
                <td className="py-2.5 px-4 text-slate-600">saveAll(List&lt;? extends T&gt; entities)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Upper-bounded wildcard for type-safe batch storage
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  Concurrency & Thread Safety
                </td>
                <td className="py-2.5 px-4 text-indigo-700">FileAttendanceRepository</td>
                <td className="py-2.5 px-4 text-slate-600">rwLock.writeLock().lock() / unlock()</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  Prevents race conditions during simultaneous disk I/O
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                  TCP Sockets
                </td>
                <td className="py-2.5 px-4 text-indigo-700">AttendanceBroadcastServer</td>
                <td className="py-2.5 px-4 text-slate-600">new ServerSocket(8080).accept()</td>
                <td className="py-2.5 px-4 font-sans text-slate-600">
                  TCP client-server attendance event broadcasting
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
