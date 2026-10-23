package smartattend.model;

/**
 * Concrete subclass extending User, implementing Comparable for natural ordering by roll number.
 */
public class Student extends User implements Comparable<Student> {
    private static final long serialVersionUID = 101L;

    private final String rollNumber;
    private final int semester;
    private final String sectionId;
    private final String courseId;

    public Student(String id, String username, String fullName, String email, String departmentId,
                   String rollNumber, int semester, String sectionId, String courseId) {
        super(id, username, fullName, email, UserRole.STUDENT, departmentId);
        this.rollNumber = rollNumber;
        this.semester = semester;
        this.sectionId = sectionId;
        this.courseId = courseId;
    }

    @Override
    public String getRoleDescription() {
        return "Student [Roll: " + rollNumber + ", Semester " + semester + ", Section: " + sectionId + "]";
    }

    @Override
    public int compareTo(Student other) {
        if (other == null) return 1;
        return this.rollNumber.compareTo(other.rollNumber);
    }

    public String getRollNumber() { return rollNumber; }
    public int getSemester() { return semester; }
    public String getSectionId() { return sectionId; }
    public String getCourseId() { return courseId; }
}
