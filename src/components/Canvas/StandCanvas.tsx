import React, { forwardRef, useState, useRef } from 'react';
import { StandData, StandPage, Teacher } from '../../types/stand';
import { DecorativeWaves } from './DecorativeWaves';
import { StandHeader } from './StandHeader';
import { HeadPersonBlock } from './HeadPersonBlock';
import { PersonCard } from './PersonCard';
import { ScheduleBlock } from './ScheduleBlock';
import { MovableWrapper } from './MovableWrapper';
import {
  Plus,
  FileText,
  Trash2,
  LayoutGrid,
  Move,
  Sparkles,
  GripHorizontal,
} from 'lucide-react';
import { calculateStandLayout } from '../../utils/layoutUtils';

interface StandCanvasProps {
  data: StandData;
  onUpdateHeader: (patch: Partial<StandData['header']>) => void;
  onUpdateHeadPerson: (patch: Partial<StandData['headPerson']>) => void;
  onUpdateTeacher: (id: string, patch: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
  onMoveTeacher: (from: number, to: number) => void;
  onAddTeacher: () => void;
  onUpdateSchedule: (patch: Partial<StandData['schedule']>) => void;
  onUpdateLayout: (key: keyof StandData['layout'], pos: { x: number; y: number }) => void;
  onUpdateConfig: (patch: Partial<StandData['config']>) => void;
  // Page operations
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onMoveTeacherToPage: (teacherId: string, targetPageIndex: number) => void;
  zoom: number;
  isEditable?: boolean;
}

export const StandCanvas = forwardRef<HTMLDivElement, StandCanvasProps>(
  (
    {
      data,
      onUpdateHeader,
      onUpdateHeadPerson,
      onUpdateTeacher,
      onDeleteTeacher,
      onMoveTeacher,
      onAddTeacher,
      onUpdateSchedule,
      onUpdateLayout,
      onUpdateConfig,
      onSelectPage,
      onAddPage,
      onDeletePage,
      onMoveTeacherToPage,
      zoom,
      isEditable = true,
    },
    ref
  ) => {
    const { header, headPerson, schedule, config, layout, pages, activePageIndex } = data;

    // Current active page (defaults to first page if out of bounds)
    const currentPage: StandPage =
      pages && pages[activePageIndex] ? pages[activePageIndex] : (pages && pages[0]) || {
        id: 'page-1',
        name: 'Лист 1',
        teachers: data.teachers || [],
        showHeadPerson: true,
        showSchedule: true,
      };

    const currentTeachers = currentPage.teachers || [];
    const showHeadPerson = currentPage.showHeadPerson;
    const showSchedule = currentPage.showSchedule;

    // Grid mode drag & drop reorder states
    const [draggedTeacherIdx, setDraggedTeacherIdx] = useState<number | null>(null);
    const [dropTargetTeacherIdx, setDropTargetTeacherIdx] = useState<number | null>(null);

    // Free mode active drag tracking
    const [activeFreeDragId, setActiveFreeDragId] = useState<string | null>(null);
    const freeDragRef = useRef<{
      id: string;
      startMouseX: number;
      startMouseY: number;
      startX: number;
      startY: number;
    } | null>(null);

    // Aspect ratio dimensions for base A1 landscape (1600 x 1131 px)
    const getCanvasDimensions = () => {
      switch (config.paperFormat) {
        case 'A0':
        case 'A1':
        case 'A2':
        case 'A3':
        case 'A4':
        default:
          return { width: 1600, height: 1131 };
        case '16:9':
          return { width: 1600, height: 900 };
        case '4:3':
          return { width: 1600, height: 1200 };
      }
    };

    const dims = getCanvasDimensions();

    // Baseline reference layout from Sheet 1 (pages[0]) to lock uniform card dimensions across all pages
    const page1 = pages && pages[0] ? pages[0] : null;
    const page1TeachersCount = page1?.teachers?.length ?? 15;
    const page1Plan = calculateStandLayout(page1TeachersCount, config.columnsCount, {
      showHeadPerson: page1?.showHeadPerson ?? true,
      showSchedule: page1?.showSchedule ?? true,
    });

    const refColsCount = page1Plan.colsCount || 6;
    const refRowsCount = page1Plan.rowsCount || 3;
    const isNewPage = activePageIndex > 0;

    const layoutPlan = calculateStandLayout(currentTeachers.length, config.columnsCount, {
      showHeadPerson,
      showSchedule,
      referenceColumns: refColsCount,
      referenceRows: refRowsCount,
      isNewPage,
    });

    // Uniform card and sheet adaptation geometry:
    // Header outer height (~92px) + content container padding (16px) = ~108-110px
    const HEADER_OVERHEAD = 110;
    const GRID_GAP = 10;

    // Available width for columns inside px-8 padding (32px left + 32px right = 64px)
    const usableWidth = dims.width - 64;
    const refColWidth = (usableWidth - (refColsCount - 1) * GRID_GAP) / refColsCount;

    // Usable grid height on Sheet 1 (A1 poster height - header overhead)
    const refUsableGridHeight = Math.max(300, dims.height - HEADER_OVERHEAD);
    const refRowHeight = Math.max(
      240,
      (refUsableGridHeight - (refRowsCount - 1) * GRID_GAP) / refRowsCount
    );

    // Dynamic adaptation for Page 2+: height matches the actual number of rows needed
    const currentRowsCount = layoutPlan.rowsCount;
    const adaptedGridHeight = currentRowsCount * refRowHeight + (currentRowsCount - 1) * GRID_GAP;
    const adaptedSheetHeight = Math.round(adaptedGridHeight + HEADER_OVERHEAD);

    // Active sheet height: Page 1 stays full poster, Page 2+ adapts dynamically!
    const activeSheetHeight = isNewPage ? adaptedSheetHeight : dims.height;

    // Magnetic right edge position for schedule in Free Mode (and grid)
    const cardWidthFree = Math.round(refColWidth);
    const cardHeightFree = Math.round(refRowHeight);
    const pinnedScheduleX = dims.width - 32 - cardWidthFree;

    // Grid mode drag reorder handlers
    const handleCardDragStart = (index: number) => {
      setDraggedTeacherIdx(index);
    };

    const handleCardDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedTeacherIdx !== null && draggedTeacherIdx !== index) {
        setDropTargetTeacherIdx(index);
      }
    };

