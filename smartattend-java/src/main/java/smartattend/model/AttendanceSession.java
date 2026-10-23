package smartattend.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Demonstrates COMPOSITION: The AttendanceSession owns its internal records.
 */
public class AttendanceSession implements Serializable {
    private static final long serialVersionUID = 105L;

    private final String id;
    private final String subjectId;
    private final String sectionId;
    private final String facultyId;
    private final LocalDate date;
    private final String sessionType;
    private final String topic;
    private final List<AttendanceRecord> records;

    public AttendanceSession(String id, String subjectId, String sectionId, String facultyId,
                             LocalDate date, String sessionType, String topic) {
        this.id = id;
        this.subjectId = subjectId;
        this.sectionId = sectionId;
        this.facultyId = facultyId;
        this.date = date;
        this.sessionType = sessionType;
        this.topic = topic;
        this.records = new ArrayList<>();
    }

    public void addRecord(String studentId, AttendanceStatus status, String remarks) {
        String recordId = "rec_" + this.id + "_" + studentId;
        AttendanceRecord record = new AttendanceRecord(recordId, this.id, studentId, status, remarks);
        this.records.add(record);
    }

    public List<AttendanceRecord> getRecords() {
        return Collections.unmodifiableList(records);
    }

    public String getId() { return id; }
    public String getSubjectId() { return subjectId; }
    public String getSectionId() { return sectionId; }
    public String getFacultyId() { return facultyId; }
    public LocalDate getDate() { return date; }
    public String getSessionType() { return sessionType; }
    public String getTopic() { return topic; }
}
