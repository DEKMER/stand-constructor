import { StandData } from '../types/stand';
import { initialStandData } from '../data/initialStandData';

const STORAGE_KEY = 'volsu_department_stand_data_v1';

export const saveStandToStorage = (data: StandData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Не удалось сохранить данные в LocalStorage:', e);
  }
};

export const loadStandFromStorage = (): StandData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with initial data to ensure all keys exist
      return {
        ...initialStandData,
        ...parsed,
        header: { ...initialStandData.header, ...parsed.header },
        headPerson: { ...initialStandData.headPerson, ...parsed.headPerson },
        schedule: { ...initialStandData.schedule, ...parsed.schedule },
        config: { ...initialStandData.config, ...parsed.config },
        layout: { ...initialStandData.layout, ...parsed.layout },
      };
    }
  } catch (e) {
    console.warn('Ошибка чтения из LocalStorage:', e);
  }
  return initialStandData;
};

export const exportProjectToJson = (data: StandData): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `Проект_стенда_${data.header.departmentName.replace(/\s+/g, '_')}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importProjectFromJson = (file: File): Promise<StandData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as StandData;
        resolve(parsed);
      } catch (err) {
        reject(new Error('Неверный формат JSON файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};