    const handleCardDragLeave = (index: number) => {
      if (dropTargetTeacherIdx === index) {
        setDropTargetTeacherIdx(null);
      }
    };

    const handleCardDrop = (targetIndex: number) => {
      if (draggedTeacherIdx !== null && draggedTeacherIdx !== targetIndex) {
        onMoveTeacher(draggedTeacherIdx, targetIndex);
      }
      setDraggedTeacherIdx(null);
      setDropTargetTeacherIdx(null);
    };

    // Free Mode: Auto-align cards neatly onto coordinates
    const handleAutoAlignFreeCards = () => {
      const snap = config.freeDragSnap || 10;
      const startX = showHeadPerson ? 320 : 40;
      const startY = 130;
      const cardW = cardWidthFree;
      const cardH = cardHeightFree;
      const gapX = GRID_GAP;
      const gapY = GRID_GAP;
      const maxCols = showHeadPerson ? 5 : refColsCount;

      currentTeachers.forEach((t, i) => {
        const col = i % maxCols;
        const row = Math.floor(i / maxCols);
        const x = Math.round((startX + col * (cardW + gapX)) / snap) * snap;
        const y = Math.round((startY + row * (cardH + gapY)) / snap) * snap;
        onUpdateTeacher(t.id, { x, y });
      });

      // Align Head and Schedule if enabled
      if (showHeadPerson) {
        onUpdateLayout('headPerson', { x: 40, y: 130 });
      }
      if (showSchedule) {
        const scheduleY = isNewPage ? 130 : showHeadPerson ? 730 : dims.height - 380;
        onUpdateLayout('schedule', { x: pinnedScheduleX, y: scheduleY });
      }
    };

