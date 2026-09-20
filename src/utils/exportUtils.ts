import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export interface ExportOptions {
  pixelRatio?: number;
  fileName?: string;
  onProgress?: (status: string) => void;
}

export const exportStandToPng = async (
  elementId: string = 'department-stand-print-root',
  options: ExportOptions = {}
): Promise<void> => {
  const { pixelRatio = 3, fileName = 'Стенд_кафедры_ватман_А1.png', onProgress } = options;

  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Элемент с id "${elementId}" не найден.`);
  }

  onProgress?.('Подготовка холста к печати...');

  try {
    // Ensure all web fonts are loaded
    await document.fonts?.ready;

    onProgress?.(`Генерация изображения высокого разрешения (${pixelRatio}x)...`);

    const filterFunc = (domNode: HTMLElement) => {
      if (domNode.nodeType === 1) {
        const tagName = domNode.tagName ? domNode.tagName.toUpperCase() : '';
        if (tagName === 'BUTTON') return false;
        if (tagName === 'INPUT' && (domNode as HTMLInputElement).type === 'file') return false;

        if (domNode.classList) {
          if (
            domNode.classList.contains('drag-handle') ||
            domNode.classList.contains('no-print-export') ||
            domNode.getAttribute('role') === 'button'
          ) {
            return false;
          }
        }
      }
      return true;
    };

    node.classList.add('exporting-print-canvas');

    let dataUrl: string;
    try {
      dataUrl = await toPng(node, {
        pixelRatio: pixelRatio,
        cacheBust: true,
        skipFonts: true, // Prevents CORS errors on external Google Fonts stylesheets
        quality: 0.98,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0',
        },
        filter: filterFunc,
      });
    } catch (innerErr) {
      console.warn('Попытка рендеринга со стандартными параметрами...', innerErr);
      dataUrl = await toPng(node, {
        pixelRatio: Math.min(pixelRatio, 2),
        cacheBust: false,
        skipFonts: true,
        filter: filterFunc,
      });
    } finally {
      node.classList.remove('exporting-print-canvas');
    }

    onProgress?.('Создание файла для скачивания...');

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress?.('Готово!');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7a0c22', '#c41e3a', '#ffffff', '#e11d48'],
    });
  } catch (error) {
    console.error('Ошибка экспорта в PNG:', error);
    throw error;
  }
};
