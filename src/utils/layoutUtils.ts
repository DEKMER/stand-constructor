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
  // Teachers and Schedule match the exact dimensions of Page 1 cards.
  // Sheet height adapts to minimal number of rows.
  // Schedule is ALWAYS 1x1 at the right edge (col = cols).
  // =========================================================================
  if (isNewPage) {
    const cols =
      manualColumns >= 3 && manualColumns <= 8 ? manualColumns : referenceColumns || 6;

    let R = 1;
    while (true) {
      // If head is enabled on page 2, make it 2x2 if cols >= 4 and R >= 2
      const headColSpan = showHeadPerson ? (cols >= 4 && R >= 2 ? 2 : 1) : 0;
      const headRowSpan = showHeadPerson ? (R >= 2 ? 2 : 1) : 0;
      const headPlacement: CellPlacement = showHeadPerson
        ? { col: 1, row: 1, colSpan: headColSpan, rowSpan: headRowSpan }
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
  // 1. SHEET 1 BASE LAYOUT: 6 COLUMNS BY 3 ROWS (BASE) WITH HEADPERSON 2x2
  // Head of department is ALWAYS 2 columns wide by 2 rows tall (never narrow!).
  // Schedule is ALWAYS 1x1 at the bottom-right corner (col: cols, row: R).
  // =========================================================================
  const cols =
    manualColumns >= 3 && manualColumns <= 8 ? manualColumns : 6;

  // Base rows count is 3 (user requirement: базовая разметка 6 на 3).
  // If teacher count exceeds capacity of 3 rows, adapt upwards (4 rows, etc.).
  let R = 3;

  while (true) {
    const headColSpan = showHeadPerson ? (cols >= 4 ? 2 : 1) : 0;
    const headRowSpan = showHeadPerson ? 2 : 0;
    const headPlacement: CellPlacement = showHeadPerson
      ? { col: 1, row: 1, colSpan: headColSpan, rowSpan: headRowSpan }
      : { col: 0, row: 0, colSpan: 0, rowSpan: 0 };

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