    // Free Mode: Start dragging individual teacher card
    const handleStartFreeDrag = (
      e: React.MouseEvent,
      teacherId: string,
      currentX: number,
      currentY: number
    ) => {
      if (!isEditable) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, button, [role="button"], a')) return;

      e.preventDefault();
      setActiveFreeDragId(teacherId);

      freeDragRef.current = {
        id: teacherId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: currentX,
        startY: currentY,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!freeDragRef.current) return;
        const currentZoom = zoom || 1;
        const snap = config.freeDragSnap || 10;

        const deltaX = (moveEvent.clientX - freeDragRef.current.startMouseX) / currentZoom;
        const deltaY = (moveEvent.clientY - freeDragRef.current.startMouseY) / currentZoom;

        let nextX = freeDragRef.current.startX + deltaX;
        let nextY = freeDragRef.current.startY + deltaY;

        if (snap > 1) {
          nextX = Math.round(nextX / snap) * snap;
          nextY = Math.round(nextY / snap) * snap;
        }

        // Constrain within poster boundaries
        nextX = Math.max(10, Math.min(dims.width - cardWidthFree - 10, nextX));
        nextY = Math.max(120, Math.min(activeSheetHeight - cardHeightFree - 10, nextY));

        onUpdateTeacher(teacherId, { x: nextX, y: nextY });
      };

