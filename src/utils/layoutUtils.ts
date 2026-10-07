export interface CellPlacement {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface DynamicLayoutResult {
  rowsCount: number;
  colsCount: number;
  headPlacement: CellPlacement;
  schedulePlacement: CellPlacement;
  teacherPlacements: CellPlacement[];
  addSlotPlacement: CellPlacement | null;
}

export interface StandLayoutOptions {
  manualColumns?: number;
  showHeadPerson?: boolean;
  showSchedule?: boolean;
  referenceColumns?: number;
  referenceRows?: number;
  isNewPage?: boolean;
}

/**
 * Generates an array of available cell coordinates for teachers and add button,
 * excluding the cells reserved for Head of Department and Schedule.
 */
function buildAvailableSlots(
  cols: number,
  rows: number,
  headPlacement: CellPlacement,
  schedulePlacement: CellPlacement
): Array<{ col: number; row: number }> {
  const isOccupiedByHead = (c: number, r: number) => {
    if (headPlacement.colSpan === 0 || headPlacement.rowSpan === 0) return false;
    return (
      c >= headPlacement.col &&
      c < headPlacement.col + headPlacement.colSpan &&
      r >= headPlacement.row &&
      r < headPlacement.row + headPlacement.rowSpan
    );
  };

  const isOccupiedBySchedule = (c: number, r: number) => {
    if (schedulePlacement.colSpan === 0 || schedulePlacement.rowSpan === 0) return false;
    return (
      c >= schedulePlacement.col &&
      c < schedulePlacement.col + schedulePlacement.colSpan &&
      r >= schedulePlacement.row &&
      r < schedulePlacement.row + schedulePlacement.rowSpan
    );
  };

  const slots: Array<{ col: number; row: number }> = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (!isOccupiedByHead(c, r) && !isOccupiedBySchedule(c, r)) {
        slots.push({ col: c, row: r });
      }
    }
  }
  return slots;
}

/**
 * Calculates an optimal grid layout (rows, columns, and coordinate placements)
 * for the stand so that cards expand and adapt to fill the canvas completely,
 * leaving ZERO empty rows or holes, and supporting ANY number of teachers (0 to 50+),
 * with support for multi-page stands (e.g. page without HeadPerson, or without Schedule).
 */
