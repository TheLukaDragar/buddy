/**
 * Coordinates save-for-later with in-flight workout status syncs.
 * Kept in a tiny module to avoid circular imports between actions and middleware.
 */

let statusSyncGeneration = 0;
let leaveStatusGuard: { sessionId: string; status: string } | null = null;

export function getStatusSyncGeneration() {
  return statusSyncGeneration;
}

export function invalidateWorkoutStatusSyncs() {
  statusSyncGeneration += 1;
}

/** Arm before writing leave status so racing syncs can restore the correct DB status. */
export function armLeaveStatusGuard(sessionId: string, status: string) {
  leaveStatusGuard = { sessionId, status };
  statusSyncGeneration += 1;
}

export function clearLeaveStatusGuard() {
  leaveStatusGuard = null;
}

export function getLeaveStatusGuard() {
  return leaveStatusGuard;
}
