import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StandData, Teacher, StandConfig, HeaderInfo, DepartmentHead, ScheduleInfo } from './types/stand';
import { initialStandData } from './data/initialStandData';
import { loadStandFromStorage, saveStandToStorage, exportProjectToJson, importProjectFromJson } from './utils/storageUtils';
import { StandCanvas } from './components/Canvas/StandCanvas';
import { TopToolbar } from './components/Controls/TopToolbar';
import { Sidebar } from './components/Controls/Sidebar';
import { ExportModal } from './components/Controls/ExportModal';

export const App: React.FC = () => {
  const [data, setData] = useState<StandData>(() => loadStandFromStorage());
  const [zoom, setZoom] = useState<number>(0.65);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom on initial mount
  const handleFitToScreen = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const containerWidth = canvasContainerRef.current.clientWidth - 80;
    const containerHeight = canvasContainerRef.current.clientHeight - 80;
    const targetWidth = 1600;
    const targetHeight = 1131;

    const scaleX = containerWidth / targetWidth;
    const scaleY = containerHeight / targetHeight;
    const bestScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.1);

    setZoom(parseFloat(bestScale.toFixed(2)));
  }, []);

  useEffect(() => {
    handleFitToScreen();
    const handleResize = () => setTimeout(handleFitToScreen, 100);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, [handleFitToScreen]);

  // Save to LocalStorage on changes
  useEffect(() => {
    saveStandToStorage(data);
  }, [data]);

  // Header update handler
  const handleUpdateHeader = (patch: Partial<HeaderInfo>) => {
    setData((prev) => ({
      ...prev,
      header: { ...prev.header, ...patch },
    }));
  };

  // Head Person update handler
  const handleUpdateHeadPerson = (patch: Partial<DepartmentHead>) => {
    setData((prev) => ({
      ...prev,
      headPerson: { ...prev.headPerson, ...patch },
    }));
  };

  // Individual teacher update
  const handleUpdateTeacher = (id: string, patch: Partial<Teacher>) => {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  // Delete teacher
  const handleDeleteTeacher = (id: string) => {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));
  };

  // Reorder teachers
  const handleMoveTeacher = (fromIndex: number, toIndex: number) => {
    setData((prev) => {
      if (toIndex < 0 || toIndex >= prev.teachers.length) return prev;
      const copy = [...prev.teachers];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return { ...prev, teachers: copy };
    });
  };

  // Add new teacher
  const handleAddTeacher = () => {
    const newId = `t-${Date.now()}`;
    const newTeacher: Teacher = {
      id: newId,
      lastName: 'НОВЫЙ',
      firstName: 'Преподаватель',
      patronymic: 'Кафедры',
      position: 'доцент, к.э.н.',
      photoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" fill="none"><rect width="200" height="240" fill="%23f1f3f7"/><circle cx="100" cy="88" r="46" fill="%237a0c22"/><path d="M38 230 C38 165 65 148 100 148 C135 148 162 165 162 230 Z" fill="%237a0c22" opacity="0.85"/><text x="100" y="98" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">НП</text></svg>`,
      photoScale: 1,
    };

    setData((prev) => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher],
    }));
  };

  // Schedule update
  const handleUpdateSchedule = (patch: Partial<ScheduleInfo>) => {
    setData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, ...patch },
    }));
  };

  // Config update
  const handleUpdateConfig = (patch: Partial<StandConfig>) => {
    setData((prev) => ({
      ...prev,
      config: { ...prev.config, ...patch },
    }));
  };

  // Layout coordinates update
  const handleUpdateLayout = (key: keyof StandData['layout'], pos: { x: number; y: number }) => {
    setData((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: pos,
      },
    }));
  };

  // Reset to initial sample data
  const handleResetToDefault = () => {
    if (window.confirm('Сбросить стенд к исходному шаблону ВолГУ? Все текущие изменения будут заменены.')) {
      setData(initialStandData);
    }
  };

  // Export JSON project
  const handleExportJson = () => {
    exportProjectToJson(data);
  };

  // Import JSON project
  const handleImportJson = async (file: File) => {
    try {
      const imported = await importProjectFromJson(file);
      setData(imported);
    } catch (e: any) {
      alert(e.message || 'Ошибка загрузки файла');
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-slate-950 font-main">
      {/* Top Controls Toolbar */}
      <TopToolbar
        config={data.config}
        onUpdateConfig={handleUpdateConfig}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToScreen={handleFitToScreen}
        onExportPng={() => setIsExportModalOpen(true)}
        isExporting={isExporting}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetToDefault={handleResetToDefault}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Workspace Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar Controls */}
        <Sidebar
          data={data}
          onUpdateHeader={handleUpdateHeader}
          onUpdateHeadPerson={handleUpdateHeadPerson}
          onUpdateTeacher={handleUpdateTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onMoveTeacher={handleMoveTeacher}
          onAddTeacher={handleAddTeacher}
          onUpdateSchedule={handleUpdateSchedule}
          onUpdateConfig={handleUpdateConfig}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Scalable Stand Canvas Workspace */}
        <main
          ref={canvasContainerRef}
          className={`flex-1 overflow-auto flex items-start justify-center p-6 bg-[#0c101b] transition-all duration-300 ${
            isSidebarOpen ? 'ml-[380px]' : 'ml-0'
          }`}
        >
          <StandCanvas
            data={data}
            onUpdateHeader={handleUpdateHeader}
            onUpdateHeadPerson={handleUpdateHeadPerson}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onMoveTeacher={handleMoveTeacher}
            onAddTeacher={handleAddTeacher}
            onUpdateSchedule={handleUpdateSchedule}
            onUpdateLayout={handleUpdateLayout}
            zoom={zoom}
            isEditable={!isExporting}
          />
        </main>
      </div>

      {/* High-Resolution PNG Whatman Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        departmentName={data.header.departmentName}
        onExportStart={() => setIsExporting(true)}
        onExportEnd={() => setIsExporting(false)}
      />
    </div>
  );
};

export default App;

