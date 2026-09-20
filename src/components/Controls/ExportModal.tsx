import React, { useState } from 'react';
import { Download, X, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { exportStandToPng } from '../../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  departmentName,
  onExportStart,
  onExportEnd,
}) => {
  const [scaleFactor, setScaleFactor] = useState<number>(3);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultFileName = `Стенд_${departmentName.replace(/[^а-яА-Яa-zA-Z0-9]/g, '_')}_ватман_А1.png`;

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    onExportStart?.();

    // Give React time to switch to clean non-editable render
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      await exportStandToPng('department-stand-print-root', {
        pixelRatio: scaleFactor,
        fileName: defaultFileName,
        onProgress: (status) => setProgressStatus(status),
      });

      setTimeout(() => {
        setIsExporting(false);
        onExportEnd?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Не удалось сгенерировать изображение');
      setIsExporting(false);
      onExportEnd?.();
    }
  };

  const getEstimatedResolution = () => {
    const w = 1600 * scaleFactor;
    const h = 1131 * scaleFactor;
    return `${w} × ${h} пикселей`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7a0c22] to-[#c41e3a] flex items-center justify-center shadow">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Экспорт для печати на ватмане</h3>
            <p className="text-xs text-slate-400">Формат А1 (841 × 594 мм) в формате PNG</p>
          </div>
        </div>

        {/* Quality preset selection */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-semibold text-slate-300">
            Качество и разрешение печати:
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setScaleFactor(2)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scaleFactor === 2
                  ? 'bg-[#7a0c22]/50 border-rose-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs">2x (Стандарт)</div>
              <div className="text-[10px] text-slate-400">~3200×2260 px</div>
              <div className="text-[9px] text-rose-300 mt-1">Быстрый экспорт</div>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setScaleFactor(3)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scaleFactor === 3
                  ? 'bg-[#7a0c22]/50 border-rose-500 text-white shadow ring-1 ring-rose-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs text-rose-200">3x (Рекомендуем)</div>
              <div className="text-[10px] text-slate-400">~4800×3390 px</div>
              <div className="text-[9px] text-rose-300 mt-1">Для ватмана А1</div>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setScaleFactor(4)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scaleFactor === 4
                  ? 'bg-[#7a0c22]/50 border-rose-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs">4x (Ультра)</div>
              <div className="text-[10px] text-slate-400">~6400×4520 px</div>
              <div className="text-[9px] text-rose-300 mt-1">Плоттер 300 DPI</div>
            </button>
          </div>

          <div className="text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <span className="text-slate-400">Итоговое разрешение:</span>
            <span className="font-mono font-bold text-rose-300">{getEstimatedResolution()}</span>
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-900/30 border border-red-700/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress or status */}
        {isExporting ? (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-xs font-medium text-slate-200">{progressStatus}</span>
            <span className="text-[10px] text-slate-400">
              Пожалуйста, подождите. Для ватмана рендерится многослойный сверхчеткий PNG...
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleStartExport}
              className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7a0c22] via-[#9e1432] to-[#c41e3a] hover:from-[#92102b] hover:to-[#e11d48] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Сгенерировать и скачать</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
