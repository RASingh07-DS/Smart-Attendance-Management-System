package smartattend.model;

import java.io.Serializable;

/**
 * Demonstrates GENERALIZATION & INHERITANCE:
 * Abstract base class capturing shared state across institutional users.
 */
public abstract class User implements Serializable {
    private static final long serialVersionUID = 100L;

    protected final String id;
    protected final String username;
    protected final String fullName;
    protected final String email;
    protected final UserRole role;
    protected final String departmentId;
    protected boolean active;

    public User(String id, String username, String fullName, String email, UserRole role, String departmentId) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.departmentId = departmentId;
        this.active = true;
    }

    // Abstract method demonstrating Dynamic Method Dispatch (Runtime Polymorphism)
    public abstract String getRoleDescription();

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public String getDepartmentId() { return departmentId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public String toString() {
        return fullName + " (" + role + ")";
    }
}
