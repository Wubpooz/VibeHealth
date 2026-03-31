/**
 * Period & Cycle Tracker - Implementation Guide & Examples
 *
 * This file demonstrates how to use the period tracking functions
 * and shows integration patterns for the backend routes.
 */

// ============================================================================
// Type Definitions (matching Prisma schema)
// ============================================================================

/**
 * PeriodLog - Database model for menstrual period tracking
 *
 * Fields:
 * - id: Unique identifier (CUID)
 * - userId: Foreign key to User
 * - startDate: DateTime - Start of menstrual period
 * - endDate: DateTime (optional) - End of menstrual period
 * - flowIntensity: FlowIntensity enum - LIGHT, MEDIUM, HEAVY
 * - symptoms: String[] - e.g., ["cramps", "bloating", "headache", "fatigue"]
 * - notes: String (optional) - User notes about the period
 * - createdAt: DateTime - Record creation time
 * - updatedAt: DateTime - Last update time
 *
 * Indexes:
 * - @@unique([userId, startDate]) - Prevent duplicate entries for same date
 * - @@index([userId, startDate]) - Optimize queries for user period history
 */

interface PeriodLog {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date | null;
  flowIntensity: "LIGHT" | "MEDIUM" | "HEAVY";
  symptoms: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Service Functions - Usage Examples
// ============================================================================

import {
  predictNextPeriod,
  estimateFertileWindow,
  getCycleInsights,
} from "./period";

/**
 * Example 1: Predict Next Period
 */
function example_predictNextPeriod() {
  // Simulated data: User's last 3 periods
  const periodHistory = [
    {
      startDate: new Date("2026-03-20"),
      endDate: new Date("2026-03-25"),
    },
    {
      startDate: new Date("2026-02-20"),
      endDate: new Date("2026-02-25"),
    },
    {
      startDate: new Date("2026-01-21"),
      endDate: new Date("2026-01-26"),
    },
  ];

  const nextPeriod = predictNextPeriod(periodHistory);
  console.log("Predicted next period:", nextPeriod);
  // Output: April 19, 2026 (approximately)
}

/**
 * Example 2: Estimate Fertile Window
 */
function example_estimateFertileWindow() {
  const nextPeriodDate = new Date("2026-04-19");

  const fertileWindow = estimateFertileWindow(nextPeriodDate);
  console.log("Fertile window:", {
    start: fertileWindow.start, // ~April 4, 2026
    end: fertileWindow.end,     // ~April 5, 2026
  });
}

/**
 * Example 3: Get Complete Cycle Insights
 */
function example_getCycleInsights() {
  const periodHistory = [
    { startDate: new Date("2026-03-20"), endDate: new Date("2026-03-25") },
    { startDate: new Date("2026-02-20"), endDate: new Date("2026-02-25") },
    { startDate: new Date("2026-01-21"), endDate: new Date("2026-01-26") },
  ];

  const insights = getCycleInsights(periodHistory);
  console.log("Cycle insights:", insights);
  /*
  Output:
  {
    hasData: true,
    lastPeriodStart: 2026-03-20,
    averageCycleLength: 30,      // days
    averagePeriodDuration: 5,    // days
    predictedNextPeriodStart: 2026-04-19,
    fertilityWindow: {
      start: 2026-04-04,
      end: 2026-04-05
    },
    dataPoints: 3
  }
  */
}

// ============================================================================
// Backend Route Integration Patterns
// ============================================================================

/**
 * Pattern 1: POST /api/v1/wellness/period
 * Create a new period log entry
 */
export interface CreatePeriodLogRequest {
  startDate: string; // YYYY-MM-DD format
  endDate?: string;  // YYYY-MM-DD format (optional)
  flowIntensity: "LIGHT" | "MEDIUM" | "HEAVY";
  symptoms?: string[];
  notes?: string;
}

/**
 * Example handler (pseudo-code):
 *
 * async function createPeriodLog(req, res, userId) {
 *   try {
 *     const validated = await periodLogCreateSchema.parse(req.body);
 *
 *     const periodLog = await prisma.periodLog.create({
 *       data: {
 *         userId,
 *         startDate: new Date(validated.startDate),
 *         endDate: validated.endDate ? new Date(validated.endDate) : null,
 *         flowIntensity: validated.flowIntensity,
 *         symptoms: validated.symptoms || [],
 *         notes: validated.notes,
 *       },
 *     });
 *
 *     // Award carrots for tracking
 *     await awardCarrots(userId, 5);
 *
 *     return res.json({ success: true, data: periodLog }, { status: 201 });
 *   } catch (error) {
 *     return handleError(res, error);
 *   }
 * }
 */

/**
 * Pattern 2: GET /api/v1/wellness/period
 * Fetch user's period history and predictions
 */
export interface PeriodHistoryResponse {
  success: boolean;
  data: {
    logs: PeriodLog[];
    predictions: {
      nextPeriodStart: Date | null;
      fertileWindow: { start: Date; end: Date } | null;
      averageCycleLength: number | null;
      averagePeriodDuration: number | null;
    };
  };
}

/**
 * Example handler (pseudo-code):
 *
 * async function getPeriodHistory(req, res, userId) {
 *   try {
 *     const limitParam = parseInt(req.query('limit')) || 12;
 *     const limit = Math.min(limitParam, 24); // Max 24 months
 *
 *     const logs = await prisma.periodLog.findMany({
 *       where: { userId },
 *       orderBy: { startDate: 'desc' },
 *       take: limit,
 *     });
 *
 *     if (logs.length === 0) {
 *       return res.json({
 *         success: true,
 *         data: {
 *           logs: [],
 *           predictions: {
 *             nextPeriodStart: null,
 *             fertileWindow: null,
 *             averageCycleLength: null,
 *             averagePeriodDuration: null,
 *           },
 *         },
 *       });
 *     }
 *
 *     const nextPeriodStart = predictNextPeriod(logs);
 *     const fertileWindow = nextPeriodStart
 *       ? estimateFertileWindow(nextPeriodStart)
 *       : null;
 *
 *     const insights = getCycleInsights(logs);
 *
 *     return res.json({
 *       success: true,
 *       data: {
 *         logs,
 *         predictions: {
 *           nextPeriodStart: insights.predictedNextPeriodStart,
 *           fertileWindow,
 *           averageCycleLength: insights.averageCycleLength,
 *           averagePeriodDuration: insights.averagePeriodDuration,
 *         },
 *       },
 *     });
 *   } catch (error) {
 *     return handleError(res, error);
 *   }
 * }
 */

/**
 * Pattern 3: DELETE /api/v1/wellness/period/:id
 * Delete a period log entry
 */

/**
 * Example handler (pseudo-code):
 *
 * async function deletePeriodLog(req, res, userId) {
 *   try {
 *     const { id } = req.params;
 *
 *     // Verify ownership
 *     const log = await prisma.periodLog.findFirst({
 *       where: { id, userId },
 *     });
 *
 *     if (!log) {
 *       return res.json({ success: false, error: 'Period log not found' }, { status: 404 });
 *     }
 *
 *     await prisma.periodLog.delete({ where: { id } });
 *
 *     return res.json({
 *       success: true,
 *       message: 'Period log deleted',
 *     });
 *   } catch (error) {
 *     return handleError(res, error);
 *   }
 * }
 */

// ============================================================================
// Frontend Integration - TypeScript Types
// ============================================================================

/**
 * Frontend types (to be added to frontend/src/app/core/wellness/wellness-journal.types.ts)
 */

type FlowIntensity = "LIGHT" | "MEDIUM" | "HEAVY";

interface PeriodLogData {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  flowIntensity: FlowIntensity;
  symptoms: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CycleInsights {
  hasData: boolean;
  lastPeriodStart?: Date;
  averageCycleLength?: number;
  averagePeriodDuration?: number;
  predictedNextPeriodStart?: Date;
  fertilityWindow?: { start: Date; end: Date };
  dataPoints?: number;
}

export interface PeriodTrackerResponse {
  success: boolean;
  data: {
    logs: PeriodLogData[];
    insights: CycleInsights;
  };
}

// ============================================================================
// Notes for Implementation
// ============================================================================

/**
 * Validation Schema (Zod)
 *
 * const periodLogCreateSchema = z.object({
 *   startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
 *   endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
 *   flowIntensity: z.enum(['LIGHT', 'MEDIUM', 'HEAVY']),
 *   symptoms: z.array(z.string().max(50)).max(20).optional(),
 *   notes: z.string().max(500).optional(),
 * }).superRefine((data, ctx) => {
 *   // Validate endDate is after startDate if provided
 *   if (data.endDate) {
 *     const start = new Date(data.startDate);
 *     const end = new Date(data.endDate);
 *     if (end < start) {
 *       ctx.addIssue({
 *         code: z.ZodIssueCode.custom,
 *         message: 'End date must be after start date',
 *       });
 *     }
 *   }
 * });
 */

/**
 * Typical Symptoms List (for frontend autocomplete):
 * - Cramps
 * - Bloating
 * - Headache
 * - Fatigue
 * - Mood swings
 * - Back pain
 * - Breast tenderness
 * - Nausea
 * - Acne
 * - Changes in appetite
 */

/**
 * Cycle Status Classifications (for UI):
 * - Menstrual: Days 1-5 (typical)
 * - Follicular: Days 1-13
 * - Ovulation: Days 13-15 (peak fertility)
 * - Luteal: Days 15-28
 *
 * Note: Individual cycles vary; this is based on 28-day average cycle
 */

export { example_predictNextPeriod, example_estimateFertileWindow, example_getCycleInsights };
