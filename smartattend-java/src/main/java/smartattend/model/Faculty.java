package smartattend.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Faculty extends User {
    private static final long serialVersionUID = 102L;

    private final String employeeCode;
    private final String designation;
    private final List<String> assignedSubjectIds;

    public Faculty(String id, String username, String fullName, String email, String departmentId,
                   String employeeCode, String designation) {
        super(id, username, fullName, email, UserRole.FACULTY, departmentId);
        this.employeeCode = employeeCode;
        this.designation = designation;
        this.assignedSubjectIds = new ArrayList<>();
    }

    public void assignSubject(String subjectId) {
        if (!assignedSubjectIds.contains(subjectId)) {
            assignedSubjectIds.add(subjectId);
        }
    }

    public List<String> getAssignedSubjectIds() {
        return Collections.unmodifiableList(assignedSubjectIds);
    }

    @Override
    public String getRoleDescription() {
        return "Faculty [" + designation + ", EmpCode: " + employeeCode + "]";
    }

    public String getEmployeeCode() { return employeeCode; }
    public String getDesignation() { return designation; }
}
