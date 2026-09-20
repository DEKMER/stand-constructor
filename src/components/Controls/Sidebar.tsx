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
  Upload,
  QrCode,
  Sliders,
  Printer,
  X,
  Camera,
} from 'lucide-react';

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
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  if (!isOpen) return null;

  const { header, headPerson, teachers, schedule, config } = data;

  const handleTeacherPhoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateTeacher(id, { photoUrl: event.target.result as string, photoScale: 1 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateHeadPerson({ photoUrl: event.target.result as string, photoScale: 1 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="fixed left-0 top-[57px] bottom-0 w-[380px] bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 z-30 flex flex-col shadow-2xl text-slate-200">
      {/* Sidebar Header & Tab navigation */}
      <div className="border-b border-slate-800 p-3 flex items-center justify-between">
        <span className="font-bold text-xs uppercase tracking-wider text-rose-300">
          Настройки стенда
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 gap-1 overflow-x-auto text-[11px]">
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
                onClick={onAddTeacher}
                className="flex items-center gap-1.5 bg-[#7a0c22] hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
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
                {[3, 4, 5, 6].map((cols) => (
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

            {/* List of teachers */}
            <div className="space-y-2">
              {teachers.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative group w-9 h-11 rounded bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={t.photoUrl}
                          alt={t.lastName}
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
                          <Camera className="w-3.5 h-3.5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleTeacherPhoto(t.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-rose-300 truncate">
                          {t.lastName || 'Без фамилии'}
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">
                          {t.firstName} {t.patronymic}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{t.position}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => onMoveTeacher(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Поднять выше"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === teachers.length - 1}
                        onClick={() => onMoveTeacher(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Опустить ниже"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {teachers.length > 1 && (
                        <button
                          onClick={() => onDeleteTeacher(t.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline quick fields */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-700/60 text-xs">
                    <input
                      type="text"
                      value={t.lastName}
                      onChange={(e) =>
                        onUpdateTeacher(t.id, { lastName: e.target.value.toUpperCase() })
                      }
                      placeholder="ФАМИЛИЯ"
                      className="bg-slate-900 px-2 py-1 rounded text-white font-bold text-[11px]"
                    />
                    <input
                      type="text"
                      value={t.position}
                      onChange={(e) => onUpdateTeacher(t.id, { position: e.target.value })}
                      placeholder="Должность, звание"
                      className="bg-slate-900 px-2 py-1 rounded text-slate-300 text-[11px]"
                    />
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

            <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="relative group w-20 h-24 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center flex-shrink-0">
                <img
                  src={headPerson.photoUrl}
                  alt={headPerson.lastName}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[10px] text-white">
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeadPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-rose-300 uppercase block">Главный портрет</span>
                <p className="text-slate-400 text-[11px]">
                  Отображается в левой доминантной колонке стенда.
                </p>
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
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Имя:</label>
                  <input
                    type="text"
                    value={headPerson.firstName}
                    onChange={(e) => onUpdateHeadPerson({ firstName: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Отчество:</label>
                  <input
                    type="text"
                    value={headPerson.patronymic}
                    onChange={(e) => onUpdateHeadPerson({ patronymic: e.target.value })}
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Должность:</label>
                <input
                  type="text"
                  value={headPerson.role}
                  onChange={(e) => onUpdateHeadPerson({ role: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ученая степень, звание:</label>
                <textarea
                  value={headPerson.degree}
                  onChange={(e) => onUpdateHeadPerson({ degree: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Приемные часы:</label>
                <input
                  type="text"
                  value={headPerson.receptionHours || ''}
                  onChange={(e) => onUpdateHeadPerson({ receptionHours: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email:</label>
                <input
                  type="email"
                  value={headPerson.email || ''}
                  onChange={(e) => onUpdateHeadPerson({ email: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
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
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Институт / Факультет:</label>
              <input
                type="text"
                value={header.instituteName}
                onChange={(e) => onUpdateHeader({ instituteName: e.target.value })}
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Название кафедры:</label>
              <input
                type="text"
                value={header.departmentName}
                onChange={(e) => onUpdateHeader({ departmentName: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white font-bold border border-slate-700 text-rose-300"
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
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Дни (будни):</label>
                <input
                  type="text"
                  value={schedule.workDaysTitle}
                  onChange={(e) => onUpdateSchedule({ workDaysTitle: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Часы работы:</label>
                <input
                  type="text"
                  value={schedule.workDaysHours}
                  onChange={(e) => onUpdateSchedule({ workDaysHours: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
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
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Часы (ПТ):</label>
                <input
                  type="text"
                  value={schedule.fridayHours}
                  onChange={(e) => onUpdateSchedule({ fridayHours: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
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
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Время обеда:</label>
                <input
                  type="text"
                  value={schedule.lunchHours}
                  onChange={(e) => onUpdateSchedule({ lunchHours: e.target.value })}
                  className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Телефон кафедры:</label>
              <input
                type="text"
                value={schedule.phone}
                onChange={(e) => onUpdateSchedule({ phone: e.target.value })}
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email кафедры:</label>
              <input
                type="text"
                value={schedule.email}
                onChange={(e) => onUpdateSchedule({ email: e.target.value })}
                className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
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
                    className="w-full bg-slate-800 px-3 py-1.5 rounded-lg text-white border border-slate-700"
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
  );
};
