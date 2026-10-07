import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StandData, StandPage, Teacher, StandConfig, HeaderInfo, DepartmentHead, ScheduleInfo } from './types/stand';
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

  // Page Switcher: select active page
  const handleSelectPage = (index: number) => {
    setData((prev) => {
      if (index < 0 || index >= prev.pages.length) return prev;
      return {
        ...prev,
        activePageIndex: index,
        teachers: prev.pages[index]?.teachers || [],
      };
    });
  };

  // Add new page: schedule moves to newly added page, leaving previous pages free for more teachers
  const handleAddPage = () => {
    setData((prev) => {
      const newIndex = prev.pages.length;
      const newPageNumber = newIndex + 1;
      const newPage: StandPage = {
        id: `page-${Date.now()}`,
        name: `Лист ${newPageNumber}`,
        teachers: [],
        showHeadPerson: false,
        showSchedule: true, // Schedule automatically moves to the new page!
        layout: {
          header: { x: 0, y: 0 },
          headPerson: { x: 0, y: 0 },
          facultyGrid: { x: 0, y: 0 },
          schedule: { x: 0, y: 0 },
        },
      };

      // Set showSchedule = false on all other pages so schedule now exclusively lives on the new page
      const updatedPages = prev.pages.map((p) => ({ ...p, showSchedule: false }));
      const allPages = [...updatedPages, newPage];

      return {
        ...prev,
        pages: allPages,
        activePageIndex: newIndex,
        teachers: [],
      };
    });
  };

  // Delete page handler (merges teachers to page 1 and moves schedule back if needed)
  const handleDeletePage = (pageIndex: number) => {
    setData((prev) => {
      if (prev.pages.length <= 1) return prev;
      const deletingPage = prev.pages[pageIndex];
      const remainingPages = prev.pages.filter((_, idx) => idx !== pageIndex);

      // If the deleted page had teachers, move them to the first page so no data is lost
      if (deletingPage.teachers && deletingPage.teachers.length > 0) {
        remainingPages[0] = {
          ...remainingPages[0],
          teachers: [...remainingPages[0].teachers, ...deletingPage.teachers],
        };
      }

      // If the deleted page was holding the schedule, assign schedule to the last remaining page
      const hasAnySchedule = remainingPages.some((p) => p.showSchedule);
      if (!hasAnySchedule) {
        const lastIdx = remainingPages.length - 1;
        remainingPages[lastIdx] = { ...remainingPages[lastIdx], showSchedule: true };
      }

      const nextActiveIndex = Math.min(prev.activePageIndex, remainingPages.length - 1);
      return {
        ...prev,
        pages: remainingPages,
        activePageIndex: nextActiveIndex,
        teachers: remainingPages[nextActiveIndex].teachers,
      };
    });
  };

  // Move teacher from current page to target page
  const handleMoveTeacherToPage = (teacherId: string, targetPageIndex: number) => {
    setData((prev) => {
      if (targetPageIndex < 0 || targetPageIndex >= prev.pages.length) return prev;
      const currentIdx = prev.activePageIndex;
      if (currentIdx === targetPageIndex) return prev;

      const currentPg = prev.pages[currentIdx];
      const targetPg = prev.pages[targetPageIndex];
      const teacherToMove = currentPg.teachers.find((t) => t.id === teacherId);
      if (!teacherToMove) return prev;

      const updatedCurrentTeachers = currentPg.teachers.filter((t) => t.id !== teacherId);
      const updatedTargetTeachers = [...targetPg.teachers, teacherToMove];

      const newPages = prev.pages.map((p, idx) => {
        if (idx === currentIdx) return { ...p, teachers: updatedCurrentTeachers };
        if (idx === targetPageIndex) return { ...p, teachers: updatedTargetTeachers };
        return p;
      });

      return {
        ...prev,
        pages: newPages,
        teachers: updatedCurrentTeachers,
      };
    });
  };

  // Individual teacher update on current page
  const handleUpdateTeacher = (id: string, patch: Partial<Teacher>) => {
    setData((prev) => {
      const activeIdx = prev.activePageIndex;
      const newPages = prev.pages.map((page, idx) => {
        if (idx === activeIdx) {
          return {
            ...page,
            teachers: page.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          };
        }
        return page;
      });

      return {
        ...prev,
        pages: newPages,
        teachers: newPages[activeIdx].teachers,
      };
    });
  };

  // Delete teacher on current page
  const handleDeleteTeacher = (id: string) => {
    setData((prev) => {
      const activeIdx = prev.activePageIndex;
      const newPages = prev.pages.map((page, idx) => {
        if (idx === activeIdx) {
          return {
            ...page,
            teachers: page.teachers.filter((t) => t.id !== id),
          };
        }
        return page;
      });

      return {
        ...prev,
        pages: newPages,
        teachers: newPages[activeIdx].teachers,
      };
    });
  };

  // Reorder teachers on current page
  const handleMoveTeacher = (fromIndex: number, toIndex: number) => {
    setData((prev) => {
      const activeIdx = prev.activePageIndex;
      const currentPage = prev.pages[activeIdx];
      if (!currentPage || toIndex < 0 || toIndex >= currentPage.teachers.length) return prev;

      const copy = [...currentPage.teachers];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);

      const newPages = prev.pages.map((page, idx) => {
        if (idx === activeIdx) {
          return { ...page, teachers: copy };
        }
        return page;
      });

      return {
        ...prev,
        pages: newPages,
        teachers: copy,
      };
    });
  };

  // Add new teacher to current page
  const handleAddTeacher = () => {
    const newId = `t-${Date.now()}`;
    const newTeacher: Teacher = {
      id: newId,
      lastName: 'НОВЫЙ',
      firstName: 'Преподаватель',
      patronymic: 'Кафедры',
      position: 'доцент, к.э.н.',
      photoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" fill="none"><rect width="200" height="240" fill="%23f8fafc"/><circle cx="100" cy="88" r="46" fill="%23bd1818"/><path d="M38 230 C38 165 65 148 100 148 C135 148 162 165 162 230 Z" fill="%23bd1818" opacity="0.88"/><text x="100" y="98" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">НП</text></svg>`,
      photoScale: 1,
    };

    setData((prev) => {
      const activeIdx = prev.activePageIndex;
      const newPages = prev.pages.map((page, idx) => {
        if (idx === activeIdx) {
          return {
            ...page,
            teachers: [...page.teachers, newTeacher],
          };
        }
        return page;
      });

      return {
        ...prev,
        pages: newPages,
        teachers: newPages[activeIdx].teachers,
      };
    });
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

  // Layout coordinates and sizing update
  const handleUpdateLayout = (
    key: keyof StandData['layout'],
    pos: { x?: number; y?: number; width?: number; height?: number }
  ) => {
    setData((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: {
          ...prev.layout[key],
          ...pos,
        },
      },
    }));
  };

  // Reset to initial sample data
  const handleResetToDefault = () => {
    if (window.confirm('Сбросить стенд к исходному шаблону ВолГУ (ИЭУ #BD1818)? Все текущие изменения будут заменены.')) {
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
        {/* Scalable Stand Canvas Workspace (Centered) */}
        <main
          ref={canvasContainerRef}
          className="flex-1 overflow-auto flex items-start justify-center p-6 bg-[#0c101b] transition-all duration-300"
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
            onUpdateConfig={handleUpdateConfig}
            onSelectPage={handleSelectPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onMoveTeacherToPage={handleMoveTeacherToPage}
            zoom={zoom}
            isEditable={!isExporting}
          />
        </main>

        {/* Collapsible Sidebar Controls on the Right */}
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
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onMoveTeacherToPage={handleMoveTeacherToPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* High-Resolution PNG Whatman Export Modal (Supports Multi-Page Export) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        departmentName={data.header.departmentName}
        pages={data.pages}
        activePageIndex={data.activePageIndex}
        onSelectPage={handleSelectPage}
        onExportStart={() => setIsExporting(true)}
        onExportEnd={() => setIsExporting(false)}
      />
    </div>
  );
};

export default App;