      const handleMouseUp = () => {
        setActiveFreeDragId(null);
        freeDragRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div className="flex flex-col items-center justify-start select-none pb-12">
        {/* =========================================================================
            TOP CANVAS CONTROLS BAR: Page Tabs + Mode Switcher (Hidden in print)
           ========================================================================= */}
        <div className="no-print-export w-full max-w-[1600px] mb-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 shadow-xl text-white">
          {/* Left: Page Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Страницы:
            </span>
            {pages.map((p, idx) => {
              const isActive = activePageIndex === idx;
              return (
                <div key={p.id} className="flex items-center group/tab">
                  <button
                    type="button"
                    onClick={() => onSelectPage(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#bd1818] text-white shadow-md shadow-rose-950/50 ring-1 ring-rose-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{p.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-black/30 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {p.teachers.length} преп.
                    </span>
                    {p.showSchedule && (
                      <span
                        className="text-[9.5px] bg-amber-400/25 text-amber-200 border border-amber-400/40 px-1 py-0.2 rounded font-semibold"
                        title="Блок расписания кафедры на этой странице"
                      >
                        Расписание
                      </span>
                    )}
                  </button>

                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Удалить "${p.name}"? Преподаватели с этой страницы будут перемещены на Лист 1.`
                          )
                        ) {
                          onDeletePage(idx);
                        }
                      }}
                      title="Удалить эту страницу"
                      className="p-1 hover:text-red-400 text-slate-500 hover:bg-slate-800 rounded transition-colors ml-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add New Page Button */}
            <button
              type="button"
              onClick={onAddPage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-[#bd1818]/25 hover:border-rose-500 border border-dashed border-slate-600 text-rose-300 transition-all cursor-pointer shadow-xs"
              title="Добавить новый лист (блок с расписанием автоматически переносится на него)"
            >
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Добавить страницу</span>
            </button>
          </div>

          {/* Right: Layout Mode Switcher & Free Mode Tools */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onUpdateConfig({ isFreeDragMode: false })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  !config.isFreeDragMode
                    ? 'bg-[#bd1818] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Режим авто-сетки: карточки адаптивно заполняют стенд без пустот"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Сетка (авто)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateConfig({ isFreeDragMode: true })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  config.isFreeDragMode
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Свободный режим: свободно перемещайте карточки по холсту с узором"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Свободное перемещение</span>
              </button>
            </div>

            {config.isFreeDragMode && (
              <button
                type="button"
                onClick={handleAutoAlignFreeCards}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-semibold rounded-lg border border-amber-500/40 shadow-xs transition-colors cursor-pointer"
                title="Автоматически расставить карточки ровной сеткой на холсте"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Выровнять по сетке</span>
              </button>
            )}

            {isEditable && (
              <button
                type="button"
                onClick={onAddTeacher}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#bd1818] hover:bg-[#9e1010] text-white transition-all cursor-pointer shadow-xs ml-1"
                title="Добавить преподавателя на эту страницу"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Преподаватель</span>
              </button>
            )}
          </div>
        </div>

        {/* Scaled Stand Poster Workspace */}
        <div
          className="flex items-center justify-center p-4 transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Physical Poster (Whatman A1) Container */}
          <div
            ref={ref}
            id="department-stand-print-root"
            style={{
              width: `${dims.width}px`,
              minHeight: `${activeSheetHeight}px`,
              height: `${activeSheetHeight}px`,
            }}
            className="relative bg-gradient-to-b from-[#ffffff] via-[#fffbfb] to-[#faf3f4] text-slate-900 shadow-2xl overflow-hidden border border-slate-300 rounded-xs flex flex-col justify-between"
          >
            {/* =========================================================================
                PROMINENT DECORATIVE WAVES & RIBBONS (Flows behind teacher cards)
               ========================================================================= */}
            <DecorativeWaves config={config} sheetHeight={activeSheetHeight} />

            {/* Professional Crop Marks for Plotter (Optional) */}
            {config.showCropMarks && (
              <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-slate-400" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-slate-400" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-slate-400" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-slate-400" />
                <div className="absolute inset-4 border border-dashed border-rose-300/40" />
              </div>
            )}

            {/* --- TOP: HEADER BLOCK --- */}
            <MovableWrapper
              id="block-header"
              title="Шапка стенда"
              position={layout.header}
              onPositionChange={(pos) => onUpdateLayout('header', pos)}
              onReset={() => onUpdateLayout('header', { x: 0, y: 0 })}
              isFreeDragMode={config.isFreeDragMode}
              zoom={zoom}
            >
              <StandHeader
                header={header}
                config={config}
                onUpdateHeader={onUpdateHeader}
                isEditable={isEditable}
              />
            </MovableWrapper>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="relative z-10 flex-1 min-h-0 px-8 pb-3 pt-1 flex flex-col justify-between overflow-hidden">
              {!config.isFreeDragMode ? (
                /* =========================================================================
                   MODE 1: DYNAMIC ADAPTIVE GRID (Adapts rows and cols, zero empty voids)
                   ========================================================================= */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${layoutPlan.colsCount}, minmax(0, 1fr))`,
                    gridTemplateRows: isNewPage
                      ? `repeat(${layoutPlan.rowsCount}, ${refRowHeight}px)`
                      : `repeat(${layoutPlan.rowsCount}, minmax(0, 1fr))`,
                    gap: `${GRID_GAP}px`,
                  }}
                  className="flex-1 min-h-0 w-full h-full"
                >
                  {/* 1. Head of Department Block (Only if active on this page) */}
                  {showHeadPerson && layoutPlan.headPlacement.colSpan > 0 && (
                    <div
                      style={{
                        gridColumnStart: layoutPlan.headPlacement.col,
                        gridColumnEnd:
                          layoutPlan.headPlacement.col + layoutPlan.headPlacement.colSpan,
                        gridRowStart: layoutPlan.headPlacement.row,
                        gridRowEnd:
                          layoutPlan.headPlacement.row + layoutPlan.headPlacement.rowSpan,
                      }}
                      className="h-full min-h-0 overflow-hidden"
                    >
                      <HeadPersonBlock
                        headPerson={headPerson}
                        config={config}
                        onUpdate={onUpdateHeadPerson}
                        isEditable={isEditable}
                      />
                    </div>
                  )}

                  {/* 2. Teachers Cards for current page */}
                  {currentTeachers.map((t, idx) => {
                    const placement = layoutPlan.teacherPlacements[idx];
                    if (!placement) return null;
                    return (
                      <div
                        key={t.id}
                        style={{
                          gridColumnStart: placement.col,
                          gridColumnEnd: placement.col + placement.colSpan,
                          gridRowStart: placement.row,
                          gridRowEnd: placement.row + placement.rowSpan,
                        }}
                        className="h-full min-h-0 overflow-hidden"
                      >
                        <PersonCard
                          teacher={t}
                          config={config}
                          onUpdate={(patch) => onUpdateTeacher(t.id, patch)}
                          onDelete={
                            currentTeachers.length > 1 || pages.length > 1
                              ? () => onDeleteTeacher(t.id)
                              : undefined
                          }
                          onMoveLeft={idx > 0 ? () => onMoveTeacher(idx, idx - 1) : undefined}
                          onMoveRight={
                            idx < currentTeachers.length - 1
                              ? () => onMoveTeacher(idx, idx + 1)
                              : undefined
                          }
                          isEditable={isEditable}
                          isDragging={draggedTeacherIdx === idx}
                          isDropTarget={dropTargetTeacherIdx === idx}
                          onDragStart={() => handleCardDragStart(idx)}
                          onDragOver={(e) => handleCardDragOver(e, idx)}
                          onDragLeave={() => handleCardDragLeave(idx)}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleCardDrop(idx);
                          }}
                          pages={pages}
                          activePageIndex={activePageIndex}
                          onMoveToPage={(target) => onMoveTeacherToPage(t.id, target)}
                        />
                      </div>
                    );
                  })}

                  {/* 3. Schedule & Contacts Block (Only if active on this page) */}
                  {showSchedule && layoutPlan.schedulePlacement.colSpan > 0 && (
                    <div
                      style={{
                        gridColumnStart: layoutPlan.schedulePlacement.col,
                        gridColumnEnd:
                          layoutPlan.schedulePlacement.col +
                          layoutPlan.schedulePlacement.colSpan,
                        gridRowStart: layoutPlan.schedulePlacement.row,
                        gridRowEnd:
                          layoutPlan.schedulePlacement.row +
                          layoutPlan.schedulePlacement.rowSpan,
                      }}
                      className="h-full min-h-0 overflow-hidden"
                    >
                      <ScheduleBlock
                        schedule={schedule}
                        config={config}
                        onUpdate={onUpdateSchedule}
                        isEditable={isEditable}
                      />
                    </div>
                  )}

                  {/* 4. Single Add Button if empty slot in edit mode ONLY */}
                  {isEditable && layoutPlan.addSlotPlacement && (
                    <div
                      style={{
                        gridColumnStart: layoutPlan.addSlotPlacement.col,
                        gridColumnEnd:
                          layoutPlan.addSlotPlacement.col +
                          layoutPlan.addSlotPlacement.colSpan,
                        gridRowStart: layoutPlan.addSlotPlacement.row,
                        gridRowEnd:
                          layoutPlan.addSlotPlacement.row +
                          layoutPlan.addSlotPlacement.rowSpan,
                      }}
                      className="no-print-export h-full min-h-0 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={onAddTeacher}
                        className="w-full h-full rounded-xl border-2 border-dashed border-rose-300 hover:border-[#bd1818] bg-white/45 hover:bg-white/85 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-[#bd1818] shadow-xs cursor-pointer group"
                      >
                        <Plus className="w-7 h-7 mb-1 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Добавить преподавателя
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* =========================================================================
                   MODE 2: FREE PLACEMENT MODE WITH PATTERN VISIBLE BEHIND ALL CARDS
                   ========================================================================= */
                <div className="relative w-full h-full min-h-0">
                  {/* Subtle Canvas Guidelines for Free Drag Mode */}
                  {isEditable && (
                    <div className="no-print-export absolute top-1 left-2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xs text-amber-200 px-3 py-1 rounded-lg text-xs border border-amber-500/30 shadow-md">
                      <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>
                        Свободный режим: зажмите карточку и перетащите в любую точку холста поверх узора
                      </span>
                    </div>
                  )}

                  {/* 1. Head of Department Block in Free Mode */}
                  {showHeadPerson && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${layout.headPerson?.x ?? 40}px`,
                        top: `${layout.headPerson?.y ?? 130}px`,
                        width: '265px',
                        height: showSchedule ? '580px' : '920px',
                        zIndex: 20,
                      }}
                    >
                      <MovableWrapper
                        id="block-head"
                        title="Заведующий кафедрой"
                        position={layout.headPerson}
                        onPositionChange={(pos) => onUpdateLayout('headPerson', pos)}
                        onReset={() => onUpdateLayout('headPerson', { x: 40, y: 130 })}
                        isFreeDragMode={true}
                        zoom={zoom}
                        className="h-full"
                      >
                        <HeadPersonBlock
                          headPerson={headPerson}
                          config={config}
                          onUpdate={onUpdateHeadPerson}
                          isEditable={isEditable}
                        />
                      </MovableWrapper>
                    </div>
                  )}

                  {/* 2. Schedule Block in Free Mode - Magnetized to right edge & uniform card size */}
                  {showSchedule && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${layout.schedule?.x ?? pinnedScheduleX}px`,
                        top: `${layout.schedule?.y ?? (showHeadPerson ? 730 : 130)}px`,
                        width: `${cardWidthFree}px`,
                        height: `${cardHeightFree}px`,
                        zIndex: 20,
                      }}
                    >
                      <MovableWrapper
                        id="block-schedule"
                        title="График работы и контакты"
                        position={layout.schedule}
                        onPositionChange={(pos) => {
                          const isNearRight = Math.abs(pos.x - pinnedScheduleX) < 50;
                          const nextX = isNearRight ? pinnedScheduleX : pos.x;
                          onUpdateLayout('schedule', { x: nextX, y: pos.y });
                        }}
                        onReset={() =>
                          onUpdateLayout('schedule', {
                            x: pinnedScheduleX,
                            y: showHeadPerson ? 730 : 130,
                          })
                        }
                        isFreeDragMode={true}
                        zoom={zoom}
                        className="h-full"
                      >
                        <ScheduleBlock
                          schedule={schedule}
                          config={config}
                          onUpdate={onUpdateSchedule}
                          isEditable={isEditable}
                        />
                      </MovableWrapper>
                    </div>
                  )}

                  {/* 3. Freely Positioned Teacher Cards */}
                  {currentTeachers.map((t, idx) => {
                    // Fallback coordinates if not yet set
                    const startX = showHeadPerson ? 320 : 40;
                    const maxCols = showHeadPerson ? 5 : refColsCount;
                    const defaultX = startX + (idx % maxCols) * (cardWidthFree + GRID_GAP);
                    const defaultY = 130 + Math.floor(idx / maxCols) * (cardHeightFree + GRID_GAP);
                    const posX = t.x ?? defaultX;
                    const posY = t.y ?? defaultY;
                    const isDraggingThis = activeFreeDragId === t.id;

                    return (
                      <div
                        key={t.id}
                        style={{
                          position: 'absolute',
                          left: `${posX}px`,
                          top: `${posY}px`,
                          width: `${cardWidthFree}px`,
                          height: `${cardHeightFree}px`,
                          zIndex: isDraggingThis ? 50 : 15,
                        }}
                        onMouseDown={(e) => handleStartFreeDrag(e, t.id, posX, posY)}
                        className={`transition-shadow ${
                          isDraggingThis
                            ? 'shadow-2xl ring-3 ring-[#bd1818] cursor-grabbing scale-[1.02]'
                            : 'cursor-grab'
                        }`}
                      >
                        {/* Drag Handle Bar in Free Mode (Hidden in print) */}
                        {isEditable && (
                          <div className="no-print-export absolute -top-5 left-0 right-0 z-30 flex items-center justify-between bg-slate-900/90 text-amber-200 px-2 py-0.5 rounded-t text-[10px] font-bold border border-amber-500/40">
                            <span className="flex items-center gap-1">
                              <GripHorizontal className="w-3 h-3 text-amber-400" />
                              <span>{t.lastName || 'Преподаватель'}</span>
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">
                              {posX},{posY}
                            </span>
                          </div>
                        )}

                        <PersonCard
                          teacher={t}
                          config={config}
                          onUpdate={(patch) => onUpdateTeacher(t.id, patch)}
                          onDelete={() => onDeleteTeacher(t.id)}
                          isEditable={isEditable}
                          pages={pages}
                          activePageIndex={activePageIndex}
                          onMoveToPage={(target) => onMoveTeacherToPage(t.id, target)}
                        />
                      </div>
                    );
                  })}

                  {/* Add Teacher Floating Button in Free Mode */}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={onAddTeacher}
                      style={{
                        position: 'absolute',
                        right: '40px',
                        bottom: '20px',
                        zIndex: 30,
                      }}
                      className="no-print-export flex items-center gap-2 bg-[#bd1818] hover:bg-[#9e1010] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-rose-950/50 border border-rose-400/50 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить преподавателя</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StandCanvas.displayName = 'StandCanvas';
