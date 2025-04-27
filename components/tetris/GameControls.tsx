'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onMoveDown: () => void;
  onHardDrop: () => void;
  onPauseToggle: () => void;
  onStart: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  isReady: boolean;
}

export function GameControls({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onMoveDown,
  onHardDrop,
  onPauseToggle,
  onStart,
  isPaused,
  isGameOver,
  isReady
}: GameControlsProps) {
  return (
    <div className="bg-indigo-900/40 backdrop-blur-sm p-4 rounded-xl border border-indigo-700/30 shadow-lg">
      <div className="text-center mb-4 text-white font-semibold text-sm sm:text-base">Game Controls</div>
      
      {/* Primary controls section */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {/* Direction controls */}
          <AnimatePresence>
            {!isReady && (
              <>
                <ControlButton 
                  label="Left"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                    </svg>
                  }
                  onClick={onMoveLeft}
                  disabled={isGameOver || isPaused || isReady}
                />
                
                <ControlButton 
                  label="Rotate"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                    </svg>
                  }
                  onClick={onRotate}
                  disabled={isGameOver || isPaused || isReady}
                  primary
                />
                
                <ControlButton 
                  label="Right"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  }
                  onClick={onMoveRight}
                  disabled={isGameOver || isPaused || isReady}
                />
                
                <div className="col-span-1"></div>
                
                <ControlButton 
                  label="Down"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  }
                  onClick={onMoveDown}
                  disabled={isGameOver || isPaused || isReady}
                />
                
                <div className="col-span-1"></div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {isReady ? (
          <ControlButton 
            label="Start"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            }
            onClick={onStart}
            primary
            className="col-span-2"
          />
        ) : (
          <>
            {/* Hard drop button */}
            <ControlButton 
              label="Drop"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              }
              onClick={onHardDrop}
              disabled={isGameOver || isPaused || isReady}
              primary
            />
            
            {/* Pause button */}
            <ControlButton 
              label={isPaused ? "Resume" : "Pause"}
              icon={
                isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                )
              }
              onClick={onPauseToggle}
              disabled={isGameOver || isReady}
            />
          </>
        )}
        
        {isGameOver && (
          <ControlButton 
            label="Restart"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
              </svg>
            }
            onClick={onStart}
            className="col-span-2"
            warning
          />
        )}
      </div>
      
      {/* Keyboard instructions */}
      <div className="mt-6 text-xs text-gray-300">
        <div className="text-center font-semibold mb-2">Keyboard Controls</div>
        <div className="grid grid-cols-2 gap-2">
          <div>← → ↓: Move</div>
          <div>↑: Rotate</div>
          <div>Space: Drop</div>
          <div>P: Pause</div>
        </div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  warning?: boolean;
  className?: string;
}

function ControlButton({ label, icon, onClick, disabled, primary, warning, className }: ControlButtonProps) {
  let buttonClass = `flex flex-col items-center justify-center gap-1 rounded-xl p-3 transition-colors ${className || ''}`;
  
  if (disabled) {
    buttonClass += " bg-gray-700/40 text-gray-400 cursor-not-allowed";
  } else if (primary) {
    buttonClass += " bg-indigo-500 hover:bg-indigo-600 text-white";
  } else if (warning) {
    buttonClass += " bg-red-500/80 hover:bg-red-600/80 text-white";
  } else {
    buttonClass += " bg-indigo-800/80 hover:bg-indigo-700/80 text-white";
  }
  
  return (
    <motion.button
      className={buttonClass}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      <div>{icon}</div>
      <div className="text-xs font-medium">{label}</div>
    </motion.button>
  );
} 