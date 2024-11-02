import React from 'react';
import clsx from 'clsx';
import { RiArrowLeftWideLine, RiArrowRightWideLine } from 'react-icons/ri';

import { useReaderStore } from '@/store/readerStore';

interface FooterBarProps {
  bookKey: string;
  progress: number | undefined;
  isHoveredAnim: boolean;
}

const FooterBar: React.FC<FooterBarProps> = ({ bookKey, progress, isHoveredAnim }) => {
  const { isSideBarVisible, hoveredBookKey, setHoveredBookKey, getFoliateView } = useReaderStore();

  const handleProgressChange = (event: React.ChangeEvent) => {
    const newProgress = parseInt((event.target as HTMLInputElement).value, 10);
    const foliateView = getFoliateView(bookKey);
    foliateView?.goToFraction(newProgress / 100.0);
  };

  const handleGoPrev = () => {
    const foliateView = getFoliateView(bookKey);
    foliateView?.goLeft();
  };

  const handleGoNext = () => {
    const foliateView = getFoliateView(bookKey);
    foliateView?.goRight();
  };

  return (
    <div
      className={clsx(
        'footer-bar absolute bottom-0 z-10 flex h-12 w-full items-center px-4',
        'shadow-xs bg-base-100 rounded-window-bottom-right transition-opacity duration-300',
        !isSideBarVisible && 'rounded-window-bottom-left',
        isHoveredAnim && 'hover-bar-anim',
        hoveredBookKey === bookKey ? `opacity-100` : `opacity-0`,
      )}
      onMouseEnter={() => setHoveredBookKey(bookKey)}
      onMouseLeave={() => setHoveredBookKey('')}
    >
      <button className='btn btn-ghost mx-2 h-8 min-h-8 w-8 p-0' onClick={handleGoPrev}>
        <RiArrowLeftWideLine size={20} />
      </button>
      <span className='mx-2 text-center text-sm text-black'>
        {progress ? `${Math.round(progress * 100)}%` : ''}
      </span>
      <input
        type='range'
        className='mx-2 w-full'
        min={0}
        max={100}
        value={progress ? progress * 100 : 0}
        onChange={(e) => handleProgressChange(e)}
      />
      <button className='btn btn-ghost mx-2 h-8 min-h-8 w-8 p-0' onClick={handleGoNext}>
        <RiArrowRightWideLine size={20} />
      </button>
    </div>
  );
};

export default FooterBar;