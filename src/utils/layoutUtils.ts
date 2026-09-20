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
 * Calculates an optimal grid layout (rows, columns, and coordinate placements)
 * for the stand so that cards expand and adapt to fill the canvas completely,
 * leaving ZERO empty rows, holes, or voids.
 */
export function calculateStandLayout(
  teachersCount: number,
  manualColumns: number = 0
): DynamicLayoutResult {
  const N = teachersCount;

  // 1. If manual columns count is forced by user (3..6)
  if (manualColumns >= 3 && manualColumns <= 6) {
    const cols = manualColumns;
    let rows = 2;
    if (N <= cols - 2) {
      rows = 1;
    } else if (N > (cols - 1) * 2) {
      rows = 3;
    }

    if (rows === 1) {
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 1 };
      const teacherPlacements: CellPlacement[] = [];
      for (let i = 0; i < N; i++) {
        teacherPlacements.push({ col: i + 2, row: 1, colSpan: 1, rowSpan: 1 });
      }
      const schedulePlacement: CellPlacement = {
        col: Math.min(N + 2, cols),
        row: 1,
        colSpan: 1,
        rowSpan: 1,
      };
      return {
        rowsCount: 1,
        colsCount: cols,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement: null,
      };
    }

    if (rows === 2) {
      const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };
      const teacherCols = cols - 1;
      const teacherPlacements: CellPlacement[] = [];
      for (let i = 0; i < N && i < teacherCols * 2 - 1; i++) {
        const row = i < Math.ceil(N / 2) ? 1 : 2;
        const colOffset = row === 1 ? i : i - Math.ceil(N / 2);
        teacherPlacements.push({
          col: colOffset + 2,
          row,
          colSpan: 1,
          rowSpan: 1,
        });
      }
      const schedulePlacement: CellPlacement = {
        col: cols,
        row: 2,
        colSpan: 1,
        rowSpan: 1,
      };
      return {
        rowsCount: 2,
        colsCount: cols,
        headPlacement,
        schedulePlacement,
        teacherPlacements,
        addSlotPlacement: null,
      };
    }
  }

  // 2. AUTO LAYOUT MODE (Eliminates voids completely)

  // Case A: 0 to 3 teachers -> 1 row
  if (N <= 3) {
    const colsCount = Math.max(3, N + 2);
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 1 };
    const teacherPlacements: CellPlacement[] = [];
    for (let i = 0; i < N; i++) {
      teacherPlacements.push({ col: i + 2, row: 1, colSpan: 1, rowSpan: 1 });
    }
    const schedulePlacement: CellPlacement = { col: colsCount, row: 1, colSpan: 1, rowSpan: 1 };
    return {
      rowsCount: 1,
      colsCount,
      headPlacement,
      schedulePlacement,
      teacherPlacements,
      addSlotPlacement: null,
    };
  }

  // Case B: 4 or 5 teachers (User's exact case: 5 teachers)
  if (N === 4 || N === 5) {
    const rowsCount = 2;
    const colsCount = 4;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

    if (N === 5) {
      // 3 teachers on top row, 2 teachers + schedule on bottom row
      // Exactly 8 out of 8 cells occupied!
      const teacherPlacements: CellPlacement[] = [
        { col: 2, row: 1, colSpan: 1, rowSpan: 1 }, // Teacher 0
        { col: 3, row: 1, colSpan: 1, rowSpan: 1 }, // Teacher 1
        { col: 4, row: 1, colSpan: 1, rowSpan: 1 }, // Teacher 2
        { col: 2, row: 2, colSpan: 1, rowSpan: 1 }, // Teacher 3
        { col: 3, row: 2, colSpan: 1, rowSpan: 1 }, // Teacher 4
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
      // N === 4: Head on left (rows 1-2), Schedule on right (rows 1-2), 4 teachers in center (2x2)
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

  // Case C: 6 or 7 teachers
  if (N === 6 || N === 7) {
    const rowsCount = 2;
    const colsCount = 5;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

    if (N === 6) {
      // 6 teachers: 3 top, 3 bottom. Schedule spans rows 1-2 on the right!
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
      // N === 7: 4 top, 3 bottom, Schedule at col 5 row 2
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

  // Case D: 8 or 9 teachers
  if (N === 8 || N === 9) {
    const rowsCount = 2;
    const colsCount = 6;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

    if (N === 8) {
      // 8 teachers (4x2 in cols 2..5), Schedule spans rows 1-2 on col 6
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
      // N === 9: 5 top, 4 bottom + Schedule in col 6 row 2
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

  // Case E: 10 teachers
  if (N === 10) {
    const rowsCount = 2;
    const colsCount = 6;
    const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 1 };
    const schedulePlacement: CellPlacement = { col: 1, row: 2, colSpan: 1, rowSpan: 1 };
    const teacherPlacements: CellPlacement[] = [];
    for (let i = 0; i < 5; i++) {
      teacherPlacements.push({ col: i + 2, row: 1, colSpan: 1, rowSpan: 1 });
    }
    for (let i = 0; i < 5; i++) {
      teacherPlacements.push({ col: i + 2, row: 2, colSpan: 1, rowSpan: 1 });
    }
    return {
      rowsCount,
      colsCount,
      headPlacement,
      schedulePlacement,
      teacherPlacements,
      addSlotPlacement: null,
    };
  }

  // Case F: 11+ teachers (Classic 3-row layout)
  const rowsCount = 3;
  const colsCount = 6;
  const headPlacement: CellPlacement = { col: 1, row: 1, colSpan: 1, rowSpan: 2 };

  const availableSlots: Array<{ col: number; row: number }> = [
    // Row 1 (Cols 2-6)
    { col: 2, row: 1 },
    { col: 3, row: 1 },
    { col: 4, row: 1 },
    { col: 5, row: 1 },
    { col: 6, row: 1 },
    // Row 2 (Cols 2-6)
    { col: 2, row: 2 },
    { col: 3, row: 2 },
    { col: 4, row: 2 },
    { col: 5, row: 2 },
    { col: 6, row: 2 },
    // Row 3 (Col 1 under Head, and Cols 2-5)
    { col: 1, row: 3 },
    { col: 2, row: 3 },
    { col: 3, row: 3 },
    { col: 4, row: 3 },
    { col: 5, row: 3 },
  ];

  const teacherPlacements: CellPlacement[] = [];
  for (let i = 0; i < N && i < availableSlots.length; i++) {
    teacherPlacements.push({
      col: availableSlots[i].col,
      row: availableSlots[i].row,
      colSpan: 1,
      rowSpan: 1,
    });
  }

  const schedulePlacement: CellPlacement = { col: 6, row: 3, colSpan: 1, rowSpan: 1 };

  const addSlotPlacement =
    N < availableSlots.length
      ? {
          col: availableSlots[N].col,
          row: availableSlots[N].row,
          colSpan: 1,
          rowSpan: 1,
        }
      : null;

  return {
    rowsCount,
    colsCount,
    headPlacement,
    schedulePlacement,
    teacherPlacements,
    addSlotPlacement,
  };
}
