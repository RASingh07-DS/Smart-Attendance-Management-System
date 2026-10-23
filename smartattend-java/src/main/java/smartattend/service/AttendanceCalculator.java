package smartattend.service;

import smartattend.model.RiskLevel;

/**
 * Pure Mathematical Attendance Calculation Engine.
 * Formula: Attendance Percentage = (Classes Attended / Total Eligible Classes Held) * 100
 */
public class AttendanceCalculator {
    private final double threshold; // default 75.0%
    private final double warningMargin; // default 5.0%

    public AttendanceCalculator(double threshold, double warningMargin) {
        this.threshold = threshold;
        this.warningMargin = warningMargin;
    }

    public AttendanceCalculator() {
        this(75.0, 5.0);
    }

    public double calculatePercentage(int attended, int eligible) {
        if (eligible <= 0) return 0.0;
        double pct = ((double) attended / eligible) * 100.0;
        return Math.round(pct * 100.0) / 100.0;
    }

    public RiskLevel determineRiskLevel(double percentage) {
        if (percentage < threshold) {
            return RiskLevel.CRITICAL;
        } else if (percentage < threshold + warningMargin) {
            return RiskLevel.WARNING;
        } else {
            return RiskLevel.SAFE;
        }
    }

    /**
     * Calculates minimum consecutive classes n needed to reach threshold p:
     * (A + n) / (T + n) >= p  =>  n >= (p*T - A) / (1 - p)
     */
    public int classesNeededForThreshold(int attended, int eligible) {
        double currentPct = calculatePercentage(attended, eligible);
        if (currentPct >= threshold) return 0;
        double p = threshold / 100.0;
        if (p >= 1.0) return -1; // mathematically impossible
        double rawN = (p * eligible - attended) / (1.0 - p);
        return Math.max(1, (int) Math.ceil(rawN));
    }

    /**
     * Calculates maximum upcoming classes m a student can miss while maintaining threshold:
     * A / (T + m) >= p  =>  m <= (A - p*T) / p
     */
    public int maxClassesCanMiss(int attended, int eligible) {
        double p = threshold / 100.0;
        if (p <= 0.0) return 0;
        double rawM = (attended - p * eligible) / p;
        return Math.max(0, (int) Math.floor(rawM));
    }

    public double getThreshold() { return threshold; }
    public double getWarningMargin() { return warningMargin; }
}
