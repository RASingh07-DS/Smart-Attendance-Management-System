package smartattend.exception;

/**
 * Custom Unchecked Exception thrown when a user attempts an action unauthorized for their role.
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
