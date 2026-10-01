import React, { useState } from 'react';
import { Download, X, Loader2, AlertCircle, FileImage, Layers } from 'lucide-react';
import { exportStandToPng } from '../../utils/exportUtils';
import { PaperFormat, StandPage } from '../../types/stand';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  initialFormat?: PaperFormat;
  pages?: StandPage[];
  activePageIndex?: number;
  onSelectPage?: (index: number) => void;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

interface FormatOption {
  id: PaperFormat;
  title: string;
  dimensionsMm: string;
  description: string;
  baseMultiplier: number;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'A1',
    title: 'Ватман А1',
    dimensionsMm: '841 × 594 мм',
    description: 'Большой настенный стенд кафедры (стандарт)',
    baseMultiplier: 3.5,
  },
  {
    id: 'A2',
    title: 'Формат А2',
    dimensionsMm: '594 × 420 мм',
    description: 'Средний стенд или информационный постер',
    baseMultiplier: 2.8,
  },
  {
    id: 'A3',
    title: 'Формат А3',
    dimensionsMm: '420 × 297 мм',
    description: 'Офисный формат, настольный стенд / папка',
    baseMultiplier: 2.2,
  },
  {
    id: 'A4',
    title: 'Формат А4',
    dimensionsMm: '297 × 210 мм',
    description: 'Стандартный лист (для раздатки / отчетов)',
    baseMultiplier: 1.8,
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  departmentName,
  initialFormat = 'A1',
  pages = [],
  activePageIndex = 0,
  onSelectPage,
  onExportStart,
  onExportEnd,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<PaperFormat>(
    ['A1', 'A2', 'A3', 'A4'].includes(initialFormat) ? initialFormat : 'A1'
  );
  const [qualityMode, setQualityMode] = useState<'standard' | 'high' | 'ultra'>('high');
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getMultiplier = () => {
    const formatConfig = FORMAT_OPTIONS.find((f) => f.id === selectedFormat) || FORMAT_OPTIONS[0];
    if (qualityMode === 'standard') return Math.max(1.5, formatConfig.baseMultiplier * 0.7);
    if (qualityMode === 'ultra') return Math.min(4.5, formatConfig.baseMultiplier * 1.3);
    return formatConfig.baseMultiplier;
  };

  const currentMultiplier = parseFloat(getMultiplier().toFixed(1));
  const estimatedW = Math.round(1600 * currentMultiplier);
  const estimatedH = Math.round(1131 * currentMultiplier);

  const cleanDeptName = departmentName
    ? departmentName.replace(/[^а-яА-Яa-zA-Z0-9]/g, '_')
    : 'Кафедра';

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    onExportStart?.();

    // Give React time to switch to clean non-editable render
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      if (exportScope === 'all' && pages.length > 1) {
        const originalPageIdx = activePageIndex;
        for (let i = 0; i < pages.length; i++) {
          setProgressStatus(
            `Подготовка листа ${i + 1} из ${pages.length}: «${pages[i].name}»...`
          );
          onSelectPage?.(i);
          await new Promise((resolve) => setTimeout(resolve, 350));

          const pageFileName = `Стенд_${cleanDeptName}_${pages[i].name.replace(
            /\s+/g,
            '_'
          )}_${selectedFormat}.png`;

          await exportStandToPng('department-stand-print-root', {
            format: selectedFormat,
            pixelRatio: currentMultiplier,
            fileName: pageFileName,
            onProgress: (status) =>
              setProgressStatus(`Лист ${i + 1}/${pages.length} (${pages[i].name}): ${status}`),
          });

          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        onSelectPage?.(originalPageIdx);
      } else {
        const curName = pages[activePageIndex] ? pages[activePageIndex].name : 'Лист_1';
        const fileName =
          pages.length > 1
            ? `Стенд_${cleanDeptName}_${curName.replace(/\s+/g, '_')}_${selectedFormat}.png`
            : `Стенд_${cleanDeptName}_${selectedFormat}.png`;

        await exportStandToPng('department-stand-print-root', {
          format: selectedFormat,
          pixelRatio: currentMultiplier,
          fileName,
          onProgress: (status) => setProgressStatus(status),
        });
      }

      setTimeout(() => {
        setIsExporting(false);
        onExportEnd?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Не удалось сгенерировать изображение');
      setIsExporting(false);
      onExportEnd?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bd1818] to-[#e02626] flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Экспорт стенда для печати</h3>
            <p className="text-xs text-slate-400">Формат бумаги, качество рендеринга и страницы</p>
          </div>
        </div>

        {/* Optional Multi-Page Selection (if > 1 page) */}
        {pages.length > 1 && (
          <div className="space-y-2 mb-5 p-3 rounded-xl bg-slate-800/70 border border-slate-700">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Выбор страниц для экспорта:</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setExportScope('current')}
                disabled={isExporting}
                className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  exportScope === 'current'
                    ? 'bg-[#bd1818]/30 border-rose-500 text-white ring-1 ring-rose-500'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-xs">
                  Текущий лист ({pages[activePageIndex]?.name || 'Лист 1'})
                </div>
                <div className="text-[10px] text-slate-400">Скачать 1 файл</div>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('all')}
                disabled={isExporting}
                className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  exportScope === 'all'
                    ? 'bg-[#bd1818]/30 border-rose-500 text-white ring-1 ring-rose-500'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-xs">Все листы ({pages.length} листа)</div>
                <div className="text-[10px] text-rose-300">Скачать по очереди</div>
              </button>
            </div>
          </div>
        )}

        {/* 1. Format Selection (A1, A2, A3, A4) */}
        <div className="space-y-2.5 mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Формат печати:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={isExporting}
                onClick={() => setSelectedFormat(f.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === f.id
                    ? 'bg-[#bd1818]/40 border-rose-500 text-white shadow-md ring-1 ring-rose-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{f.title}</span>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded">
                    {f.dimensionsMm}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{f.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Quality Presets */}
        <div className="space-y-2.5 mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Качество и плотность точек (DPI):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setQualityMode('standard')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                qualityMode === 'standard'
                  ? 'bg-[#bd1818]/40 border-rose-500 text-white shadow ring-1 ring-rose-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs">Стандартное</div>
              <div className="text-[10px] text-slate-400">150 DPI</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Быстрый экспорт</div>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setQualityMode('high')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                qualityMode === 'high'
                  ? 'bg-[#bd1818]/40 border-rose-500 text-white shadow ring-1 ring-rose-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs text-rose-200">Высокое (300 DPI)</div>
              <div className="text-[10px] text-slate-300">Типографское</div>
              <div className="text-[9px] text-rose-300 mt-0.5">Для плоттера/ватмана</div>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setQualityMode('ultra')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                qualityMode === 'ultra'
                  ? 'bg-[#bd1818]/40 border-rose-500 text-white shadow ring-1 ring-rose-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs">Ultra HD</div>
              <div className="text-[10px] text-slate-400">600 DPI</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Максимум четкости</div>
            </button>
          </div>

          {/* Dimension Summary Card */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <FileImage className="w-4 h-4 text-rose-400" />
              <span>Итоговое разрешение файла:</span>
            </div>
            <span className="font-mono font-bold text-rose-300">
              {estimatedW} × {estimatedH} px
            </span>
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress or action buttons */}
        {isExporting ? (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-xs font-semibold text-slate-200">{progressStatus}</span>
            <span className="text-[11px] text-slate-400 text-center">
              Рендеринг многослойного сверхчеткого PNG формата {selectedFormat}...
            </span>
          </div>
        ) : (
          <div className="flex gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleStartExport}
              className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#bd1818] via-[#9e1010] to-[#e02626] hover:from-[#d91e1e] hover:to-[#ef2828] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {exportScope === 'all' && pages.length > 1
                  ? `Скачать все листы (${pages.length})`
                  : `Скачать PNG (${selectedFormat})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
