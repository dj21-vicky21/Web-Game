import { FlappyBirdGame } from '@/components/flappy-bird/FlappyBirdGame';
import Link from 'next/link';

export default function FlappyBirdPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
        <div className="absolute h-96 w-96 rounded-full bg-yellow-500/10 -top-20 -left-20 blur-3xl"></div>
        <div className="absolute h-96 w-96 rounded-full bg-blue-500/10 bottom-0 right-0 blur-3xl"></div>
        
        {/* Cloud pattern */}
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 8px, transparent 8px)',
            backgroundSize: '80px 80px'
          }}
        ></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header with home link */}
        <div className="flex justify-between items-center mb-6 px-2">
          <Link 
            href="/"
            className="flex items-center text-gray-300 hover:text-white transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
            <span>Home</span>
          </Link>
          
          <div className="text-sm text-gray-400">Tap/Click or Press Space to Jump</div>
        </div>
        
        {/* Game title */}
        <h1 className="text-5xl font-bold text-center mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500">Flappy Bird</span>
        </h1>
        
        {/* Game component */}
        <FlappyBirdGame />
      </div>
    </div>
  );
} 