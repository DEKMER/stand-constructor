export interface Teacher {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string;
  position: string;
  photoUrl: string;
  photoScale?: number;
  photoX?: number;
  photoY?: number;
}

export interface DepartmentHead {
  lastName: string;
  firstName: string;
  patronymic: string;
  role: string;
  degree: string;
  photoUrl: string;
  photoScale?: number;
  photoX?: number;
  photoY?: number;
  receptionHours?: string;
  email?: string;
  phone?: string;
}

export interface ScheduleInfo {
  auditorium: string;
  workDaysTitle: string;
  workDaysHours: string;
  fridayTitle: string;
  fridayHours: string;
  lunchTitle: string;
  lunchHours: string;
  phone: string;
  email: string;
  qrUrl: string;
  qrLabel: string;
  showQr: boolean;
}

export interface HeaderInfo {
  universityName: string;
  instituteName: string;
  departmentName: string;
  logoUrl: string;
  showLogo: boolean;
}

export interface BlockLayout {
  header: { x: number; y: number };
  headPerson: { x: number; y: number; width?: number };
  facultyGrid: { x: number; y: number; width?: number };
  schedule: { x: number; y: number; width?: number };
}

export type PaperFormat = 'A1' | 'A2' | 'A0' | '16:9' | '4:3';

export interface StandConfig {
  paperFormat: PaperFormat;
  columnsCount: number; // 3, 4, 5, 6
  primaryColor: string; // Burgundy #7A0C22
  secondaryColor: string; // Crimson #981432
  darkColor: string; // Deep Wine #4A0210
  accentColor: string; // Vibrant Ruby #C41E3A
  showDotMatrices: boolean;
  showWaveRibbons: boolean;
  showCropMarks: boolean;
  isFreeDragMode: boolean;
  teacherCardHeight: 'compact' | 'normal' | 'large';
}

export interface StandData {
  header: HeaderInfo;
  headPerson: DepartmentHead;
  teachers: Teacher[];
  schedule: ScheduleInfo;
  config: StandConfig;
  layout: BlockLayout;
}
