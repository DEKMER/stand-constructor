import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Crop, RefreshCw, Sparkles } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  initialAspectRatio?: number; // Dynamic ratio computed from the slot on canvas
  slotName?: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Кадрирование фотографии',
  initialAspectRatio = 3 / 4,
  slotName = 'Слот на стенде',
  onConfirm,
  onCancel,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(initialAspectRatio);
  const [aspectRatioLabel, setAspectRatioLabel] = useState<string>('slot');
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Load natural image dimensions and apply exact current slot ratio
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setAspectRatio(initialAspectRatio);
      setAspectRatioLabel('slot');

      const img = new Image();
      img.onload = () => {
        setNaturalSize({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc, initialAspectRatio]);

  // Compute fixed Crop Frame Dimensions in UI (height ~280px, width = 280 * aspectRatio)
  const maxBoxH = 280;
  let cropBoxH = maxBoxH;
  let cropBoxW = Math.round(cropBoxH * aspectRatio);

  if (cropBoxW > 380) {
    cropBoxW = 380;
    cropBoxH = Math.round(cropBoxW / aspectRatio);
  }

  // Base scale to cover the crop box completely at 100% zoom
  const isRotated90 = rotation === 90 || rotation === 270;
  const effectiveNatW = isRotated90 ? naturalSize.h : naturalSize.w;
  const effectiveNatH = isRotated90 ? naturalSize.w : naturalSize.h;

  const fitScale = Math.max(cropBoxW / effectiveNatW, cropBoxH / effectiveNatH);
  const displayBaseW = naturalSize.w * fitScale;
  const displayBaseH = naturalSize.h * fitScale;

  // Mouse Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...offset };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setOffset({
        x: initialOffsetRef.current.x + dx,
        y: initialOffsetRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialOffsetRef.current = { ...offset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setOffset({
      x: initialOffsetRef.current.x + dx,
      y: initialOffsetRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Mathematically exact canvas crop output matching the slot frame 1:1
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const targetW = 600;
    const targetH = Math.round(targetW / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Scale multiplier between crop frame preview and output canvas
    const multiplier = targetW / cropBoxW;

    ctx.save();
    ctx.translate(targetW / 2, targetH / 2);
    ctx.translate(offset.x * multiplier, offset.y * multiplier);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const renderW = displayBaseW * multiplier;
    const renderH = displayBaseH * multiplier;

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/png');
    onConfirm(croppedDataUrl);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7a0c22]/30 border border-[#7a0c22]/50 text-rose-300 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Рамка автоматически подогнана под точный размер слота на стенде
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Aspect Ratio Toolbar */}
        <div className="px-5 py-2.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Пропорции:</span>
          <div className="flex gap-1.5 overflow-x-auto py-0.5">
            {/* 1. Dynamic Exact Slot Ratio */}
            <button
              type="button"
              onClick={() => {
                setAspectRatio(initialAspectRatio);
                setAspectRatioLabel('slot');
                setOffset({ x: 0, y: 0 });
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                aspectRatioLabel === 'slot'
                  ? 'bg-gradient-to-r from-[#7a0c22] to-[#c41e3a] text-white shadow ring-1 ring-rose-400'
                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-rose-200" />
              <span>{slotName} (Авто)</span>
            </button>

            {/* Standard Presets */}
            {[
              { label: '3:4', ratio: 3 / 4, text: '3:4' },
              { label: '4:5', ratio: 4 / 5, text: '4:5' },
              { label: '1:1', ratio: 1, text: '1:1' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setAspectRatio(item.ratio);
                  setAspectRatioLabel(item.label);
                  setOffset({ x: 0, y: 0 });
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  aspectRatioLabel === item.label
                    ? 'bg-[#7a0c22] text-white shadow'
                    : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interactive Canvas Area with Transparency Checkerboard */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1e293b 25%, transparent 25%),
              linear-gradient(-45deg, #1e293b 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1e293b 75%),
              linear-gradient(-45deg, transparent 75%, #1e293b 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            backgroundColor: '#0f172a',
          }}
          className="relative w-full h-[360px] overflow-hidden flex items-center justify-center cursor-move"
        >
          {/* Active Image centered */}
          <div
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
            className="absolute pointer-events-none flex items-center justify-center"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Кадрируемое фото"
              draggable={false}
              className="max-w-none transition-transform pointer-events-none select-none"
              style={{
                width: `${displayBaseW}px`,
                height: `${displayBaseH}px`,
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Dark Overlay Mask with Cutout Frame matching the slot */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Cutout Frame */}
            <div
              style={{
                width: `${cropBoxW}px`,
                height: `${cropBoxH}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
              }}
              className="relative border-2 border-rose-400 rounded-lg"
            >
              {/* Rule of Thirds Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-white/50" />
                <div className="border-r border-white/50" />
                <div />
              </div>

              {/* Corner indicators */}
              <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-xs shadow" />
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-xs shadow" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-xs shadow" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-xs shadow" />
            </div>
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] text-slate-300 pointer-events-none flex items-center gap-1.5 border border-slate-700/50">
            <Move className="w-3 h-3 text-rose-400" />
            <span>Перетаскивайте фото мышью, колесико — зум</span>
          </div>
        </div>

        {/* Interactive Controls Bar (Zoom, Rotate, Reset) */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.8))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Уменьшить"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#7a0c22] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Увеличить"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Повернуть на 90 градусов"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{rotation}°</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Сбросить центрирование и масштаб"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#7a0c22] to-[#c41e3a] hover:from-[#92102b] hover:to-[#db2342] text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Применить кадрирование</span>
          </button>
        </div>
      </div>
    </div>
  );
};
