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
    return (
      c >= headPlacement.col &&
      c < headPlacement.col + headPlacement.colSpan &&
      r >= headPlacement.row &&
      r < headPlacement.row + headPlacement.rowSpan
    );
  };

  const isOccupiedBySchedule = (c: number, r: number) => {
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
 * leaving ZERO empty rows or holes, and supporting ANY number of teachers (1 to 50+).
 */
export function calculateStandLayout(
  teachersCount: number,
  manualColumns: number = 0
): DynamicLayoutResult {
  const N = teachersCount;

  // 1. If manual columns count is forced by user (3..8)
  if (manualColumns >= 3 && manualColumns <= 8) {
    const cols = manualColumns;
    let rows = 1;

    // Minimum rows needed to fit N teachers + Head + Schedule
    while (true) {
      const headSpan = rows === 1 ? 1 : 2;
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: headSpan };
      const schedulePlacement: CellPlacement = { col: cols, row: rows, colSpan: 1, rowSpan: 1 };
      const slots = buildAvailableSlots(cols, rows, headPlacement, schedulePlacement);

      if (slots.length >= N || rows >= 10) {
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

  // 2. AUTO LAYOUT MODE (Intelligent balanced grid with zero empty holes)

  // Case A: 0 to 3 teachers -> 1 row
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

  // Case B: 4 or 5 teachers -> 2 rows, 4 cols
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
      const teacherPlacements: CellPlacement[] = [
        { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
      ];
      const schedulePlacement: CellPlacement = { col: 4, row: 1, colSpan: 1, rowSpan: 2 };
      return {
        rowsCount,
        colsCount,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement: null,
      };
    }
  }

  // Case C: 6 or 7 teachers -> 2 rows, 5 cols
  if (N === 6 || N === 7) {
    const rowsCount = 2;
    const colsCount = 5;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

    if (N === 6) {
      const teacherPlacements: CellPlacement[] = [
        { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
      ];
      const schedulePlacement: CellPlacement = { col: 5, row: 1, colSpan: 1, rowSpan: 2 };
      return {
        rowsCount,
        colsCount,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement: null,
      };
    } else {
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
    }
  }

  // Case D: 8 or 9 teachers -> 2 rows, 6 cols
  if (N === 8 || N === 9) {
    const rowsCount = 2;
    const colsCount = 6;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

    if (N === 8) {
      const teacherPlacements: CellPlacement[] = [
        { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
        { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
        { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
      ];
      const schedulePlacement: CellPlacement = { col: 6, row: 1, colSpan: 1, rowSpan: 2 };
      return {
        rowsCount,
        colsCount,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement: null,
      };
    } else {
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
    }
  }

  // Dynamic Auto Layout for N >= 10:
  // Dynamically calculate the most aesthetic (cols, rows) combination
  let bestCols = 6;
  let bestRows = 3;

  if (N <= 15) {
    bestCols = 6;
    bestRows = 3;
  } else if (N <= 18) {
    bestCols = 7;
    bestRows = 3;
  } else if (N <= 21) {
    bestCols = 6;
    bestRows = 4;
  } else if (N <= 26) {
    bestCols = 7;
    bestRows = 4;
  } else if (N <= 33) {
    bestCols = 7;
    bestRows = 5;
  } else {
    bestCols = Math.min(8, Math.ceil(Math.sqrt(N * 1.5)));
    bestRows = Math.ceil((N + 3) / (bestCols - 0.7));
  }

  // Ensure slots >= N
  while (true) {
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: Math.min(2, bestRows) };
    const schedulePlacement: CellPlacement = { col: bestCols, row: bestRows, colSpan: 1, rowSpan: 1 };
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