export function calculateStandLayout(
  teachersCount: number,
  manualColumns: number = 0,
  options: StandLayoutOptions = {}
): DynamicLayoutResult {
  const {
    showHeadPerson = true,
    showSchedule = true,
    referenceColumns = 6,
    isNewPage = false,
  } = options;
  const N = Math.max(0, teachersCount);

  // =========================================================================
  // 0. NEW PAGE (PAGE 2, PAGE 3, ETC.) ADAPTIVE SIZING
  // Teachers and Schedule must match the exact dimensions of Page 1 cards,
  // and the sheet height adapts automatically to the minimal number of rows.
  // Schedule is ALWAYS magnetically attached to the right edge (col = colsCount).
  // =========================================================================
  if (isNewPage) {
    const cols =
      manualColumns >= 3 && manualColumns <= 8 ? manualColumns : referenceColumns || 6;

    // Find minimal rows R such that available slots >= N
    let R = 1;
    while (true) {
      const headSpan = showHeadPerson ? (R >= 2 ? 2 : 1) : 0;
      const headPlacement: CellPlacement = showHeadPerson
        ? { col: 1, row: 1, colSpan: 1, rowSpan: headSpan }
        : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };

      // Schedule is ALWAYS 1x1 pinned to the right edge at the bottom-most row
      const schedulePlacement: CellPlacement = showSchedule
        ? { col: cols, row: R, colSpan: 1, rowSpan: 1 }
        : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };

      const slots = buildAvailableSlots(cols, R, headPlacement, schedulePlacement);

      if (slots.length >= N || R >= 20) {
        const teacherPlacements: CellPlacement[] = [];
        for (let i = 0; i < N; i++) {
          if (slots[i]) {
            teacherPlacements.push({
              col: slots[i].col,
              row: slots[i].row,
              colSpan: 1,
              rowSpan: 1,
            });
          }
        }

        const addSlotPlacement =
          slots.length > N
            ? {
                col: slots[N].col,
                row: slots[N].row,
                colSpan: 1,
                rowSpan: 1,
              }
            : null;

        return {
          rowsCount: R,
          colsCount: cols,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement,
        };
      }
      R++;
    }
  }

  // =========================================================================
  // 1. If manual columns count is forced by user (3..8) on Sheet 1
  // =========================================================================
  if (manualColumns >= 3 && manualColumns <= 8) {
    const cols = manualColumns;
    let rows = 1;

    while (true) {
      const headSpan = rows === 1 ? 1 : 2;
      const headPlacement: CellPlacement = showHeadPerson
        ? { col: 1, row: 1, colSpan: 1, rowSpan: headSpan }
        : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };
      const schedulePlacement: CellPlacement = showSchedule
        ? { col: cols, row: rows, colSpan: 1, rowSpan: 1 }
        : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };

      const slots = buildAvailableSlots(cols, rows, headPlacement, schedulePlacement);

      if (slots.length >= N || rows >= 12) {
        const teacherPlacements: CellPlacement[] = [];
        for (let i = 0; i < N; i++) {
          if (slots[i]) {
            teacherPlacements.push({
              col: slots[i].col,
              row: slots[i].row,
              colSpan: 1,
              rowSpan: 1,
            });
          }
        }

        const addSlotPlacement =
          slots.length > N
            ? {
                col: slots[N].col,
                row: slots[N].row,
                colSpan: 1,
                rowSpan: 1,
              }
            : null;

        return {
          rowsCount: rows,
          colsCount: cols,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement,
        };
      }
      rows++;
    }
  }

  // =========================================================================
  // 2. AUTO LAYOUT PRESETS when BOTH Head and Schedule are enabled on Sheet 1
  // All presets have Schedule pinned to the right edge (col = colsCount) and 1x1!
  // =========================================================================
  if (showHeadPerson && showSchedule) {
    if (N <= 3) {
      const colsCount = Math.max(3, N + 2);
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 1 };
      const schedulePlacement: CellPlacement = { col: colsCount, row: 1, colSpan: 1, rowSpan: 1 };
      const teacherPlacements: CellPlacement[] = [];
      for (let i = 0; i < N; i++) {
        teacherPlacements.push({ col: i + 2, row: 1, colSpan: 1, rowSpan: 1 });
      }
      const addSlotPlacement =
        N < colsCount - 2
          ? { col: N + 2, row: 1, colSpan: 1, rowSpan: 1 }
          : null;

      return {
        rowsCount: 1,
        colsCount,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement,
      };
    }

    if (N === 4 || N === 5) {
      const rowsCount = 2;
      const colsCount = 4;
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

      if (N === 5) {
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 4, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: null,
        };
      } else {
        // N === 4: Schedule is 1x1 pinned to bottom right, leaving 1 slot for Add Teacher
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 4, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
        };
      }
    }

    if (N === 6 || N === 7) {
      const rowsCount = 2;
      const colsCount = 5;
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

      if (N === 7) {
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 5, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: null,
        };
      } else {
        // N === 6: Schedule is 1x1 pinned to bottom right
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 5, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
        };
      }
    }

    if (N === 8 || N === 9) {
      const rowsCount = 2;
      const colsCount = 6;
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

      if (N === 9) {
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 6, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 6, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: null,
        };
      } else {
        // N === 8: Schedule is 1x1 pinned to bottom right
        const teacherPlacements: CellPlacement[] = [
          { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 6, row: 1, colSpan: 1, rowSpan: 1 },
          { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
          { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
        ];
        const schedulePlacement: CellPlacement = { col: 6, row: 2, colSpan: 1, rowSpan: 1 };
        return {
          rowsCount,
          colsCount,
          headPlacement,
          schedulePlacement,
          teacherPlacements,
          addSlotPlacement: { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
        };
      }
    }
  }

  // =========================================================================
  // 3. GENERAL DYNAMIC AUTO LAYOUT (Sheet 1 with any number of teachers)
  // Schedule is ALWAYS 1x1 pinned to the bottom-right corner (col: bestCols, row: bestRows).
  // =========================================================================
  const reservedSlots = (showHeadPerson ? 2 : 0) + (showSchedule ? 1 : 0);
  const totalSlotsNeeded = N + reservedSlots;

  let bestCols = 5;
  let bestRows = 2;

  if (totalSlotsNeeded <= 4) {
    bestCols = Math.max(2, totalSlotsNeeded);
    bestRows = 1;
  } else if (totalSlotsNeeded <= 8) {
    bestCols = 4;
    bestRows = 2;
  } else if (totalSlotsNeeded <= 12) {
    bestCols = 5;
    bestRows = totalSlotsNeeded <= 10 ? 2 : 3;
  } else if (totalSlotsNeeded <= 18) {
    bestCols = 6;
    bestRows = 3;
  } else if (totalSlotsNeeded <= 24) {
    bestCols = 6;
    bestRows = 4;
  } else if (totalSlotsNeeded <= 32) {
    bestCols = 7;
    bestRows = 4;
  } else {
    bestCols = 7;
    bestRows = Math.ceil(totalSlotsNeeded / 7);
  }

  while (true) {
    const headSpan = bestRows >= 2 ? 2 : 1;
    const headPlacement: CellPlacement = showHeadPerson
      ? { col: 1, row: 1, colSpan: 1, rowSpan: headSpan }
      : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };
    const schedulePlacement: CellPlacement = showSchedule
      ? { col: bestCols, row: bestRows, colSpan: 1, rowSpan: 1 }
      : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };

    const slots = buildAvailableSlots(bestCols, bestRows, headPlacement, schedulePlacement);

    if (slots.length >= N) {
      const teacherPlacements: CellPlacement[] = [];
      for (let i = 0; i < N; i++) {
        teacherPlacements.push({
          col: slots[i].col,
          row: slots[i].row,
          colSpan: 1,
          rowSpan: 1,
        });
      }

      const addSlotPlacement =
        slots.length > N
          ? {
              col: slots[N].col,
              row: slots[N].row,
              colSpan: 1,
              rowSpan: 1,
            }
          : null;

      return {
        rowsCount: bestRows,
        colsCount: bestCols,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement,
      };
    }

    if (bestCols < 7) {
      bestCols++;
    } else {
      bestRows++;
    }
  }
}
