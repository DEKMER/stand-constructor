import React, { useState, useRef, useEffect } from 'react';
import { Move, Lock, Unlock, RotateCcw } from 'lucide-react';

interface MovableWrapperProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onReset?: () => void;
  isFreeDragMode: boolean;
  children: React.ReactNode;
  className?: string;
  snapGrid?: number;
  zoom?: number;
}

export const MovableWrapper: React.FC<MovableWrapperProps> = ({
  title,
  position,
  onPositionChange,
  onReset,
  isFreeDragMode,
  children,
  className = '',
  snapGrid = 10,
  zoom = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Use refs to avoid stale closures during event listeners
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFreeDragMode || isLocked) return;

    // Only initiate drag if clicking the drag handle or header bar
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) return;

    e.preventDefault();
    setIsDragging(true);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const currentZoom = zoomRef.current || 1;
      const deltaX = (e.clientX - dragStartRef.current.mouseX) / currentZoom;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) / currentZoom;

      let newX = dragStartRef.current.startX + deltaX;
      let newY = dragStartRef.current.startY + deltaY;

      if (snapGrid > 0) {
        newX = Math.round(newX / snapGrid) * snapGrid;
        newY = Math.round(newY / snapGrid) * snapGrid;
      }

      onPositionChangeRef.current({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, snapGrid]);

  if (!isFreeDragMode) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: isDragging ? 50 : 10,
      }}
      className={`relative transition-shadow duration-100 ${
        isDragging ? 'shadow-2xl ring-2 ring-amber-400 cursor-grabbing' : ''
      } ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* Movable Header Control Bar (Only shown in Free Drag Mode) */}
      <div className="absolute -top-8 left-0 right-0 z-30 flex items-center justify-between bg-slate-900/95 text-white px-2.5 py-1 rounded-t-lg text-xs font-semibold shadow-lg select-none border border-amber-500/40">
        <div className="drag-handle flex items-center gap-2 cursor-grab active:cursor-grabbing text-amber-300 hover:text-amber-200">
          <Move className="w-3.5 h-3.5 animate-pulse" />
          <span>{title}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            [X: {position.x}, Y: {position.y}]
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onReset && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              title="Сбросить в исходную позицию"
              className="p-1 hover:text-rose-300 text-slate-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLocked(!isLocked);
            }}
            title={isLocked ? 'Разблокировать перемещение' : 'Зафиксировать на месте'}
            className="p-1 hover:text-amber-300 transition-colors"
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};
