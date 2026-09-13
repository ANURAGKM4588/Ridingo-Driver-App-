import React from 'react';

interface MobileControlCenterStatusBarProps {
  theme?: 'light' | 'dark';
}

export const MobileControlCenterStatusBar: React.FC<MobileControlCenterStatusBarProps> = ({
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full h-10 shrink-0 px-4.5 sticky top-0 z-50 font-sans select-none pointer-events-none ${
        isDark ? 'bg-[#0A0E17]' : 'bg-white'
      }`}
      aria-hidden="true"
    />
  );
};

