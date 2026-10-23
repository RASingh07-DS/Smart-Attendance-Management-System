package smartattend.model;

public class Admin extends User {
    private static final long serialVersionUID = 103L;

    private final String designation;

    public Admin(String id, String username, String fullName, String email, String departmentId, String designation) {
        super(id, username, fullName, email, UserRole.ADMIN, departmentId);
        this.designation = designation;
    }

    @Override
    public String getRoleDescription() {
        return "Chief Administrator [" + designation + "]";
    }

    public String getDesignation() { return designation; }
}
