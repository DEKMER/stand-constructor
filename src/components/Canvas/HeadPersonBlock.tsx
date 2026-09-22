import React, { useRef, useState } from 'react';
import { DepartmentHead, StandConfig } from '../../types/stand';
import { Camera, ZoomIn, ZoomOut, Mail, Clock, Award, Crop } from 'lucide-react';
import { ImageCropModal } from '../Controls/ImageCropModal';

interface HeadPersonBlockProps {
  headPerson: DepartmentHead;
  config: StandConfig;
  onUpdate: (patch: Partial<DepartmentHead>) => void;
  isEditable?: boolean;
}

export const HeadPersonBlock: React.FC<HeadPersonBlockProps> = ({
  headPerson,
  onUpdate,
  isEditable = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Measure dynamic aspect ratio of head person slot on the canvas
  const getSlotAspectRatio = () => {
    if (photoContainerRef.current) {
      const rect = photoContainerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return rect.width / rect.height;
      }
    }
    return 0.65;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImageSrc(event.target.result as string);
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    onUpdate({
      photoUrl: croppedDataUrl,
      photoScale: 1,
      photoX: 0,
      photoY: 0,
    });
    setCropModalOpen(false);
    setTempImageSrc(null);
  };

  const handleOpenRecrop = () => {
    if (headPerson.photoUrl) {
      setTempImageSrc(headPerson.photoUrl);
      setCropModalOpen(true);
    }
  };

  const adjustScale = (delta: number) => {
    const current = headPerson.photoScale || 1;
    const next = Math.min(Math.max(current + delta, 0.7), 2.5);
    onUpdate({ photoScale: next });
  };

  return (
    <>
      <div className="relative flex flex-col h-full min-h-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-rose-300/80 overflow-hidden text-left p-2.5 justify-between">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Top ribbon badge */}
        <div className="flex-shrink-0 flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#7a0c22] to-[#c41e3a] text-white text-[10.5px] font-bold uppercase tracking-wider shadow-xs">
            <Award className="w-3 h-3" />
            {headPerson.role || 'Заведующий кафедрой'}
          </span>

          {isEditable && (
            <div className="no-print-export flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5 border border-slate-200">
              {headPerson.photoUrl && (
                <button
                  type="button"
                  onClick={handleOpenRecrop}
                  title="Кадрировать фото"
                  className="p-1 hover:text-rose-600 transition-colors text-slate-600"
                >
                  <Crop className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => adjustScale(0.1)}
                title="Увеличить фото"
                className="p-1 hover:text-rose-600 transition-colors text-slate-600"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => adjustScale(-0.1)}
                title="Уменьшить фото"
                className="p-1 hover:text-rose-600 transition-colors text-slate-600"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Main Large Portrait Frame (Dynamically Adaptive) */}
        <div
          id="head-person-photo-container"
          ref={photoContainerRef}
          className="relative group w-full flex-1 min-h-[120px] rounded-lg overflow-hidden bg-slate-100 border border-rose-200 shadow-inner flex items-center justify-center mb-1.5 select-none"
        >
          {headPerson.photoUrl ? (
            <img
              src={headPerson.photoUrl}
              alt={`${headPerson.lastName} ${headPerson.firstName}`}
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-200 pointer-events-none"
              style={{
                transform: `scale(${headPerson.photoScale || 1}) translate(${headPerson.photoX || 0}%, ${
                  headPerson.photoY || 0
                }%)`,
              }}
            />
          ) : (
            <div className="text-slate-400 font-medium text-xs">Фото заведующего кафедрой</div>
          )}

          {/* Change Photo Overlay */}
          {isEditable && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="no-print-export absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
            >
              <Camera className="w-6 h-6 mb-1 text-rose-200" />
              <span>Загрузить фото</span>
            </button>
          )}
        </div>

        {/* Typography */}
        <div className="flex-shrink-0 flex flex-col space-y-0.5">
          {/* Large Surname */}
          {isEditable ? (
            <input
              type="text"
              value={headPerson.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value.toUpperCase() })}
              placeholder="ФАМИЛИЯ"
              className="font-surname font-black text-2xl xl:text-3xl text-[#7a0c22] tracking-wider border-b border-transparent hover:border-rose-300 focus:border-rose-600 focus:outline-none transition-colors w-full leading-tight truncate bg-transparent"
            />
          ) : (
            <h2 className="font-surname font-black text-2xl xl:text-3xl text-[#7a0c22] tracking-wider leading-tight truncate">
              {headPerson.lastName}
            </h2>
          )}

          {/* First name & Patronymic in single contiguous field */}
          <div className="text-slate-900 font-bold text-sm xl:text-base leading-tight">
            {isEditable ? (
              <input
                type="text"
                value={
                  headPerson.firstName && headPerson.patronymic
                    ? `${headPerson.firstName} ${headPerson.patronymic}`
                    : headPerson.firstName || headPerson.patronymic || ''
                }
                onChange={(e) => {
                  const parts = e.target.value.trimStart().split(/\s+/);
                  onUpdate({
                    firstName: parts[0] || '',
                    patronymic: parts.slice(1).join(' '),
                  });
                }}
                placeholder="Имя Отчество"
                className="w-full border-b border-transparent hover:border-slate-300 focus:border-rose-600 focus:outline-none transition-colors truncate bg-transparent font-bold"
              />
            ) : (
              <div className="truncate font-bold">
                {headPerson.firstName} {headPerson.patronymic}
              </div>
            )}
          </div>

          {/* Horizontal Red Accent Underline */}
          <div className="h-[2.5px] w-14 bg-[#c41e3a] my-1 rounded-full" />

          {/* Degree and Academic Rank */}
          {isEditable ? (
            <textarea
              value={headPerson.degree}
              onChange={(e) => onUpdate({ degree: e.target.value })}
              placeholder="Ученая степень, звание"
              rows={2}
              className="text-[11px] font-bold uppercase tracking-wider text-[#9e1432] leading-tight border border-transparent hover:border-rose-300 focus:border-rose-600 focus:outline-none rounded p-0.5 transition-colors resize-none bg-transparent"
            />
          ) : (
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9e1432] leading-tight line-clamp-2">
              {headPerson.degree}
            </div>
          )}
        </div>

        {/* Bottom Info: Reception Hours & Contacts */}
        <div className="pt-2 border-t border-rose-100 mt-2 space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#c41e3a] flex-shrink-0" />
            {isEditable ? (
              <input
                type="text"
                value={headPerson.receptionHours || ''}
                onChange={(e) => onUpdate({ receptionHours: e.target.value })}
                placeholder="Приемные часы"
                className="w-full border-b border-transparent hover:border-slate-300 focus:border-rose-600 focus:outline-none text-[10.5px] bg-transparent"
              />
            ) : (
              <span className="text-[10.5px] font-medium truncate">{headPerson.receptionHours}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#c41e3a] flex-shrink-0" />
            {isEditable ? (
              <input
                type="text"
                value={headPerson.email || ''}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="Email"
                className="w-full border-b border-transparent hover:border-slate-300 focus:border-rose-600 focus:outline-none text-[10.5px] bg-transparent"
              />
            ) : (
              <span className="text-[10.5px] font-medium truncate">{headPerson.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Image Crop Modal dynamically sized to the Head Person slot */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={tempImageSrc}
        title={`Кадрирование фото: ${headPerson.lastName || 'Заведующий кафедрой'}`}
        initialAspectRatio={getSlotAspectRatio()}
        slotName="Главный портрет (Завкафедры)"
        onConfirm={handleCropConfirm}
        onCancel={() => {
          setCropModalOpen(false);
          setTempImageSrc(null);
        }}
      />
    </>
  );
};
