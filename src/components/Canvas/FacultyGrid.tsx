import React from 'react';
import { Teacher, StandConfig } from '../../types/stand';
import { PersonCard } from './PersonCard';
import { Plus } from 'lucide-react';

interface FacultyGridProps {
  teachers: Teacher[];
  config: StandConfig;
  onUpdateTeacher: (id: string, patch: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
  onMoveTeacher: (fromIndex: number, toIndex: number) => void;
  onAddTeacher: () => void;
  isEditable?: boolean;
}

export const FacultyGrid: React.FC<FacultyGridProps> = ({
  teachers,
  config,
  onUpdateTeacher,
  onDeleteTeacher,
  onMoveTeacher,
  onAddTeacher,
  isEditable = true,
}) => {
  // Columns class mapping
  const getGridColsClass = () => {
    switch (config.columnsCount) {
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 6:
        return 'grid-cols-6';
      case 5:
      default:
        return 'grid-cols-5';
    }
  };

  return (
    <div className="w-full">
      <div className={`grid ${getGridColsClass()} gap-3.5`}>
        {teachers.map((teacher, index) => (
          <PersonCard
            key={teacher.id}
            teacher={teacher}
            config={config}
            onUpdate={(patch) => onUpdateTeacher(teacher.id, patch)}
            onDelete={teachers.length > 1 ? () => onDeleteTeacher(teacher.id) : undefined}
            onMoveLeft={index > 0 ? () => onMoveTeacher(index, index - 1) : undefined}
            onMoveRight={index < teachers.length - 1 ? () => onMoveTeacher(index, index + 1) : undefined}
            isEditable={isEditable}
          />
        ))}

        {/* Add Teacher Card Button (visible during edit mode) */}
        {isEditable && (
          <button
            onClick={onAddTeacher}
            className="flex flex-col items-center justify-center p-4 min-h-[220px] rounded-xl border-2 border-dashed border-rose-300 hover:border-[#7a0c22] bg-white/40 hover:bg-white/80 transition-all text-slate-500 hover:text-[#7a0c22] group shadow-sm"
            title="Добавить нового преподавателя"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 group-hover:bg-[#7a0c22] text-[#7a0c22] group-hover:text-white flex items-center justify-center mb-2 transition-colors shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider">
              Добавить преподавателя
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Всего: {teachers.length}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
