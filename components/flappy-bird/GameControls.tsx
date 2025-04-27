'use client';

import { motion } from 'framer-motion';

interface GameControlsProps {
  onJump: () => void;
  onPauseToggle: () => void;
  onReset: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  isReady: boolean;
}

export function GameControls({
  onJump,
  onPauseToggle,
  onReset,
  isPaused,
  isGameOver,
  isReady
}: GameControlsProps) {
  return (
    <div className="bg-blue-900/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/30 shadow-lg">
      <div className="text-center mb-4 text-white font-semibold text-sm sm:text-base">Game Controls</div>
      
      <div className="grid grid-cols-2 gap-3">
        <ControlButton 
          label="Jump"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z" clipRule="evenodd" />
            </svg>
          }
          onClick={onJump}
          isDisabled={false}
          primary
        />
        
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
          isDisabled={isReady || isGameOver}
        />
        
        <ControlButton 
          label="Reset"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
            </svg>
          }
          onClick={onReset}
          isDisabled={isReady}
          warning
        />
        
        <div className="col-span-2">
          <div className="text-xs text-gray-300 mt-3 text-center">
            Keyboard: Space to jump, P to pause, R to reset
          </div>
        </div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  primary?: boolean;
  warning?: boolean;
}

function ControlButton({ label, icon, onClick, isDisabled, primary, warning }: ControlButtonProps) {
  let buttonClass = "flex flex-col items-center justify-center gap-1 rounded-xl p-3 transition-colors";
  
  if (isDisabled) {
    buttonClass += " bg-gray-700/40 text-gray-400 cursor-not-allowed";
  } else if (primary) {
    buttonClass += " bg-blue-500 hover:bg-blue-600 text-white";
  } else if (warning) {
    buttonClass += " bg-red-500/80 hover:bg-red-600/80 text-white";
  } else {
    buttonClass += " bg-blue-800/80 hover:bg-blue-700/80 text-white";
  }
  
  return (
    <motion.button
      className={buttonClass}
      onClick={isDisabled ? undefined : onClick}
      whileTap={isDisabled ? undefined : { scale: 0.95 }}
    >
      <div>{icon}</div>
      <div className="text-xs font-medium">{label}</div>
    </motion.button>
  );
} 