package smartattend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import smartattend.model.RiskLevel;
import smartattend.service.AttendanceCalculator;

import static org.junit.jupiter.api.Assertions.*;

public class AttendanceCalculatorTest {
    private AttendanceCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AttendanceCalculator(75.0, 5.0);
    }

    @Test
    @DisplayName("Calculate standard percentage correctly")
    void testStandardCalculation() {
        // 6 out of 8 = 75.0%
        double pct = calculator.calculatePercentage(6, 8);
        assertEquals(75.0, pct, 0.001);
        assertEquals(RiskLevel.WARNING, calculator.determineRiskLevel(pct));
    }

    @Test
    @DisplayName("Zero eligible classes returns 0.0 without division by zero crash")
    void testZeroEligibleClasses() {
        double pct = calculator.calculatePercentage(0, 0);
        assertEquals(0.0, pct);
    }

    @Test
    @DisplayName("Consecutive classes needed for remediation calculation")
    void testClassesNeededForThreshold() {
        // Current: 3 attended out of 8 held = 37.5%
        // Target: 75%
        // (3 + n)/(8 + n) >= 0.75 => n >= (0.75*8 - 3)/(1 - 0.75) = (6 - 3)/0.25 = 12
        int needed = calculator.classesNeededForThreshold(3, 8);
        assertEquals(12, needed);

        // Verify: (3 + 12)/(8 + 12) = 15/20 = 75.0%
        double newPct = calculator.calculatePercentage(3 + needed, 8 + needed);
        assertTrue(newPct >= 75.0);
    }

    @Test
    @DisplayName("Classes student can miss while maintaining safe standing")
    void testMaxClassesCanMiss() {
        // Current: 8 attended out of 8 held = 100%
        // Can miss m classes: 8 / (8 + m) >= 0.75 => 8 >= 6 + 0.75m => 2 >= 0.75m => m <= 2.66 => 2
        int canMiss = calculator.maxClassesCanMiss(8, 8);
        assertEquals(2, canMiss);

        // Verify: 8 / (8 + 2) = 8/10 = 80.0% (>= 75.0%)
        double afterMissPct = calculator.calculatePercentage(8, 8 + canMiss);
        assertTrue(afterMissPct >= 75.0);
    }
}
