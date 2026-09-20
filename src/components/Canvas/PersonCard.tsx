import React, { useRef } from 'react';
import { Teacher, StandConfig } from '../../types/stand';
import { Camera, Trash2, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, GripVertical } from 'lucide-react';

interface PersonCardProps {
  teacher: Teacher;
  config?: StandConfig;
  onUpdate: (patch: Partial<Teacher>) => void;
  onDelete?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isEditable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  teacher,
  onUpdate,
  onDelete,
  onMoveLeft,
  onMoveRight,
  isEditable = true,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging = false,
  isDropTarget = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdate({
            photoUrl: event.target.result as string,
            photoScale: 1,
            photoX: 0,
            photoY: 0,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustScale = (delta: number) => {
    const current = teacher.photoScale || 1;
    const next = Math.min(Math.max(current + delta, 0.7), 2.5);
    onUpdate({ photoScale: next });
  };

  return (
    <div
      draggable={isEditable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border overflow-hidden text-left p-2 justify-between cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30 scale-95 border-2 border-dashed border-rose-500' : ''
      } ${
        isDropTarget ? 'ring-4 ring-[#7a0c22] border-[#7a0c22] bg-rose-50/70 shadow-2xl scale-[1.02]' : 'border-rose-100/90'
      }`}
      title={isEditable ? 'Зажмите и перетащите мышью, чтобы поменять местами с другой карточкой' : undefined}
    >
      {/* Hidden file input for photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Drag handle icon in top left */}
      {isEditable && (
        <div className="no-print-export absolute top-1.5 left-1.5 z-20 opacity-0 group-hover:opacity-70 transition-opacity bg-slate-900/60 backdrop-blur-xs p-0.5 rounded text-white pointer-events-none">
          <GripVertical className="w-3 h-3" />
        </div>
      )}

      {/* Top Hover Controls */}
      {isEditable && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="no-print-export absolute top-1.5 right-1.5 z-20 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900/90 backdrop-blur-xs px-1 py-0.5 rounded-md shadow text-white cursor-default"
        >
          {onMoveLeft && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft();
              }}
              title="Переместить влево"
              className="p-1 hover:text-rose-400 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
          {onMoveRight && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight();
              }}
              title="Переместить вправо"
              className="p-1 hover:text-rose-400 transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              adjustScale(0.1);
            }}
            title="Увеличить фото"
            className="p-1 hover:text-rose-400 transition-colors"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              adjustScale(-0.1);
            }}
            title="Уменьшить фото"
            className="p-1 hover:text-rose-400 transition-colors"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Удалить карточку"
              className="p-1 hover:text-red-400 transition-colors text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Portrait Photo Container (Vertically Adaptive) */}
      <div className="relative w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center select-none">
        {teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={`${teacher.lastName} ${teacher.firstName}`}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-200 pointer-events-none"
            style={{
              transform: `scale(${teacher.photoScale || 1}) translate(${teacher.photoX || 0}%, ${
                teacher.photoY || 0
              }%)`,
            }}
          />
        ) : (
          <div className="text-slate-400 text-xs">Нет фото</div>
        )}

        {/* Change Photo Overlay */}
        {isEditable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="no-print-export absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium cursor-pointer"
          >
            <Camera className="w-5 h-5 mb-0.5 text-rose-200" />
            <span>Загрузить фото</span>
          </button>
        )}
      </div>

      {/* Typography (Compact and Adaptive) */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="flex flex-col flex-shrink-0 pt-1 px-0.5 cursor-text"
      >
        <div>
          {/* Surname - BOLD UPPERCASE CRIMSON */}
          {isEditable ? (
            <input
              type="text"
              value={teacher.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value.toUpperCase() })}
              placeholder="ФАМИЛИЯ"
              className="font-surname font-black text-base xl:text-lg leading-tight text-[#7a0c22] border-b border-transparent hover:border-rose-300 focus:border-rose-600 focus:outline-none transition-colors w-full tracking-wide truncate"
            />
          ) : (
            <div className="font-surname font-black text-base xl:text-lg leading-tight text-[#7a0c22] tracking-wide truncate">
              {teacher.lastName}
            </div>
          )}

          {/* First name & Patronymic */}
          <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-semibold text-[11px] xl:text-xs leading-tight">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={teacher.firstName}
                  onChange={(e) => onUpdate({ firstName: e.target.value })}
                  placeholder="Имя"
                  className="w-1/2 border-b border-transparent hover:border-slate-300 focus:border-rose-600 focus:outline-none transition-colors truncate"
                />
                <input
                  type="text"
                  value={teacher.patronymic}
                  onChange={(e) => onUpdate({ patronymic: e.target.value })}
                  placeholder="Отчество"
                  className="w-1/2 border-b border-transparent hover:border-slate-300 focus:border-rose-600 focus:outline-none transition-colors truncate"
                />
              </>
            ) : (
              <span className="truncate">
                {teacher.firstName} {teacher.patronymic}
              </span>
            )}
          </div>

          {/* Horizontal Red Accent Line */}
          <div className="h-[2px] w-7 bg-[#c41e3a] my-0.5 rounded-full" />
        </div>

        {/* Position & Academic Rank / Degree */}
        <div>
          {isEditable ? (
            <input
              type="text"
              value={teacher.position}
              onChange={(e) => onUpdate({ position: e.target.value })}
              placeholder="должность, степень"
              className="text-[9.5px] xl:text-[10px] font-bold uppercase tracking-wider text-[#9e1432] leading-tight border-b border-transparent hover:border-rose-300 focus:border-rose-600 focus:outline-none transition-colors w-full truncate"
            />
          ) : (
            <div className="text-[9.5px] xl:text-[10px] font-bold uppercase tracking-wider text-[#9e1432] leading-tight line-clamp-1">
              {teacher.position}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
