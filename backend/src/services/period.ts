/**
 * Period & Cycle Tracking Utilities
 *
 * Pure functions for menstrual cycle prediction and fertile window estimation.
 * Uses simple averages to calculate cycle patterns.
 */

interface PeriodLogData {
  startDate: Date;
  endDate?: Date | null;
}

interface FertileWindow {
  start: Date;
  end: Date;
}

/**
 * Calculate the duration of a period in days
 * @param startDate - Start of the period
 * @param endDate - End of the period (optional)
 * @returns Duration in days
 */
function getPeriodDuration(startDate: Date, endDate?: Date | null): number {
  if (!endDate) {
    // If period is ongoing, assume typical duration (5 days)
    return 5;
  }
  const durationMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate cycle length between two period start dates in days
 * @param firstStart - Start date of first period
 * @param secondStart - Start date of second period
 * @returns Cycle length in days
 */
function getCycleLength(firstStart: Date, secondStart: Date): number {
  const durationMs = secondStart.getTime() - firstStart.getTime();
  return Math.round(durationMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the average cycle length from recent complete cycles
 * @param logs - Period logs sorted by startDate DESC (most recent first)
 * @param numCycles - Number of cycles to use for calculation (default: 3)
 * @returns Average cycle length in days, or null if insufficient data
 */
function calculateAverageCycleLength(
  logs: PeriodLogData[],
  numCycles: number = 3
): number | null {
  // Need at least 2 logs to calculate cycle length
  if (logs.length < 2) {
    return null;
  }

  // Sort in ascending order for cycle calculation
  const sortedLogs = [...logs].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  // Calculate cycle lengths between consecutive periods
  const cycleLengths: number[] = [];
  for (let i = 1; i < sortedLogs.length && cycleLengths.length < numCycles; i++) {
    const cycleLength = getCycleLength(
      sortedLogs[i - 1].startDate,
      sortedLogs[i].startDate
    );
    // Sanity check: cycle length should be between 20-45 days (typical range)
    if (cycleLength >= 20 && cycleLength <= 45) {
      cycleLengths.push(cycleLength);
    }
  }

  if (cycleLengths.length === 0) {
    return null;
  }

  // Calculate average
  const sum = cycleLengths.reduce((a, b) => a + b, 0);
  return Math.round(sum / cycleLengths.length);
}

/**
 * Predict the next period start date based on average cycle length
 * @param logs - Period logs sorted by startDate DESC (most recent first)
 * @param numCycles - Number of cycles to use for prediction (default: 3)
 * @returns Predicted date of next period, or null if insufficient data
 */
export function predictNextPeriod(
  logs: PeriodLogData[],
  numCycles: number = 3
): Date | null {
  if (logs.length === 0) {
    return null;
  }

  // Get the most recent period
  const mostRecentLog = logs[0];
  const lastPeriodStart = new Date(mostRecentLog.startDate);

  // Calculate average cycle length
  const avgCycleLength = calculateAverageCycleLength(logs, numCycles);

  // If we can't calculate average (not enough data), use typical cycle length (28 days)
  const cycleLength = avgCycleLength || 28;

  // Predict next period
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

  return nextPeriodDate;
}

/**
 * Estimate the fertile window based on predicted next period start
 *
 * Uses standard fertility calculation:
 * - Ovulation typically occurs ~14 days before the next period
 * - Fertile window: 5 days before ovulation + ovulation day (6 days total)
 * - Some sources extend it to 12-16 days before period start
 *
 * @param nextPeriodStart - Predicted or known start date of next period
 * @returns Fertile window with start and end dates
 */
export function estimateFertileWindow(nextPeriodStart: Date): FertileWindow {
  const nextPeriod = new Date(nextPeriodStart);

  // Ovulation typically occurs ~14 days before next period starts
  const ovulationDate = new Date(nextPeriod);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  // Fertile window: 5 days before ovulation + ovulation day
  // (sperm can live 3-5 days, egg lives ~12-24 hours)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  // End of fertile window: ovulation day (egg survives ~24 hours)
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  return {
    start: fertileWindowStart,
    end: fertileWindowEnd,
  };
}

/**
 * Get comprehensive cycle insights
 * @param logs - Period logs sorted by startDate DESC
 * @returns Cycle statistics and predictions
 */
export function getCycleInsights(logs: PeriodLogData[]) {
  if (logs.length === 0) {
    return {
      hasData: false,
      message: "No period data recorded yet",
    };
  }

  const mostRecentLog = logs[0];
  const avgCycleLength = calculateAverageCycleLength(logs, 3);
  const nextPeriodStart = predictNextPeriod(logs, 3);
  const fertileWindow = nextPeriodStart
    ? estimateFertileWindow(nextPeriodStart)
    : null;

  // Calculate average period duration
  const periodDurations = logs
    .slice(0, 3) // Use last 3 periods
    .map((log) => getPeriodDuration(log.startDate, log.endDate));
  const avgPeriodDuration =
    periodDurations.length > 0
      ? Math.round(
          periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length
        )
      : null;

  return {
    hasData: true,
    lastPeriodStart: mostRecentLog.startDate,
    averageCycleLength: avgCycleLength,
    averagePeriodDuration: avgPeriodDuration,
    predictedNextPeriodStart: nextPeriodStart,
    fertilityWindow: fertileWindow,
    dataPoints: logs.length,
  };
}
