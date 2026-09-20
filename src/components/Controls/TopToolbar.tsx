import React, { useRef, useState, useEffect } from 'react';
import { StandConfig, PaperFormat } from '../../types/stand';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Expand,
  Move,
  RotateCcw,
  FileDown,
  FileUp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TopToolbarProps {
  config: StandConfig;
  onUpdateConfig: (patch: Partial<StandConfig>) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  onExportPng: () => void;
  isExporting: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetToDefault: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  config,
  onUpdateConfig,
  zoom,
  onZoomChange,
  onFitToScreen,
  onExportPng,
  isExporting,
  onExportJson,
  onImportJson,
  onResetToDefault,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Не удалось открыть полноэкранный режим:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Не удалось закрыть полноэкранный режим:', err);
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-slate-200 shadow-md">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Left: App title & Stand format */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${
            isSidebarOpen
              ? 'bg-[#7a0c22] border-rose-500 text-white'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
          }`}
          title="Открыть/закрыть панель настроек"
        >
          <Layers className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Панель</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7a0c22] to-[#c41e3a] flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-wide">
              Конструктор стенда кафедры
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
              Ватман {config.paperFormat}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Tools (Zoom, Drag mode, Crop marks, Format) */}
      <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        {/* Paper Format Selector */}
        <select
          value={config.paperFormat}
          onChange={(e) => onUpdateConfig({ paperFormat: e.target.value as PaperFormat })}
          className="bg-slate-800 text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500"
          title="Формат бумаги для печати"
        >
          <option value="A1">Ватман А1 (841×594 мм)</option>
          <option value="A0">Ватман А0 (1189×841 мм)</option>
          <option value="A2">Ватман А2 (594×420 мм)</option>
          <option value="16:9">Экран 16:9</option>
          <option value="4:3">Экран 4:3</option>
        </select>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Free Drag vs Auto-flow Mode Toggle */}
        <button
          onClick={() => onUpdateConfig({ isFreeDragMode: !config.isFreeDragMode })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            config.isFreeDragMode
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Включить свободное перемещение блоков по холсту"
        >
          <Move className={`w-3.5 h-3.5 ${config.isFreeDragMode ? 'text-amber-400 animate-pulse' : ''}`} />
          <span>{config.isFreeDragMode ? 'Свободный режим (ВКЛ)' : 'Свободный режим'}</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange(Math.max(zoom - 0.1, 0.3))}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="Уменьшить масштаб"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(zoom + 0.1, 1.5))}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="Увеличить масштаб"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onFitToScreen}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="Вписать стенд в окно"
          >
            <Expand className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className={`p-1 rounded transition-colors ${
              isFullscreen
                ? 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/50'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isFullscreen ? 'Выйти из полноэкранного режима (Esc)' : 'Открыть на полный экран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-rose-300" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Right: Project File actions & Download PNG for Whatman */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onResetToDefault}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
          title="Сбросить к исходному шаблону ВолГУ"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Export / Import Project JSON */}
        <button
          onClick={onExportJson}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Сохранить проект в файл JSON"
        >
          <FileDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Загрузить сохраненный проект JSON"
        >
          <FileUp className="w-4 h-4" />
        </button>

        {/* PRIMARY ACTION: Download High-Res PNG for Whatman Print */}
        <button
          onClick={onExportPng}
          disabled={isExporting}
          className="flex items-center gap-2 bg-gradient-to-r from-[#7a0c22] via-[#9e1432] to-[#c41e3a] hover:from-[#92102b] hover:to-[#e11d48] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/50 hover:shadow-rose-900/60 border border-rose-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Рендеринг...' : 'Скачать PNG для ватмана'}</span>
        </button>
      </div>
    </header>
  );
};
