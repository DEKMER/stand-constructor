import React, { useState } from 'react';
import { StandData, Teacher, PaperFormat, PaperOrientation } from '../../types/stand';
import {
  GraduationCap,
  UserCheck,
  Users,
  Clock,
  Palette,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Printer,
  X,
  Camera,
  Crop,
  FileText,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2,
  Move,
} from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

interface SidebarProps {
  data: StandData;
  onUpdateHeader: (patch: Partial<StandData['header']>) => void;
  onUpdateHeadPerson: (patch: Partial<StandData['headPerson']>) => void;
  onUpdateTeacher: (id: string, patch: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
  onMoveTeacher: (from: number, to: number) => void;
  onAddTeacher: () => void;
  onUpdateSchedule: (patch: Partial<StandData['schedule']>) => void;
  onUpdateConfig: (patch: Partial<StandData['config']>) => void;
  onSelectPage?: (index: number) => void;
  onAddPage?: (options?: {
    isFreeDragMode?: boolean;
    paperFormat?: PaperFormat;
    orientation?: PaperOrientation;
  }) => void;
  onDeletePage?: (index: number) => void;
  onMoveTeacherToPage?: (teacherId: string, targetPageIndex: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'pages' | 'teachers' | 'head' | 'header' | 'schedule' | 'design';

interface CropState {
  type: 'teacher' | 'head';
  id?: string;
  name: string;
  imageSrc: string;
  aspectRatio: number;
  slotName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  onUpdateHeader,
  onUpdateHeadPerson,
  onUpdateTeacher,
  onDeleteTeacher,
  onMoveTeacher,
  onAddTeacher,
  onUpdateSchedule,
  onUpdateConfig,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onMoveTeacherToPage,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pages');
  const [cropState, setCropState] = useState<CropState | null>(null);

  if (!isOpen) return null;

  const { header, headPerson, schedule, config, pages = [], activePageIndex = 0 } = data;
  const currentPage = pages[activePageIndex] || pages[0] || {
    id: 'page-1',
    name: 'Лист 1',
    teachers: data.teachers,
    showHeadPerson: true,
    showSchedule: true,
  };
  const teachers = currentPage.teachers || [];

  const getTeacherSlotRatio = (id: string) => {
    const el =
      document.getElementById(`person-card-photo-container-${id}`) ||
      document.querySelector('[id^="person-card-photo-container-"]');
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return rect.width / rect.height;
    }
    return 3 / 4;
  };

  const getHeadSlotRatio = () => {
    const el = document.getElementById('head-person-photo-container');
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return rect.width / rect.height;
    }
    return 0.65;
  };

  const handleTeacherPhotoUpload = (t: Teacher, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropState({
            type: 'teacher',
            id: t.id,
            name: `${t.lastName} ${t.firstName}`,
            imageSrc: event.target.result as string,
            aspectRatio: getTeacherSlotRatio(t.id),
            slotName: 'Карточка преподавателя',
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleHeadPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropState({
            type: 'head',
            name: `${headPerson.lastName} ${headPerson.firstName}`,
            imageSrc: event.target.result as string,
            aspectRatio: getHeadSlotRatio(),
            slotName: 'Главный портрет (Завкафедры)',
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    if (!cropState) return;

    if (cropState.type === 'teacher' && cropState.id) {
      onUpdateTeacher(cropState.id, {
        photoUrl: croppedDataUrl,
        photoScale: 1,
        photoX: 0,
        photoY: 0,
      });
    } else if (cropState.type === 'head') {
      onUpdateHeadPerson({
        photoUrl: croppedDataUrl,
        photoScale: 1,
        photoX: 0,
        photoY: 0,
      });
    }
    setCropState(null);
  };

  return (
    <>
      <aside
        id="stand-sidebar-panel"
        className="relative z-30 h-full w-[430px] flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col transition-all duration-300 animate-slideInRight"
      >
        {/* Sidebar Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#bd1818] flex items-center justify-center text-white font-bold text-sm shadow">
              ИЭУ
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Панель управления</h2>
              <p className="text-[11px] text-slate-400 mt-1">Редактирование стенда кафедры</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Закрыть панель"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-6 bg-slate-950/70 p-1 border-b border-slate-800 text-[11px] font-semibold gap-0.5">
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'pages'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Страницы стенда"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Листы</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'teachers'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Преподаватели"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Преподы</span>
          </button>

          <button
            onClick={() => setActiveTab('head')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'head'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Заведующий кафедрой"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Зав.</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'header'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Шапка стенда"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Шапка</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'schedule'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="График работы"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>График</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`py-1.5 px-1 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'design'
                ? 'bg-[#bd1818] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Оформление и дизайн"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Дизайн</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* =========================================================================
              TAB 0: PAGES / ЛИСТЫ СТЕНДА
             ========================================================================= */}
          {activeTab === 'pages' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Страницы стенда</h3>
                  <p className="text-[11px] text-slate-400">
                    Всего листов: {pages.length}
                  </p>
                </div>
                {onAddPage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddPage({ isFreeDragMode: false })}
                      className="flex items-center gap-1 bg-[#bd1818] hover:bg-[#9e1010] text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                      title="Добавить лист с авто-сеткой"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Сетка</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddPage({ isFreeDragMode: true })}
                      className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                      title="Добавить лист со свободным перемещением (окно полотна строго фиксировано под формат независимо от числа преподавателей)"
                    >
                      <Move className="w-3.5 h-3.5" />
                      <span>+ Свободный</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Informative hint about schedule moving */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-amber-300">💡 Многостраничный стенд:</div>
                <p className="text-slate-400 leading-relaxed">
                  При создании новой страницы блок с расписанием автоматически переносится на неё, а на предыдущей освобождается место для дополнительных преподавателей.
                </p>
              </div>

              {/* Pages Cards List */}
              <div className="space-y-2.5">
                {pages.map((p, idx) => {
                  const isActive = activePageIndex === idx;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-slate-800/90 border-[#bd1818] shadow ring-1 ring-[#bd1818]/60'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => onSelectPage?.(idx)}
                          className={`font-bold text-xs px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-2 ${
                            isActive
                              ? 'bg-[#bd1818] text-white shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{p.name}</span>
                          {isActive && <span className="text-[10px] opacity-80">(Текущий)</span>}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px] font-mono">
                            {p.teachers.length} преп.
                          </span>
                          {pages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Удалить "${p.name}"? Преподаватели будут перемещены на Лист 1.`
                                  )
                                ) {
                                  onDeletePage?.(idx);
                                }
                              }}
                              className="p-1 hover:text-red-400 text-slate-500 hover:bg-slate-800 rounded transition-colors"
                              title="Удалить этот лист"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Page composition badges */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10.5px]">
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            p.showHeadPerson
                              ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                              : 'bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {p.showHeadPerson ? '✓ Завкафедры' : '— Без завкафедры'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            p.showSchedule
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                              : 'bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {p.showSchedule ? '✓ Расписание' : '— Без расписания'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 1: TEACHERS LIST
             ========================================================================= */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Список преподавателей</h3>
                  <p className="text-[11px] text-slate-400">
                    На странице «{currentPage.name}»: {teachers.length} персон
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onAddTeacher}
                  className="flex items-center gap-1.5 bg-[#bd1818] hover:bg-[#9e1010] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </div>

              {/* Columns selector */}
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Колонок:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ columnsCount: 0 })}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                      !config.columnsCount || config.columnsCount === 0
                        ? 'bg-[#bd1818] text-white shadow'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="Автоматический расчет колонок под количество преподавателей без пустот"
                  >
                    Авто
                  </button>
                  {[3, 4, 5, 6, 7].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => onUpdateConfig({ columnsCount: cols })}
                      className={`w-7 h-7 rounded font-bold transition-colors ${
                        config.columnsCount === cols
                          ? 'bg-[#bd1818] text-white shadow'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of teachers with full fields */}
              <div className="space-y-3">
                {teachers.map((t, idx) => (
                  <div
                    key={t.id}
                    className="bg-slate-800/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 shadow-xs transition-colors space-y-2.5"
                  >
                    {/* Top Row: Photo + Controls + Move buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Avatar photo with upload and crop overlay */}
                        <div className="relative group w-11 h-14 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-600">
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt={t.lastName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">Нет</span>
                          )}
                          <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[9px] text-white transition-opacity">
                            <Camera className="w-3.5 h-3.5 mb-0.5 text-rose-300" />
                            <span>Фото</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleTeacherPhotoUpload(t, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-rose-300 truncate">
                            #{idx + 1} {t.lastName || 'Без фамилии'}
                          </div>
                          <div className="text-[11px] text-slate-300 truncate">
                            {t.firstName} {t.patronymic}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{t.position}</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {t.photoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setCropState({
                                type: 'teacher',
                                id: t.id,
                                name: `${t.lastName} ${t.firstName}`,
                                imageSrc: t.photoUrl,
                                aspectRatio: getTeacherSlotRatio(t.id),
                                slotName: 'Карточка преподавателя',
                              })
                            }
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-300 hover:bg-slate-700 transition-colors"
                            title="Кадрировать фото"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveTeacher(idx, idx - 1)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-25 transition-colors"
                          title="Поднять выше"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === teachers.length - 1}
                          onClick={() => onMoveTeacher(idx, idx + 1)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-25 transition-colors"
                          title="Опустить ниже"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {(teachers.length > 1 || pages.length > 1) && (
                          <button
                            type="button"
                            onClick={() => onDeleteTeacher(t.id)}
                            className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Move to another page if multi-page */}
                    {pages.length > 1 && onMoveTeacherToPage && (
                      <div className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 font-medium">Перенести на:</span>
                        <select
                          value=""
                          onChange={(e) => {
                            const target = parseInt(e.target.value, 10);
                            if (!isNaN(target)) onMoveTeacherToPage(t.id, target);
                          }}
                          className="bg-slate-800 text-amber-200 border border-amber-500/40 rounded px-2 py-0.5 text-[10.5px] cursor-pointer hover:bg-slate-700"
                        >
                          <option value="" disabled>
                            Выбрать лист...
                          </option>
                          {pages.map((p, pIdx) =>
                            pIdx !== activePageIndex ? (
                              <option key={p.id} value={pIdx}>
                                {p.name}
                              </option>
                            ) : null
                          )}
                        </select>
                      </div>
                    )}

                    {/* Detailed Fields: Surname, Name, Patronymic, Position */}
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-700/60 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Фамилия:</label>
                        <input
                          type="text"
                          value={t.lastName}
                          onChange={(e) =>
                            onUpdateTeacher(t.id, { lastName: e.target.value.toUpperCase() })
                          }
                          placeholder="ФАМИЛИЯ"
                          className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg text-white font-bold text-xs border border-slate-700 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Имя и Отчество:</label>
                        <input
                          type="text"
                          value={
                            t.firstName && t.patronymic
                              ? `${t.firstName} ${t.patronymic}`
                              : t.firstName || t.patronymic || ''
                          }
                          onChange={(e) => {
                            const parts = e.target.value.trimStart().split(/\s+/);
                            onUpdateTeacher(t.id, {
                              firstName: parts[0] || '',
                              patronymic: parts.slice(1).join(' '),
                            });
                          }}
                          placeholder="Имя Отчество"
                          className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg text-slate-200 text-xs border border-slate-700 focus:border-rose-500 focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Должность и ученая степень:
                        </label>
                        <input
                          type="text"
                          value={t.position}
                          onChange={(e) => onUpdateTeacher(t.id, { position: e.target.value })}
                          placeholder="профессор, д.э.н."
                          className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg text-slate-300 text-xs border border-slate-700 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* Move to another page if multiple pages exist */}
                      {pages.length > 1 && (
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800 text-[10px]">
                          <span className="text-slate-400">Перенести на:</span>
                          {pages.map((pg, pIdx) => {
                            if (pIdx === activePageIndex) return null;
                            return (
                              <button
                                key={pg.id}
                                type="button"
                                onClick={() => onMoveTeacherToPage?.(t.id, pIdx)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-[#bd1818] text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                              >
                                {pg.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: HEAD OF DEPARTMENT
             ========================================================================= */}
          {activeTab === 'head' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Заведующий кафедрой</h3>

              {/* Photo Upload and Recrop */}
              <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="relative group w-16 h-20 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-600">
                  {headPerson.photoUrl ? (
                    <img
                      src={headPerson.photoUrl}
                      alt={headPerson.lastName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Нет фото</span>
                  )}
                  <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[10px] text-white transition-opacity">
                    <Camera className="w-4 h-4 mb-0.5 text-rose-300" />
                    <span>Изменить</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeadPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="font-bold text-slate-200">Фотопортрет завкафедрой</div>
                  <div className="text-[11px] text-slate-400">
                    Рекомендуется вертикальный портрет в хорошем качестве
                  </div>
                  {headPerson.photoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setCropState({
                          type: 'head',
                          name: `${headPerson.lastName} ${headPerson.firstName}`,
                          imageSrc: headPerson.photoUrl,
                          aspectRatio: getHeadSlotRatio(),
                          slotName: 'Главный портрет (Завкафедры)',
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-rose-300 text-[11px] font-medium transition-colors"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Кадрировать</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Фамилия:</label>
                  <input
                    type="text"
                    value={headPerson.lastName}
                    onChange={(e) =>
                      onUpdateHeadPerson({ lastName: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Имя и Отчество:</label>
                  <input
                    type="text"
                    value={
                      headPerson.firstName && headPerson.patronymic
                        ? `${headPerson.firstName} ${headPerson.patronymic}`
                        : headPerson.firstName || headPerson.patronymic || ''
                    }
                    onChange={(e) => {
                      const parts = e.target.value.trimStart().split(/\s+/);
                      onUpdateHeadPerson({
                        firstName: parts[0] || '',
                        patronymic: parts.slice(1).join(' '),
                      });
                    }}
                    placeholder="Имя Отчество"
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Должность / статус:</label>
                  <input
                    type="text"
                    value={headPerson.role}
                    onChange={(e) => onUpdateHeadPerson({ role: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ученая степень и звание:</label>
                  <textarea
                    rows={2}
                    value={headPerson.degree}
                    onChange={(e) => onUpdateHeadPerson({ degree: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Приемные часы:</label>
                  <input
                    type="text"
                    value={headPerson.receptionHours || ''}
                    onChange={(e) => onUpdateHeadPerson({ receptionHours: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email:</label>
                  <input
                    type="text"
                    value={headPerson.email || ''}
                    onChange={(e) => onUpdateHeadPerson({ email: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: STAND HEADER
             ========================================================================= */}
          {activeTab === 'header' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Шапка стенда</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Название университета:</label>
                  <input
                    type="text"
                    value={header.universityName}
                    onChange={(e) => onUpdateHeader({ universityName: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Институт / Факультет:</label>
                  <input
                    type="text"
                    value={header.instituteName}
                    onChange={(e) => onUpdateHeader({ instituteName: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Название кафедры:</label>
                  <input
                    type="text"
                    value={header.departmentName}
                    onChange={(e) =>
                      onUpdateHeader({ departmentName: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={header.showLogo}
                      onChange={(e) => onUpdateHeader({ showLogo: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Показывать герб / логотип университета</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: SCHEDULE & CONTACTS
             ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">График работы и контакты</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Аудитория:</label>
                  <input
                    type="text"
                    value={schedule.auditorium}
                    onChange={(e) => onUpdateSchedule({ auditorium: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Дни (будни):</label>
                    <input
                      type="text"
                      value={schedule.workDaysTitle}
                      onChange={(e) => onUpdateSchedule({ workDaysTitle: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Часы (будни):</label>
                    <input
                      type="text"
                      value={schedule.workDaysHours}
                      onChange={(e) => onUpdateSchedule({ workDaysHours: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Пятница заголовок:</label>
                    <input
                      type="text"
                      value={schedule.fridayTitle}
                      onChange={(e) => onUpdateSchedule({ fridayTitle: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Пятница часы:</label>
                    <input
                      type="text"
                      value={schedule.fridayHours}
                      onChange={(e) => onUpdateSchedule({ fridayHours: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Обед заголовок:</label>
                    <input
                      type="text"
                      value={schedule.lunchTitle}
                      onChange={(e) => onUpdateSchedule({ lunchTitle: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Обед часы:</label>
                    <input
                      type="text"
                      value={schedule.lunchHours}
                      onChange={(e) => onUpdateSchedule({ lunchHours: e.target.value })}
                      className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Телефон кафедры:</label>
                  <input
                    type="text"
                    value={schedule.phone}
                    onChange={(e) => onUpdateSchedule({ phone: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email кафедры:</label>
                  <input
                    type="text"
                    value={schedule.email}
                    onChange={(e) => onUpdateSchedule({ email: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={schedule.showQr}
                      onChange={(e) => onUpdateSchedule({ showQr: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Показывать QR-код кафедры</span>
                  </label>

                  {schedule.showQr && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Ссылка для QR-кода:</label>
                        <input
                          type="text"
                          value={schedule.qrUrl}
                          onChange={(e) => onUpdateSchedule({ qrUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Подпись QR-кода:</label>
                        <input
                          type="text"
                          value={schedule.qrLabel}
                          onChange={(e) => onUpdateSchedule({ qrLabel: e.target.value })}
                          placeholder="Сайт кафедры"
                          className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: DESIGN & PRINT (Pattern settings & IEM Brand Red)
             ========================================================================= */}
          {activeTab === 'design' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Оформление и формат стенда</h3>

              {/* Canvas Format and Orientation Controls */}
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-3">
                <span className="block text-slate-300 font-bold">Формат и размер полотна:</span>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Формат бумаги:</label>
                  <select
                    value={config.paperFormat}
                    onChange={(e) => onUpdateConfig({ paperFormat: e.target.value as PaperFormat })}
                    className="w-full bg-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="A1">Ватман А1 (841×594 мм, стандарт)</option>
                    <option value="A2">Ватман А2 (594×420 мм)</option>
                    <option value="A3">Формат А3 (420×297 мм)</option>
                    <option value="A4">Формат А4 (297×210 мм)</option>
                    <option value="A0">Ватман А0 (1189×841 мм)</option>
                    <option value="16:9">Экран 16:9 (1920×1080)</option>
                    <option value="4:3">Экран 4:3 (1600×1200)</option>
                    <option value="custom">Пользовательский (свой размер)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ориентация:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ orientation: 'landscape' })}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        (config.orientation || 'landscape') === 'landscape'
                          ? 'bg-[#bd1818] text-white shadow ring-1 ring-rose-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <RectangleHorizontal className="w-4 h-4" />
                      <span>Горизонтальная (альбомная)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ orientation: 'portrait' })}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        config.orientation === 'portrait'
                          ? 'bg-[#bd1818] text-white shadow ring-1 ring-rose-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <RectangleVertical className="w-4 h-4" />
                      <span>Вертикальная (книжная)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets (A4, A1) */}
                <div>
                  <span className="block text-[10.5px] text-slate-400 mb-1">Быстрый выбор для печати:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ paperFormat: 'A4', orientation: 'portrait' })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded text-[10.5px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      📄 А4 Вертикально
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ paperFormat: 'A4', orientation: 'landscape' })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded text-[10.5px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      📄 А4 Горизонтально
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ paperFormat: 'A1', orientation: 'landscape' })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded text-[10.5px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      📐 Ватман А1
                    </button>
                  </div>
                </div>

                {config.paperFormat === 'custom' && (
                  <div className="pt-2 border-t border-slate-700 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] text-slate-400 mb-1">Ширина (px):</label>
                      <input
                        type="number"
                        value={config.customWidth || 1600}
                        onChange={(e) => onUpdateConfig({ customWidth: Math.max(300, Number(e.target.value)) })}
                        className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] text-slate-400 mb-1">Высота (px):</label>
                      <input
                        type="number"
                        value={config.customHeight || 1131}
                        onChange={(e) => onUpdateConfig({ customHeight: Math.max(300, Number(e.target.value)) })}
                        className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Exact IEM Brand Color Preset (#BD1818) */}
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
                <span className="block text-slate-300 font-bold">Фирменный цвет института:</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      primaryColor: '#BD1818',
                      secondaryColor: '#9E1010',
                      darkColor: '#6E0808',
                      accentColor: '#E02626',
                    })
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#bd1818] hover:bg-[#9e1010] text-white font-bold transition-all shadow-md shadow-rose-950/60 border border-rose-400/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#bd1818] text-xs font-black">
                      ✓
                    </div>
                    <span>Красный ИЭУ 1 В 1 (#BD1818)</span>
                  </div>
                  <span className="font-mono text-xs text-rose-200 uppercase">ВолГУ</span>
                </button>
              </div>

              {/* Pattern and Behind-Cards Ribbon Settings */}
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-3">
                <span className="block text-slate-300 font-bold">Настройки узора:</span>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    Заметность узора (заходит за карточки преподов):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['subtle', 'normal', 'vibrant'] as const).map((intensity) => (
                      <button
                        key={intensity}
                        type="button"
                        onClick={() => onUpdateConfig({ patternIntensity: intensity })}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          (config.patternIntensity || 'vibrant') === intensity
                            ? 'bg-[#bd1818] text-white shadow ring-1 ring-rose-400'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {intensity === 'subtle'
                          ? 'Умеренный'
                          : intensity === 'normal'
                          ? 'Заметный'
                          : 'Яркий (ИЭУ)'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showCenterRibbons !== false}
                    onChange={(e) => onUpdateConfig({ showCenterRibbons: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Волновой узор за карточками преподавателей</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showWaveRibbons}
                    onChange={(e) => onUpdateConfig({ showWaveRibbons: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Плавные контурные волны и ленты</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showDotMatrices}
                    onChange={(e) => onUpdateConfig({ showDotMatrices: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Точечные матрицы (dot matrix)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-medium">
                  <input
                    type="checkbox"
                    checked={config.isFreeDragMode}
                    onChange={(e) => onUpdateConfig({ isFreeDragMode: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Режим свободного перемещения карточек</span>
                </label>
              </div>

              {/* Print Advice Card */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Printer className="w-4 h-4 text-rose-400" />
                  <span>Советы по печати на ватмане</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Стандартный ватман для стендов — формат А1 (841 × 594 мм).</li>
                  <li>При скачивании PNG формируется четкое изображение с высоким разрешением.</li>
                  <li>При наличии нескольких листов можно экспортировать каждый лист по отдельности.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Shared Image Crop Modal in Sidebar with dynamic slot aspect ratio */}
      <ImageCropModal
        isOpen={cropState !== null}
        imageSrc={cropState?.imageSrc || null}
        title={`Кадрирование фото: ${cropState?.name || ''}`}
        initialAspectRatio={cropState?.aspectRatio || 3 / 4}
        slotName={cropState?.slotName || 'Слот на стенде'}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropState(null)}
      />
    </>
  );
};
