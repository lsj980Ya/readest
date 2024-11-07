import clsx from 'clsx';
import React from 'react';

import { useReaderStore } from '@/store/readerStore';
import { HighlightColor, HighlightStyle } from '@/types/book';
import { FaCheckCircle } from 'react-icons/fa';

const styles = ['highlight', 'underline', 'squiggly'] as HighlightStyle[];
const colors = ['red', 'violet', 'blue', 'green', 'yellow'] as HighlightColor[];

interface HighlightOptionsProps {
  style: React.CSSProperties;
  onHandleHighlight: (update: boolean) => void;
}

const HighlightOptions: React.FC<HighlightOptionsProps> = ({ style, onHandleHighlight }) => {
  const { settings, setSettings } = useReaderStore();
  const globalReadSettings = settings.globalReadSettings;

  const handleSelectStyle = (style: HighlightStyle) => {
    globalReadSettings.highlightStyle = style;
    setSettings(settings);
    onHandleHighlight(true);
  };
  const handleSelectColor = (color: HighlightColor) => {
    const style = globalReadSettings.highlightStyle;
    globalReadSettings.highlightStyles[style] = color;
    setSettings(settings);
    onHandleHighlight(true);
  };
  const selectedStyle = globalReadSettings.highlightStyle;
  const selectedColor = globalReadSettings.highlightStyles[selectedStyle];
  return (
    <div className='highlight-options absolute flex h-7 items-center justify-between' style={style}>
      <div className='flex h-7 gap-2'>
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => handleSelectStyle(style)}
            className={`flex h-7 min-h-7 w-7 items-center justify-center rounded-full bg-gray-700 p-0`}
          >
            <div
              className={clsx(
                'h-4 w-4 p-0 text-center leading-none',
                style === 'highlight' &&
                  (selectedStyle === 'highlight' ? `bg-${selectedColor}-400` : `bg-gray-300`),
                (style === 'underline' || style === 'squiggly') &&
                  'text-gray-300 underline decoration-2',
                style === 'underline' &&
                  (selectedStyle === 'underline'
                    ? `decoration-${selectedColor}-400`
                    : `decoration-gray-300`),
                style === 'squiggly' &&
                  (selectedStyle === 'squiggly'
                    ? `decoration-wavy decoration-${selectedColor}-400`
                    : `decoration-gray-300 decoration-wavy`),
              )}
            >
              A
            </div>
          </button>
        ))}
      </div>

      <div className='flex h-7 items-center justify-center gap-2 rounded-3xl bg-gray-700 px-2'>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleSelectColor(color)}
            className={clsx(
              `h-4 w-4 rounded-full p-0`,
              selectedColor !== color && `bg-${color}-400`,
            )}
          >
            {selectedColor === color && (
              <FaCheckCircle size={16} className={clsx(`fill-${color}-400`)} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HighlightOptions;