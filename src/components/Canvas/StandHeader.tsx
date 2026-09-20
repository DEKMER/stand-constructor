import React, { useRef } from 'react';
import { HeaderInfo, StandConfig } from '../../types/stand';
import { Upload, Sparkles } from 'lucide-react';

interface StandHeaderProps {
  header: HeaderInfo;
  config: StandConfig;
  onUpdateHeader: (patch: Partial<HeaderInfo>) => void;
  isEditable?: boolean;
}

export const StandHeader: React.FC<StandHeaderProps> = ({
  header,
  config,
  onUpdateHeader,
  isEditable = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateHeader({ logoUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="relative z-10 w-full px-8 pt-3 pb-1">
      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center justify-between gap-6 backdrop-blur-md bg-gradient-to-r from-[#5a0416]/90 via-[#7a0c22]/90 to-[#8c102a]/85 rounded-xl px-5 py-2 border border-white/25 shadow-lg">
        {/* Left Side: Logo + University + Institute */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {header.showLogo && (
            <div
              onClick={() => isEditable && fileInputRef.current?.click()}
              className={`relative group flex-shrink-0 w-14 h-14 rounded-xl bg-white/15 p-1.5 border border-white/30 shadow-md flex items-center justify-center transition-all ${
                isEditable ? 'cursor-pointer hover:bg-white/25 hover:scale-105' : ''
              }`}
              title="Нажмите, чтобы загрузить логотип"
            >
              {header.logoUrl ? (
                <img
                  src={header.logoUrl}
                  alt="Логотип университета"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              ) : (
                <Sparkles className="w-8 h-8 text-white" />
              )}
              {isEditable && (
                <div className="no-print-export absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-medium transition-opacity">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Лого</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col text-left">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={header.universityName}
                  onChange={(e) => onUpdateHeader({ universityName: e.target.value })}
                  placeholder="Название университета"
                  className="bg-transparent text-white font-medium text-base xl:text-lg leading-tight tracking-wide border-b border-transparent hover:border-white/40 focus:border-white focus:outline-none transition-colors w-[460px]"
                />
                <input
                  type="text"
                  value={header.instituteName}
                  onChange={(e) => onUpdateHeader({ instituteName: e.target.value })}
                  placeholder="Институт / Факультет"
                  className="bg-transparent text-rose-200 font-bold text-lg xl:text-xl leading-tight tracking-wide border-b border-transparent hover:border-white/40 focus:border-white focus:outline-none transition-colors w-[460px] mt-0.5"
                />
              </>
            ) : (
              <>
                <span className="text-white font-medium text-base xl:text-lg leading-tight tracking-wide drop-shadow-sm">
                  {header.universityName}
                </span>
                <span className="text-rose-200 font-bold text-lg xl:text-xl leading-tight tracking-wide drop-shadow-sm mt-0.5">
                  {header.instituteName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center Vertical Divider */}
        <div className="h-14 w-[2.5px] bg-gradient-to-b from-white/10 via-white/80 to-white/10 rounded-full flex-shrink-0" />

        {/* Right Side: Department Name (Prominent Full Width Title) */}
        <div className="flex-1 min-w-0 text-left pl-4 flex flex-col justify-center">
          {isEditable ? (
            <input
              type="text"
              value={header.departmentName}
              onChange={(e) => onUpdateHeader({ departmentName: e.target.value.toUpperCase() })}
              placeholder="КАФЕДРА..."
              className="w-full bg-transparent font-surname font-black text-2xl xl:text-3xl 2xl:text-4xl text-white tracking-wider border-b-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none transition-all py-0.5 drop-shadow-md truncate"
              title="Нажмите, чтобы редактировать название кафедры"
            />
          ) : (
            <h1 className="font-surname font-black text-2xl xl:text-3xl 2xl:text-4xl text-white tracking-wider drop-shadow-md truncate">
              {header.departmentName}
            </h1>
          )}
          <div className="h-1 w-40 bg-gradient-to-r from-rose-400 via-rose-300 to-transparent rounded-full mt-0.5" />
        </div>
      </div>
    </header>
  );
};
