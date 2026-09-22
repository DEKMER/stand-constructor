import React, { useState } from 'react';
import { StandData, Teacher } from '../../types/stand';
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
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'header' | 'head' | 'teachers' | 'schedule' | 'design';

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
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('teachers');
  const [cropState, setCropState] = useState<CropState | null>(null);

  if (!isOpen) return null;

  const { header, headPerson, teachers, schedule, config } = data;

  const getTeacherSlotRatio = (id: string) => {
    const el = document.getElementById(`person-card-photo-container-${id}`) || document.querySelector('[id^="person-card-photo-container-"]');
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
        className="relative z-30 h-full w-[420px] flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col transition-all duration-300 animate-slideInRight"
      >
        {/* Sidebar Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7a0c22] flex items-center justify-center text-white font-bold text-sm shadow">
              Ст
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Панель управления</h2>
              <p className="text-[11px] text-slate-400 mt-1">Редактирование содержимого стенда</p>
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
        <div className="flex bg-slate-950/60 p-1.5 border-b border-slate-800 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'teachers'
                ? 'bg-[#7a0c22] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Преподаватели</span>
          </button>

          <button
            onClick={() => setActiveTab('head')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'head'
                ? 'bg-[#7a0c22] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Завкафедры</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'header'
                ? 'bg-[#7a0c22] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Шапка</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'schedule'
                ? 'bg-[#7a0c22] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>График</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'design'
                ? 'bg-[#7a0c22] text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Дизайн</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* --- TAB 1: TEACHERS LIST --- */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Список преподавателей</h3>
                  <p className="text-[11px] text-slate-400">
                    Всего на стенде: {teachers.length} персон
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onAddTeacher}
                  className="flex items-center gap-1.5 bg-[#7a0c22] hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
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
                        ? 'bg-rose-600 text-white shadow'
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
                          ? 'bg-rose-600 text-white shadow'
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
                        {teachers.length > 1 && (
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB 2: HEAD OF DEPARTMENT --- */}
          {activeTab === 'head' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Заведующий кафедрой</h3>

              <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                <div className="relative group w-20 h-24 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-600">
                  {headPerson.photoUrl ? (
                    <img
                      src={headPerson.photoUrl}
                      alt={headPerson.lastName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Нет</span>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[10px] text-white transition-opacity">
                    <Camera className="w-4 h-4 mb-0.5 text-rose-300" />
                    <span>Фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeadPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-xs space-y-1.5 flex-1">
                  <span className="font-bold text-rose-300 uppercase block">Главный портрет</span>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    Отображается в левой доминантной колонке стенда.
                  </p>
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
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Кадрировать фото</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Фамилия (капсом):</label>
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
                  <label className="block text-slate-400 mb-1">Должность:</label>
                  <input
                    type="text"
                    value={headPerson.role}
                    onChange={(e) => onUpdateHeadPerson({ role: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ученая степень, звание:</label>
                  <textarea
                    value={headPerson.degree}
                    onChange={(e) => onUpdateHeadPerson({ degree: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 resize-none focus:border-rose-500 focus:outline-none"
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
                    type="email"
                    value={headPerson.email || ''}
                    onChange={(e) => onUpdateHeadPerson({ email: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: HEADER (Шапка) --- */}
          {activeTab === 'header' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Шапка стенда</h3>

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
                  onChange={(e) => onUpdateHeader({ departmentName: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 text-rose-300 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={header.showLogo}
                    onChange={(e) => onUpdateHeader({ showLogo: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Показывать эмблему/логотип</span>
                </label>
              </div>
            </div>
          )}

          {/* --- TAB 4: SCHEDULE & CONTACTS --- */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">График работы и контакты</h3>

              <div>
                <label className="block text-slate-400 mb-1">Аудитория:</label>
                <input
                  type="text"
                  value={schedule.auditorium}
                  onChange={(e) => onUpdateSchedule({ auditorium: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
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
                  <label className="block text-slate-400 mb-1">Часы работы:</label>
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
                  <label className="block text-slate-400 mb-1">Пятница:</label>
                  <input
                    type="text"
                    value={schedule.fridayTitle}
                    onChange={(e) => onUpdateSchedule({ fridayTitle: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Часы (ПТ):</label>
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
                  <label className="block text-slate-400 mb-1">Обед:</label>
                  <input
                    type="text"
                    value={schedule.lunchTitle}
                    onChange={(e) => onUpdateSchedule({ lunchTitle: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Время обеда:</label>
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
                )}
              </div>
            </div>
          )}

          {/* --- TAB 5: DESIGN & PRINT --- */}
          {activeTab === 'design' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Оформление и печать</h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showWaveRibbons}
                    onChange={(e) => onUpdateConfig({ showWaveRibbons: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Плавные бордовые волны</span>
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

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showCropMarks}
                    onChange={(e) => onUpdateConfig({ showCropMarks: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Типографские метки обреза (Crop marks)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-medium">
                  <input
                    type="checkbox"
                    checked={config.isFreeDragMode}
                    onChange={(e) => onUpdateConfig({ isFreeDragMode: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Режим свободного перемещения блоков</span>
                </label>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Printer className="w-4 h-4 text-rose-400" />
                  <span>Советы по печати на ватмане</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Стандартный ватман для стендов — формат А1 (841 × 594 мм).</li>
                  <li>При скачивании PNG формируется четкое изображение с высоким разрешением.</li>
                  <li>Файл можно передать в любой копицентр или типографию для плоттерной печати.</li>
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
