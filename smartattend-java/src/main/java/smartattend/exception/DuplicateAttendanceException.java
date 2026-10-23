package smartattend.exception;

/**
 * Custom Checked Exception thrown when an attendance session or record already exists.
 */
public class DuplicateAttendanceException extends Exception {
    private final String sessionIdentifier;

    public DuplicateAttendanceException(String message, String sessionIdentifier) {
        super(message);
        this.sessionIdentifier = sessionIdentifier;
    }

    public String getSessionIdentifier() {
        return sessionIdentifier;
    }
}
