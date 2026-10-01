import { StandData, StandPage } from '../types/stand';
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

      // Color migration: if the user previously had the old #7a0c22 burgundy, migrate to exact IEM red #BD1818
      const loadedConfig = { ...initialStandData.config, ...parsed.config };
      if (
        !loadedConfig.primaryColor ||
        loadedConfig.primaryColor.toLowerCase() === '#7a0c22'
      ) {
        loadedConfig.primaryColor = '#BD1818';
        loadedConfig.secondaryColor = '#9E1010';
        loadedConfig.darkColor = '#6E0808';
        loadedConfig.accentColor = '#E02626';
      }

      // Ensure pages array is valid and backwards-compatible
      let pages: StandPage[] = parsed.pages;
      if (!pages || !Array.isArray(pages) || pages.length === 0) {
        pages = [
          {
            id: 'page-1',
            name: 'Лист 1',
            teachers: parsed.teachers || initialStandData.teachers,
            showHeadPerson: true,
            showSchedule: true,
            layout: parsed.layout || initialStandData.layout,
          },
        ];
      }

      const activePageIndex =
        typeof parsed.activePageIndex === 'number' &&
        parsed.activePageIndex >= 0 &&
        parsed.activePageIndex < pages.length
          ? parsed.activePageIndex
          : 0;

      return {
        ...initialStandData,
        ...parsed,
        header: { ...initialStandData.header, ...parsed.header },
        headPerson: { ...initialStandData.headPerson, ...parsed.headPerson },
        teachers: pages[activePageIndex]?.teachers || parsed.teachers || initialStandData.teachers,
        schedule: { ...initialStandData.schedule, ...parsed.schedule },
        config: loadedConfig,
        layout: { ...initialStandData.layout, ...parsed.layout },
        pages,
        activePageIndex,
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

        // Ensure pages exist on imported JSON
        if (!parsed.pages || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
          parsed.pages = [
            {
              id: 'page-1',
              name: 'Лист 1',
              teachers: parsed.teachers || initialStandData.teachers,
              showHeadPerson: true,
              showSchedule: true,
              layout: parsed.layout || initialStandData.layout,
            },
          ];
        }
        if (typeof parsed.activePageIndex !== 'number') {
          parsed.activePageIndex = 0;
        }

        resolve(parsed);
      } catch (err) {
        reject(new Error('Неверный формат JSON файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};
