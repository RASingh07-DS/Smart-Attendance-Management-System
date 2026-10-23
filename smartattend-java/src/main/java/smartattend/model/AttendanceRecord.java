package smartattend.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AttendanceRecord represents the status of an individual student in a specific session.
 * Used within AttendanceSession to demonstrate Composition.
 */
public class AttendanceRecord implements Serializable {
    private static final long serialVersionUID = 104L;

    private final String id;
    private final String sessionId;
    private final String studentId;
    private AttendanceStatus status;
    private String remarks;
    private final LocalDateTime recordedAt;

    public AttendanceRecord(String id, String sessionId, String studentId, AttendanceStatus status, String remarks) {
        this.id = id;
        this.sessionId = sessionId;
        this.studentId = studentId;
        this.status = status;
        this.remarks = remarks;
        this.recordedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getSessionId() { return sessionId; }
    public String getStudentId() { return studentId; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}
