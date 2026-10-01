import { StandData, Teacher } from '../types/stand';

// Default SVG university emblem matching classical academic architecture & torch with exact IEM brand red (#BD1818)
export const DEFAULT_UNIVERSITY_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <polygon points="50,4 94,24 82,88 50,98 18,88 6,24" fill="%23bd1818" stroke="%23ffffff" stroke-width="3"/>
  <path d="M50 14 L80 28 L72 80 L50 88 L28 80 L20 28 Z" fill="%23e02626" opacity="0.4"/>
  <rect x="36" y="42" width="6" height="26" fill="%23ffffff" rx="2"/>
  <rect x="47" y="38" width="6" height="30" fill="%23ffffff" rx="2"/>
  <rect x="58" y="42" width="6" height="26" fill="%23ffffff" rx="2"/>
  <polygon points="32,40 68,40 50,24" fill="%23ffffff"/>
  <rect x="30" y="68" width="40" height="5" fill="%23ffffff" rx="1"/>
  <circle cx="50" cy="80" r="3" fill="%23ffffff"/>
</svg>`;

// Default stylized placeholder portraits using IEM red palette
const createAvatarSvg = (gender: 'f' | 'm', initial: string, bgColor: string) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" fill="none">
    <rect width="200" height="240" fill="%23f8fafc"/>
    <circle cx="100" cy="88" r="46" fill="${bgColor}"/>
    <path d="M38 230 C38 165 65 148 100 148 C135 148 162 165 162 230 Z" fill="${bgColor}" opacity="0.88"/>
    <text x="100" y="98" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
};

const initialTeachersList: Teacher[] = [
  {
    id: 't-1',
    lastName: 'МОСЕЙКО',
    firstName: 'Виктор',
    patronymic: 'Олегович',
    position: 'профессор, д.э.н.',
    photoUrl: createAvatarSvg('m', 'ВО', '%23bd1818'),
    photoScale: 1,
  },
  {
    id: 't-2',
    lastName: 'МУШКЕТОВА',
    firstName: 'Наталья',
    patronymic: 'Сергеевна',
    position: 'профессор, д.э.н.',
    photoUrl: createAvatarSvg('f', 'НС', '%23cf1e1e'),
    photoScale: 1,
  },
  {
    id: 't-3',
    lastName: 'ОСТАПЕНКО',
    firstName: 'Варвара',
    patronymic: 'Владимировна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ВВ', '%239e1010'),
    photoScale: 1,
  },
  {
    id: 't-4',
    lastName: 'ВИТКАЛОВА',
    firstName: 'Елена',
    patronymic: 'Николаевна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ЕН', '%23bd1818'),
    photoScale: 1,
  },
  {
    id: 't-5',
    lastName: 'ИСАКОВ',
    firstName: 'Алексей',
    patronymic: 'Сергеевич',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('m', 'АС', '%239e1010'),
    photoScale: 1,
  },
  {
    id: 't-6',
    lastName: 'КОРНЕЕВА',
    firstName: 'Ирина',
    patronymic: 'Дмитриевна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ИД', '%23cf1e1e'),
    photoScale: 1,
  },
  {
    id: 't-7',
    lastName: 'МАРУСИНИНА',
    firstName: 'Елена',
    patronymic: 'Юрьевна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ЕЮ', '%23bd1818'),
    photoScale: 1,
  },
  {
    id: 't-8',
    lastName: 'МЫЗНИКОВА',
    firstName: 'Татьяна',
    patronymic: 'Ивановна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ТИ', '%239e1010'),
    photoScale: 1,
  },
  {
    id: 't-9',
    lastName: 'НЕСТЕРЕНКО',
    firstName: 'Анна',
    patronymic: 'Геннадьевна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'АГ', '%23cf1e1e'),
    photoScale: 1,
  },
  {
    id: 't-10',
    lastName: 'ОБЪЕДКОВА',
    firstName: 'Лариса',
    patronymic: 'Викторовна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ЛВ', '%23bd1818'),
    photoScale: 1,
  },
  {
    id: 't-11',
    lastName: 'ПШЕНИЧНАЯ',
    firstName: 'Светлана',
    patronymic: 'Юрьевна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'СЮ', '%239e1010'),
    photoScale: 1,
  },
  {
    id: 't-12',
    lastName: 'СЕРГЕЕВА',
    firstName: 'Ольга',
    patronymic: 'Федоровна',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('f', 'ОФ', '%23cf1e1e'),
    photoScale: 1,
  },
  {
    id: 't-13',
    lastName: 'БОНДАРЕНКО',
    firstName: 'Александр',
    patronymic: 'Станиславович',
    position: 'доцент, к.э.н.',
    photoUrl: createAvatarSvg('m', 'АС', '%23bd1818'),
    photoScale: 1,
  },
  {
    id: 't-14',
    lastName: 'ФЕДОРОВА',
    firstName: 'Светлана',
    patronymic: 'Владимировна',
    position: 'старший преподаватель',
    photoUrl: createAvatarSvg('f', 'СВ', '%239e1010'),
    photoScale: 1,
  },
  {
    id: 't-15',
    lastName: 'ЗНАМЕНЩИКОВА',
    firstName: 'Мария',
    patronymic: 'Михайловна',
    position: 'старший преподаватель',
    photoUrl: createAvatarSvg('f', 'ММ', '%23cf1e1e'),
    photoScale: 1,
  },
];

export const initialStandData: StandData = {
  header: {
    universityName: 'Волгоградский Государственный Университет',
    instituteName: 'Институт экономики и управления',
    departmentName: 'КАФЕДРА МЕНЕДЖМЕНТА И МАРКЕТИНГА',
    logoUrl: DEFAULT_UNIVERSITY_LOGO,
    showLogo: true,
  },
  headPerson: {
    lastName: 'ГУЩИНА',
    firstName: 'Елена',
    patronymic: 'Геннадьевна',
    role: 'Заведующий кафедрой',
    degree: 'доктор экономических наук, профессор',
    photoUrl: createAvatarSvg('f', 'ЕГ', '%23bd1818'),
    photoScale: 1,
    photoX: 0,
    photoY: 0,
    receptionHours: 'Приемные часы: ВТ 14:00 - 16:00',
    email: 'gushchina@volsu.ru',
    phone: '8 (8442) 40-55-14',
  },
  teachers: initialTeachersList,
  schedule: {
    auditorium: 'Аудитория: 4-16В',
    workDaysTitle: 'ПН - ЧТ',
    workDaysHours: '8:15 - 17:00',
    fridayTitle: 'ПТ',
    fridayHours: '8:15 - 16:00',
    lunchTitle: 'Обед',
    lunchHours: '12:27 - 13:00',
    phone: '8 (8442) 40-55-14',
    email: 'marketech@volsu.ru',
    qrUrl: 'https://volsu.ru',
    qrLabel: 'Сайт кафедры',
    showQr: true,
  },
  config: {
    paperFormat: 'A1',
    columnsCount: 0, // 0 = Auto layout
    primaryColor: '#BD1818', // IEM Brand Red 1-in-1
    secondaryColor: '#9E1010',
    darkColor: '#6E0808',
    accentColor: '#E02626',
    showDotMatrices: true,
    showWaveRibbons: true,
    showCenterRibbons: true,
    patternIntensity: 'vibrant',
    showCropMarks: false,
    isFreeDragMode: false,
    freeDragSnap: 10,
    teacherCardHeight: 'normal',
  },
  layout: {
    header: { x: 0, y: 0 },
    headPerson: { x: 0, y: 0 },
    facultyGrid: { x: 0, y: 0 },
    schedule: { x: 0, y: 0 },
  },
  pages: [
    {
      id: 'page-1',
      name: 'Лист 1',
      teachers: initialTeachersList,
      showHeadPerson: true,
      showSchedule: true,
      layout: {
        header: { x: 0, y: 0 },
        headPerson: { x: 0, y: 0 },
        facultyGrid: { x: 0, y: 0 },
        schedule: { x: 0, y: 0 },
      },
    },
  ],
  activePageIndex: 0,
};
