import React, { forwardRef, useState } from 'react';
import { StandData } from '../../types/stand';
import { DecorativeWaves } from './DecorativeWaves';
import { StandHeader } from './StandHeader';
import { HeadPersonBlock } from './HeadPersonBlock';
import { PersonCard } from './PersonCard';
import { ScheduleBlock } from './ScheduleBlock';
import { MovableWrapper } from './MovableWrapper';
import { Plus } from 'lucide-react';
import { calculateStandLayout } from '../../utils/layoutUtils';

interface StandCanvasProps {
  data: StandData;
  onUpdateHeader: (patch: Partial<StandData['header']>) => void;
  onUpdateHeadPerson: (patch: Partial<StandData['headPerson']>) => void;
  onUpdateTeacher: (id: string, patch: Partial<StandData['teachers'][0]>) => void;
  onDeleteTeacher: (id: string) => void;
  onMoveTeacher: (from: number, to: number) => void;
  onAddTeacher: () => void;
  onUpdateSchedule: (patch: Partial<StandData['schedule']>) => void;
  onUpdateLayout: (key: keyof StandData['layout'], pos: { x: number; y: number }) => void;
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
      zoom,
      isEditable = true,
    },
    ref
  ) => {
    const { header, headPerson, teachers, schedule, config, layout } = data;

    // Track drag & drop states between teacher cards
    const [draggedTeacherIdx, setDraggedTeacherIdx] = useState<number | null>(null);
    const [dropTargetTeacherIdx, setDropTargetTeacherIdx] = useState<number | null>(null);

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

    // Aspect ratio dimensions for base A1 landscape (841 x 594 mm -> 1600 x 1131 px)
    const getCanvasDimensions = () => {
      switch (config.paperFormat) {
        case 'A0':
        case 'A1':
        case 'A2':
        default:
          return { width: 1600, height: 1131 };
        case '16:9':
          return { width: 1600, height: 900 };
        case '4:3':
          return { width: 1600, height: 1200 };
      }
    };

    const dims = getCanvasDimensions();
    const layoutPlan = calculateStandLayout(teachers.length, config.columnsCount);

    return (
      <div
        className="flex items-center justify-center p-6 transition-transform duration-100 ease-out select-none"
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
            minHeight: `${dims.height}px`,
            height: `${dims.height}px`,
          }}
          className="relative bg-gradient-to-b from-[#ffffff] via-[#fffbfb] to-[#faf3f4] text-slate-900 shadow-2xl overflow-hidden border border-slate-300 rounded-sm flex flex-col justify-between"
        >
          {/* Decorative Waves and Dot Patterns */}
          <DecorativeWaves config={config} />

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

          {/* --- MAIN CONTENT AREA (Vertically Adaptive) --- */}
          <div className="relative z-10 flex-1 min-h-0 px-8 pb-3 pt-1 flex flex-col justify-between overflow-hidden">
            {!config.isFreeDragMode ? (
              /* --- DYNAMIC ADAPTIVE GRID (Adapts rows and columns to teacher count, zero voids) --- */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layoutPlan.colsCount}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${layoutPlan.rowsCount}, minmax(0, 1fr))`,
                  gap: '10px',
                }}
                className="flex-1 min-h-0 w-full h-full"
              >
                {/* 1. Head of Department Block */}
                <div
                  style={{
                    gridColumnStart: layoutPlan.headPlacement.col,
                    gridColumnEnd: layoutPlan.headPlacement.col + layoutPlan.headPlacement.colSpan,
                    gridRowStart: layoutPlan.headPlacement.row,
                    gridRowEnd: layoutPlan.headPlacement.row + layoutPlan.headPlacement.rowSpan,
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

                {/* 2. Teachers Cards */}
                {teachers.map((t, idx) => {
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
                        onDelete={teachers.length > 1 ? () => onDeleteTeacher(t.id) : undefined}
                        onMoveLeft={idx > 0 ? () => onMoveTeacher(idx, idx - 1) : undefined}
                        onMoveRight={idx < teachers.length - 1 ? () => onMoveTeacher(idx, idx + 1) : undefined}
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
                      />
                    </div>
                  );
                })}

                {/* 3. Schedule & Contacts Block */}
                <div
                  style={{
                    gridColumnStart: layoutPlan.schedulePlacement.col,
                    gridColumnEnd: layoutPlan.schedulePlacement.col + layoutPlan.schedulePlacement.colSpan,
                    gridRowStart: layoutPlan.schedulePlacement.row,
                    gridRowEnd: layoutPlan.schedulePlacement.row + layoutPlan.schedulePlacement.rowSpan,
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

                {/* 4. Single Add Button if there is an empty slot in edit mode ONLY */}
                {isEditable && layoutPlan.addSlotPlacement && (
                  <div
                    style={{
                      gridColumnStart: layoutPlan.addSlotPlacement.col,
                      gridColumnEnd: layoutPlan.addSlotPlacement.col + layoutPlan.addSlotPlacement.colSpan,
                      gridRowStart: layoutPlan.addSlotPlacement.row,
                      gridRowEnd: layoutPlan.addSlotPlacement.row + layoutPlan.addSlotPlacement.rowSpan,
                    }}
                    className="no-print-export h-full min-h-0 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={onAddTeacher}
                      className="w-full h-full rounded-xl border-2 border-dashed border-rose-200 hover:border-[#7a0c22] bg-white/40 hover:bg-white/80 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-[#7a0c22] shadow-xs cursor-pointer"
                    >
                      <Plus className="w-6 h-6 mb-1 text-rose-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Добавить</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* --- FREE DRAG OR CUSTOM MORE/LESS TEACHERS LAYOUT --- */
              <div className="flex gap-4 flex-1 min-h-0 w-full h-full">
                {/* Left: Head of Department */}
                <div className="w-[245px] flex-shrink-0 h-full min-h-0 flex flex-col gap-2.5">
                  <MovableWrapper
                    id="block-head"
                    title="Заведующий кафедрой"
                    position={layout.headPerson}
                    onPositionChange={(pos) => onUpdateLayout('headPerson', pos)}
                    onReset={() => onUpdateLayout('headPerson', { x: 0, y: 0 })}
                    isFreeDragMode={config.isFreeDragMode}
                    zoom={zoom}
                    className={dims.height <= 950 ? 'h-[460px]' : 'h-[620px]'}
                  >
                    <HeadPersonBlock
                      headPerson={headPerson}
                      config={config}
                      onUpdate={onUpdateHeadPerson}
                      isEditable={isEditable}
                    />
                  </MovableWrapper>

                  {/* Schedule block when in free mode or separate column */}
                  <MovableWrapper
                    id="block-schedule"
                    title="График работы и контакты"
                    position={layout.schedule}
                    onPositionChange={(pos) => onUpdateLayout('schedule', pos)}
                    onReset={() => onUpdateLayout('schedule', { x: 0, y: 0 })}
                    isFreeDragMode={config.isFreeDragMode}
                    zoom={zoom}
                    className="flex-1"
                  >
                    <ScheduleBlock
                      schedule={schedule}
                      config={config}
                      onUpdate={onUpdateSchedule}
                      isEditable={isEditable}
                    />
                  </MovableWrapper>
                </div>

                {/* Right: Faculty Grid */}
                <div className="flex-1 h-full overflow-y-auto pr-1">
                  <MovableWrapper
                    id="block-faculty"
                    title="Преподаватели"
                    position={layout.facultyGrid}
                    onPositionChange={(pos) => onUpdateLayout('facultyGrid', pos)}
                    onReset={() => onUpdateLayout('facultyGrid', { x: 0, y: 0 })}
                    isFreeDragMode={config.isFreeDragMode}
                    zoom={zoom}
                  >
                    <div
                      className={`grid gap-3 ${
                        config.columnsCount === 4
                          ? 'grid-cols-4'
                          : config.columnsCount === 6
                          ? 'grid-cols-6'
                          : config.columnsCount === 3
                          ? 'grid-cols-3'
                          : 'grid-cols-5'
                      }`}
                    >
                      {teachers.map((t, index) => (
                        <div key={t.id} className={dims.height <= 950 ? 'h-[230px]' : 'h-[310px]'}>
                          <PersonCard
                            teacher={t}
                            config={config}
                            onUpdate={(patch) => onUpdateTeacher(t.id, patch)}
                            onDelete={teachers.length > 1 ? () => onDeleteTeacher(t.id) : undefined}
                            onMoveLeft={index > 0 ? () => onMoveTeacher(index, index - 1) : undefined}
                            onMoveRight={index < teachers.length - 1 ? () => onMoveTeacher(index, index + 1) : undefined}
                            isEditable={isEditable}
                            isDragging={draggedTeacherIdx === index}
                            isDropTarget={dropTargetTeacherIdx === index}
                            onDragStart={() => handleCardDragStart(index)}
                            onDragOver={(e) => handleCardDragOver(e, index)}
                            onDragLeave={() => handleCardDragLeave(index)}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleCardDrop(index);
                            }}
                          />
                        </div>
                      ))}

                      {isEditable && (
                        <button
                          onClick={onAddTeacher}
                          className={`${dims.height <= 950 ? 'h-[230px]' : 'h-[310px]'} rounded-xl border-2 border-dashed border-rose-300 hover:border-[#7a0c22] bg-white/40 hover:bg-white/80 transition-all text-slate-500 hover:text-[#7a0c22] flex flex-col items-center justify-center p-4 shadow-xs`}
                        >
                          <Plus className="w-8 h-8 mb-2" />
                          <span className="font-bold text-xs uppercase tracking-wider">
                            Добавить преподавателя
                          </span>
                        </button>
                      )}
                    </div>
                  </MovableWrapper>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StandCanvas.displayName = 'StandCanvas';
