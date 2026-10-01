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
  x?: number; // Custom X in free placement mode
  y?: number; // Custom Y in free placement mode
  pageId?: string;
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
  x?: number;
  y?: number;
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
  x?: number;
  y?: number;
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

export type PaperFormat = 'A1' | 'A2' | 'A3' | 'A4' | 'A0' | '16:9' | '4:3';

export interface StandConfig {
  paperFormat: PaperFormat;
  columnsCount: number; // 3, 4, 5, 6
  primaryColor: string; // Brand Red #BD1818 (ИЭУ)
  secondaryColor: string; // Crimson #9E1010
  darkColor: string; // Deep Wine #6E0808
  accentColor: string; // Vibrant Ruby #E02626
  showDotMatrices: boolean;
  showWaveRibbons: boolean;
  showCenterRibbons: boolean;
  patternIntensity: 'subtle' | 'normal' | 'vibrant';
  showCropMarks: boolean;
  isFreeDragMode: boolean;
  freeDragSnap: number;
  teacherCardHeight: 'compact' | 'normal' | 'large';
}

export interface StandPage {
  id: string;
  name: string;
  teachers: Teacher[];
  showHeadPerson: boolean;
  showSchedule: boolean;
  layout?: BlockLayout;
}

export interface StandData {
  header: HeaderInfo;
  headPerson: DepartmentHead;
  teachers: Teacher[];
  schedule: ScheduleInfo;
  config: StandConfig;
  layout: BlockLayout;
  pages: StandPage[];
  activePageIndex: number;
}
