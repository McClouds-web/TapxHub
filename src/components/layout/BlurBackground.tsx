import React from 'react';

export const BlurBackground: React.FC = () => {
  return (
    <div className="blur-bg">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[120px] animate-breathe" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-100/20 blur-[100px] animate-breathe" style={{ animationDelay: '-1.5s' }} />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-slate-100/40 blur-[80px] animate-breathe" style={{ animationDelay: '-2s' }} />
    </div>
  );
};
