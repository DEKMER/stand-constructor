import React from 'react';
import { ScheduleInfo, StandConfig } from '../../types/stand';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

interface ScheduleBlockProps {
  schedule: ScheduleInfo;
  config: StandConfig;
  onUpdate: (patch: Partial<ScheduleInfo>) => void;
  isEditable?: boolean;
}

export const ScheduleBlock: React.FC<ScheduleBlockProps> = ({
  schedule,
  onUpdate,
  isEditable = true,
}) => {
  return (
    <div className="relative flex flex-col justify-between h-full min-h-0 bg-gradient-to-br from-[#7a0c22] via-[#8c102a] to-[#5a0416] text-white rounded-xl p-2.5 shadow-lg border border-rose-400/30 overflow-hidden text-left">
      {/* Subtle background decorative shapes */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-rose-500/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-black/20 pointer-events-none" />

      <div>
        {/* Auditorium Badge */}
        <div className="flex items-center gap-1.5 mb-2 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20 w-fit">
          <MapPin className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
          {isEditable ? (
            <input
              type="text"
              value={schedule.auditorium}
              onChange={(e) => onUpdate({ auditorium: e.target.value })}
              placeholder="Аудитория: 4-16В"
              className="bg-transparent text-white font-bold text-xs tracking-wider focus:outline-none border-b border-transparent focus:border-white w-32"
            />
          ) : (
            <span className="font-bold text-xs tracking-wider">{schedule.auditorium}</span>
          )}
        </div>

        {/* Schedule Title */}
        <div className="flex items-center gap-1 text-rose-200 text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <Clock className="w-3 h-3 text-rose-300" />
          <span>График работы кафедры</span>
        </div>

        {/* Hours Table */}
        <div className="space-y-1 text-[11px] border-l-2 border-rose-400/60 pl-2.5 mb-2">
          {/* Workdays */}
          <div className="flex items-center justify-between gap-1">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.workDaysTitle}
                  onChange={(e) => onUpdate({ workDaysTitle: e.target.value })}
                  className="bg-transparent text-rose-100 font-semibold w-16 focus:outline-none text-[11px]"
                />
                <input
                  type="text"
                  value={schedule.workDaysHours}
                  onChange={(e) => onUpdate({ workDaysHours: e.target.value })}
                  className="bg-transparent text-white font-bold text-right w-24 focus:outline-none text-[11px]"
                />
              </>
            ) : (
              <>
                <span className="text-rose-100 font-medium">{schedule.workDaysTitle}:</span>
                <span className="text-white font-bold">{schedule.workDaysHours}</span>
              </>
            )}
          </div>

          {/* Friday */}
          <div className="flex items-center justify-between gap-1">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.fridayTitle}
                  onChange={(e) => onUpdate({ fridayTitle: e.target.value })}
                  className="bg-transparent text-rose-100 font-semibold w-16 focus:outline-none text-[11px]"
                />
                <input
                  type="text"
                  value={schedule.fridayHours}
                  onChange={(e) => onUpdate({ fridayHours: e.target.value })}
                  className="bg-transparent text-white font-bold text-right w-24 focus:outline-none text-[11px]"
                />
              </>
            ) : (
              <>
                <span className="text-rose-100 font-medium">{schedule.fridayTitle}:</span>
                <span className="text-white font-bold">{schedule.fridayHours}</span>
              </>
            )}
          </div>

          {/* Lunch */}
          <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-white/10 text-rose-200">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.lunchTitle}
                  onChange={(e) => onUpdate({ lunchTitle: e.target.value })}
                  className="bg-transparent text-rose-200 text-[10px] w-14 focus:outline-none"
                />
                <input
                  type="text"
                  value={schedule.lunchHours}
                  onChange={(e) => onUpdate({ lunchHours: e.target.value })}
                  className="bg-transparent text-rose-100 font-medium text-right text-[10px] w-24 focus:outline-none"
                />
              </>
            ) : (
              <>
                <span className="text-[10px]">{schedule.lunchTitle}:</span>
                <span className="text-[10px] font-medium">{schedule.lunchHours}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Contacts & QR Code */}
      <div className="pt-2 border-t border-white/20 flex items-end justify-between gap-2">
        {/* Contacts */}
        <div className="space-y-1 flex-1 text-[10.5px]">
          <div className="flex items-center gap-1.5 text-rose-100">
            <Phone className="w-3 h-3 text-rose-300 flex-shrink-0" />
            {isEditable ? (
              <input
                type="text"
                value={schedule.phone}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="Телефон"
                className="bg-transparent text-white font-semibold focus:outline-none w-full text-[10px]"
              />
            ) : (
              <span className="text-[10px] font-semibold truncate">{schedule.phone}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-rose-100">
            <Mail className="w-3 h-3 text-rose-300 flex-shrink-0" />
            {isEditable ? (
              <input
                type="text"
                value={schedule.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="Email"
                className="bg-transparent text-white font-medium focus:outline-none w-full text-[10px]"
              />
            ) : (
              <span className="text-[10px] truncate">{schedule.email}</span>
            )}
          </div>
        </div>

        {/* QR Code in Style with Corner Brackets */}
        {schedule.showQr && (
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative p-1.5 bg-white rounded-lg shadow border border-rose-300/40">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#c41e3a] rounded-tl-xs pointer-events-none" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#c41e3a] rounded-tr-xs pointer-events-none" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#c41e3a] rounded-bl-xs pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#c41e3a] rounded-br-xs pointer-events-none" />

              <QRCodeSVG
                value={schedule.qrUrl || 'https://volsu.ru'}
                size={44}
                fgColor="#7a0c22"
                bgColor="#ffffff"
                level="M"
              />
            </div>
            <span className="text-[8px] uppercase tracking-wider text-rose-200 mt-0.5 font-bold">
              {schedule.qrLabel || 'QR-код'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
