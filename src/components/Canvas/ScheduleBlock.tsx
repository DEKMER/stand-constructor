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
    <div className="relative flex flex-col justify-between h-full min-h-0 bg-gradient-to-br from-[#7a0c22] via-[#8c102a] to-[#580517] text-white rounded-xl p-3 shadow-xl border-2 border-rose-300/40 overflow-hidden text-left">
      {/* TOP SECTION: Auditorium & Schedule */}
      <div className="space-y-2">
        {/* Auditorium Badge */}
        <div className="flex items-center gap-2 bg-white/20 hover:bg-white/25 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30 w-fit shadow-xs transition-colors">
          <MapPin className="w-3.5 h-3.5 text-rose-200 flex-shrink-0" />
          {isEditable ? (
            <input
              type="text"
              value={schedule.auditorium}
              onChange={(e) => onUpdate({ auditorium: e.target.value })}
              placeholder="Аудитория: 4-16В"
              className="bg-transparent text-white font-extrabold text-sm xl:text-base tracking-wider focus:outline-none border-b border-transparent focus:border-white w-40 leading-none"
            />
          ) : (
            <span className="font-extrabold text-sm xl:text-base tracking-wider leading-none">
              {schedule.auditorium}
            </span>
          )}
        </div>

        {/* Schedule Title */}
        <div className="flex items-center gap-1.5 text-rose-200 text-xs font-black uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
          <span>График работы кафедры</span>
        </div>

        {/* Hours Table with Exact Uniform Sizing for all 3 lines */}
        <div className="space-y-1.5 border-l-2 border-rose-400/80 pl-2.5 py-0.5 text-xs xl:text-sm">
          {/* Workdays */}
          <div className="flex items-center justify-between gap-2">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.workDaysTitle}
                  onChange={(e) => onUpdate({ workDaysTitle: e.target.value })}
                  placeholder="ПН - ЧТ"
                  className="bg-transparent text-rose-100 font-bold w-20 focus:outline-none text-xs xl:text-sm"
                />
                <input
                  type="text"
                  value={schedule.workDaysHours}
                  onChange={(e) => onUpdate({ workDaysHours: e.target.value })}
                  placeholder="8:15 - 17:00"
                  className="bg-transparent text-white font-black text-right w-28 focus:outline-none text-xs xl:text-sm"
                />
              </>
            ) : (
              <>
                <span className="text-rose-100 font-bold">{schedule.workDaysTitle}:</span>
                <span className="text-white font-black tracking-wide">{schedule.workDaysHours}</span>
              </>
            )}
          </div>

          {/* Friday */}
          <div className="flex items-center justify-between gap-2">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.fridayTitle}
                  onChange={(e) => onUpdate({ fridayTitle: e.target.value })}
                  placeholder="ПТ"
                  className="bg-transparent text-rose-100 font-bold w-20 focus:outline-none text-xs xl:text-sm"
                />
                <input
                  type="text"
                  value={schedule.fridayHours}
                  onChange={(e) => onUpdate({ fridayHours: e.target.value })}
                  placeholder="8:15 - 16:00"
                  className="bg-transparent text-white font-black text-right w-28 focus:outline-none text-xs xl:text-sm"
                />
              </>
            ) : (
              <>
                <span className="text-rose-100 font-bold">{schedule.fridayTitle}:</span>
                <span className="text-white font-black tracking-wide">{schedule.fridayHours}</span>
              </>
            )}
          </div>

          {/* Lunch Break - Exactly same size and weight */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={schedule.lunchTitle}
                  onChange={(e) => onUpdate({ lunchTitle: e.target.value })}
                  placeholder="Обед"
                  className="bg-transparent text-rose-100 font-bold w-20 focus:outline-none text-xs xl:text-sm"
                />
                <input
                  type="text"
                  value={schedule.lunchHours}
                  onChange={(e) => onUpdate({ lunchHours: e.target.value })}
                  placeholder="12:27 - 13:00"
                  className="bg-transparent text-white font-black text-right w-28 focus:outline-none text-xs xl:text-sm"
                />
              </>
            ) : (
              <>
                <span className="text-rose-100 font-bold">{schedule.lunchTitle}:</span>
                <span className="text-white font-black tracking-wide">{schedule.lunchHours}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Full-Width Phone & Email Contacts (Never truncated) */}
      <div className="pt-2 border-t border-white/20 space-y-1.5 text-xs xl:text-sm">
        {/* Phone */}
        <div className="flex items-center gap-2 text-rose-100">
          <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Phone className="w-3 h-3 text-rose-200" />
          </div>
          {isEditable ? (
            <input
              type="text"
              value={schedule.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="Телефон"
              className="bg-transparent text-white font-bold focus:outline-none w-full text-xs xl:text-sm"
            />
          ) : (
            <span className="text-white font-bold tracking-wide whitespace-nowrap">{schedule.phone}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-rose-100">
          <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Mail className="w-3 h-3 text-rose-200" />
          </div>
          {isEditable ? (
            <input
              type="text"
              value={schedule.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="Email"
              className="bg-transparent text-white font-semibold focus:outline-none w-full text-xs xl:text-sm"
            />
          ) : (
            <span className="text-white font-semibold text-xs xl:text-sm whitespace-nowrap">{schedule.email}</span>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Crisp QR Code with Label */}
      {schedule.showQr && (
        <div className="pt-2 border-t border-white/15 flex items-center justify-start gap-2.5">
          <div className="p-1 bg-white rounded-lg shadow-sm flex-shrink-0">
            <QRCodeSVG
              value={schedule.qrUrl || 'https://volsu.ru'}
              size={48}
              fgColor="#7a0c22"
              bgColor="#ffffff"
              level="M"
            />
          </div>

          <div className="flex-1 min-w-0">
            {isEditable ? (
              <input
                type="text"
                value={schedule.qrLabel}
                onChange={(e) => onUpdate({ qrLabel: e.target.value })}
                placeholder="Сайт кафедры"
                className="bg-transparent text-xs xl:text-sm font-black uppercase tracking-wider text-rose-100 focus:outline-none border-b border-transparent focus:border-white w-full"
              />
            ) : (
              <span className="text-xs xl:text-sm font-black uppercase tracking-wider text-rose-100 block">
                {schedule.qrLabel || 'Сайт кафедры'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
