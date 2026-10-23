# SmartAttend — Smart Attendance Management System
## Core Java OOP Syllabus Capstone & Modern Web Application

### Overview
SmartAttend is a complete, role-based Attendance Management System designed to address real-world collegiate attendance tracking while demonstrating every core concept of the Java Object-Oriented Programming (OOP) syllabus.

### Key Capabilities
- **Role-Based Access Control (RBAC)**: Dedicated interfaces and permissions for Administrator, Faculty, and Student.
- **Smart Attendance Calculation**:
  $$\text{Attendance \%} = \left(\frac{\text{Classes Attended}}{\text{Total Eligible Classes Held}}\right) \times 100$$
  - Configurable statutory threshold (default: 75.00%).
  - Configurable approved leave exclusion policy (leaves excluded from eligible denominator).
  - Risk categorizations: **Safe** ($\ge 80\%$), **Warning** ($75\% \le \text{pct} < 80\%$), and **Critical** ($< 75\%$).
- **Predictive Attendance Remediation Insights**:
  - Exact consecutive classes required to recover to 75%:
    $$n = \left\lceil \frac{p \cdot T - A}{1 - p} \right\rceil$$
  - Maximum upcoming classes a student can afford to miss:
    $$m = \left\lfloor \frac{A - p \cdot T}{p} \right\rfloor$$
- **Attendance Session Workflow**: Class, subject, date, and topic selection with roster marking, duplicate prevention, and batch operations ("Mark All Present").
- **Audited Correction Workflow**: Student dispute submission with reason, faculty/admin review, automated session update, and audit logging.
- **Reports & RFC 4180 CSV Export**: Student master sheet, below-threshold risk list, subject-wise aggregates, and date-wise logs.
- **Interactive Web Interface & Java Swing Desktop**: Accessible instantly via the browser dashboard, with complete downloadable Core Java Swing desktop source code and Maven project.

---

### Java OOP Syllabus Coverage Matrix

| Unit | Syllabus Concept | Realizing Java Class & Method | Design Rationale |
| :--- | :--- | :--- | :--- |
| **Unit 1** | Encapsulation & Abstraction | `smartattend.model.User`, `AttendanceRecord` | Private fields with public accessors; immutable IDs |
| **Unit 1** | Composition | `smartattend.model.AttendanceSession.addRecord()` | `AttendanceSession` strictly owns record lifecycles |
| **Unit 1** | Aggregation | `smartattend.model.Department.assignFaculty()` | Independent existence of `Faculty` and `Department` |
| **Unit 1** | JVM Architecture | Documented in `JVM_ARCHITECTURE.md` | Heap, Stack, Class Loader, Execution Engine (JIT), GC |
| **Unit 2** | Inheritance | `User` $\rightarrow$ `Student`, `Faculty`, `Admin` | `super()` constructor chaining and access modifiers |
| **Unit 2** | Method Overriding | `Student.getRoleDescription()` | Dynamic method dispatch and polymorphism |
| **Unit 2** | Method Overloading | `AttendanceService.markAttendance()` | Parameter variation for single and batch records |
| **Unit 2** | Lambdas & Streams | `AttendanceCalculator.calculateStudent()` | Stream filtering, predicates, and comparator sorting |
| **Unit 3** | Custom Checked Exceptions | `DuplicateAttendanceException` | Prevents duplicate sessions on the same date/topic |
| **Unit 3** | Package Structure | `smartattend.{model, service, repository, ui}` | Strict separation of concerns |
| **Unit 3** | Safe String Handling | `CsvExporter.java` | RFC 4180 quote escaping using `StringBuilder` |
| **Unit 4** | Thread Safety & Locking | `FileAttendanceRepository` | `ReentrantReadWriteLock` ensures thread-safe file I/O |
| **Unit 4** | Object Serialization | `AttendanceSession implements Serializable` | Long `serialVersionUID` with buffered object streams |
| **Unit 4** | Swing EDT Concurrency | `Main.java` | `SwingUtilities.invokeLater()` prevents EDT race conditions |
| **Unit 4** | TCP Sockets | `AttendanceBroadcastServer` | `ServerSocket` and `Socket` broadcast attendance events |
| **Unit 5** | Swing GUI & Layouts | `MainFrame.java` | `BorderLayout`, `CardLayout`, `JTable`, and `JScrollPane` |
| **Unit 5** | Generics & Wildcards | `CrudRepository<T, ID>` | `saveAll(List<? extends T> entities)` wildcard usage |
| **Unit 5** | Collections Framework | `ArrayList`, `HashMap`, `TreeSet`, `Queue` | O(1) lookups, sorted roll numbers, and FIFO requests |

---

### Running the Java Desktop Swing App
Prerequisites: JDK 17 or newer, Apache Maven 3.8+.

```bash
# Navigate to the java project directory
cd smartattend-java

# Compile and run
mvn clean compile exec:java
```

### Running Unit Tests
```bash
mvn test
```
