import {
  AttendanceConfig,
  AttendanceRecord,
  AttendanceSession,
  RiskLevel,
  Subject,
  SubjectAttendanceSummary,
} from '../types';

export interface StudentCalculationResult {
  studentId: string;
  totalSessionsHeld: number;
  approvedLeaves: number;
  eligibleSessions: number;
  classesAttended: number; // Present + Late (if late counts)
  absences: number;
  lateCount: number;
  percentage: number | null; // null if 0 eligible sessions
  percentageFormatted: string; // e.g., "82.50%" or "N/A"
  riskLevel: RiskLevel;
  classesNeededForTarget: number;
  maxClassesCanMiss: number;
  insightText: string;
}

/**
 * Calculates attendance summary for a student in a specific set of sessions
 */
export function calculateStudentAttendance(
  studentId: string,
  sessions: AttendanceSession[],
  config: AttendanceConfig
): StudentCalculationResult {
  let totalSessionsHeld = 0;
  let approvedLeaves = 0;
  let presentCount = 0;
  let lateCount = 0;
  let absences = 0;

  for (const session of sessions) {
    const record = session.records.find((r) => r.studentId === studentId);
    if (!record) continue;

    totalSessionsHeld++;

    switch (record.status) {
      case 'PRESENT':
        presentCount++;
        break;
      case 'LATE':
        lateCount++;
        break;
      case 'LEAVE':
        approvedLeaves++;
        break;
      case 'ABSENT':
        absences++;
        break;
    }
  }

  // Determine eligible sessions based on leave exclusion rule
  const eligibleSessions = config.excludeApprovedLeaveFromEligible
    ? Math.max(0, totalSessionsHeld - approvedLeaves)
    : totalSessionsHeld;

  // Determine classes attended
  const classesAttended = config.lateCountsAsPresent
    ? presentCount + lateCount
    : presentCount + lateCount * 0.5;

  let percentage: number | null = null;
  let percentageFormatted = 'N/A';
  let riskLevel: RiskLevel = 'SAFE';

  const targetDecimal = config.thresholdPercentage / 100.0;
  const warningDecimal = (config.thresholdPercentage + config.warningMargin) / 100.0;

  let classesNeededForTarget = 0;
  let maxClassesCanMiss = 0;
  let insightText = 'No eligible classes held yet.';

  if (eligibleSessions > 0) {
    percentage = (classesAttended / eligibleSessions) * 100;
    // Round to 2 decimal places
    const rounded = Math.round(percentage * 100) / 100;
    percentageFormatted = `${rounded.toFixed(2)}%`;

    if (percentage < config.thresholdPercentage) {
      riskLevel = 'CRITICAL';
    } else if (percentage < config.thresholdPercentage + config.warningMargin) {
      riskLevel = 'WARNING';
    } else {
      riskLevel = 'SAFE';
    }

    // Predictive insights calculation:
    // 1. Classes needed to reach target p:
    // (A + n) / (T + n) >= p  =>  n >= (p*T - A) / (1 - p)
    if (percentage < config.thresholdPercentage) {
      if (targetDecimal < 1.0) {
        const numerator = targetDecimal * eligibleSessions - classesAttended;
        const denominator = 1.0 - targetDecimal;
        const rawN = numerator / denominator;
        classesNeededForTarget = Math.max(1, Math.ceil(rawN));
        insightText = `Needs to attend next ${classesNeededForTarget} consecutive eligible ${
          classesNeededForTarget === 1 ? 'class' : 'classes'
        } with zero absences to reach ${config.thresholdPercentage}%.`;
      } else {
        insightText = `Target of 100% attendance cannot be reached due to prior absences.`;
        classesNeededForTarget = 0;
      }
    } else {
      classesNeededForTarget = 0;
      // 2. Maximum classes student can miss while maintaining >= p:
      // A / (T + m) >= p  =>  m <= (A - p*T) / p
      if (targetDecimal > 0) {
        const rawM = (classesAttended - targetDecimal * eligibleSessions) / targetDecimal;
        maxClassesCanMiss = Math.max(0, Math.floor(rawM));
        if (maxClassesCanMiss > 0) {
          insightText = `Can afford to miss at most ${maxClassesCanMiss} upcoming ${
            maxClassesCanMiss === 1 ? 'class' : 'classes'
          } while maintaining ${config.thresholdPercentage}%.`;
        } else {
          insightText = `Currently on the border. Missing even 1 future class will drop attendance below ${config.thresholdPercentage}%.`;
        }
      }
    }
  }

  return {
    studentId,
    totalSessionsHeld,
    approvedLeaves,
    eligibleSessions,
    classesAttended,
    absences,
    lateCount,
    percentage,
    percentageFormatted,
    riskLevel,
    classesNeededForTarget,
    maxClassesCanMiss,
    insightText,
  };
}

/**
 * Calculates subject-wise summaries for a student across all subjects
 */
export function calculateStudentSubjectSummaries(
  studentId: string,
  subjects: Subject[],
  sessions: AttendanceSession[],
  config: AttendanceConfig,
  facultyMap: Map<string, string>
): SubjectAttendanceSummary[] {
  return subjects.map((subj) => {
    const subjectSessions = sessions.filter((s) => s.subjectId === subj.id);
    const result = calculateStudentAttendance(studentId, subjectSessions, config);

    return {
      subjectId: subj.id,
      subjectCode: subj.code,
      subjectName: subj.name,
      facultyName: facultyMap.get(subj.facultyId) || 'Faculty Member',
      totalClassesHeld: result.totalSessionsHeld,
      approvedLeaves: result.approvedLeaves,
      eligibleClassesHeld: result.eligibleSessions,
      classesAttended: result.classesAttended,
      absences: result.absences,
      percentage: result.percentage,
      riskLevel: result.riskLevel,
      classesNeededForThreshold: result.classesNeededForTarget,
      maxClassesCanMiss: result.maxClassesCanMiss,
    };
  });
}

/**
 * Dynamic "What-If" simulator for students to test hypothetical scenarios
 */
export function simulateAttendance(
  currentAttended: number,
  currentEligible: number,
  futureClassesToAdd: number,
  futureClassesToAttend: number,
  targetPercentage: number
): {
  projectedAttended: number;
  projectedEligible: number;
  projectedPercentage: number;
  meetsTarget: boolean;
  delta: number;
} {
  const projectedAttended = currentAttended + futureClassesToAttend;
  const projectedEligible = currentEligible + futureClassesToAdd;
  const projectedPercentage =
    projectedEligible > 0 ? (projectedAttended / projectedEligible) * 100 : 0;
  const rounded = Math.round(projectedPercentage * 100) / 100;
  const currentPct = currentEligible > 0 ? (currentAttended / currentEligible) * 100 : 0;

  return {
    projectedAttended,
    projectedEligible,
    projectedPercentage: rounded,
    meetsTarget: rounded >= targetPercentage,
    delta: Math.round((rounded - currentPct) * 100) / 100,
  };
}
