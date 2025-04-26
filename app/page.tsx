"use client";

import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { Search, Gamepad2, ChevronRight } from 'lucide-react';

// Games data - can be expanded as more games are added
const games = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Play classic chess against another player or challenge the CPU.',
    image: '♟️',
    bgImage: '/images/chess-bg.jpg', // You'll need to add these images to the public folder
    color: 'from-amber-500 to-yellow-600',
    path: '/games/chess',
    disabled: false
  },
  {
    id: 'Tic Tac Toe',
    title: 'Tic Tac Toe',
    description: 'Play Tic Tac Toe against another player or challenge the CPU.',
    image: '❌',
    bgImage: '/images/coming-soon-bg.jpg',
    color: 'from-purple-500 to-indigo-600',
    path: '/games/tic-tac-toe', // No path yet
    disabled: false
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Test your memory by matching pairs of cards in this classic memory game.',
    image: '🔍',
    bgImage: '/images/coming-soon-bg.jpg',
    color: 'from-indigo-500 to-blue-600',
    path: '/games/memory',
    disabled: false
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter games based on search query
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1b1e] to-[#2d2e35] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-amber-500">Hub</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Your destination for online gaming. Choose a game below and start playing instantly, with more games coming soon!
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 bg-[#2c2e33] border-[#3a3d45]/50 text-white rounded-xl focus-visible:ring-[#ffd700]/30 focus-visible:border-[#ffd700]/50"
            />
          </div>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.path}
              className={`block ${game?.disabled ? 'pointer-events-none opacity-70' : ''}`}
            >
              <div className={`bg-gradient-to-r ${game.color} h-full rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden group`}>
                <div className="absolute inset-0 opacity-20 bg-black mix-blend-multiply z-0"></div>
                <div className="absolute right-2 bottom-2 text-6xl opacity-20 z-10">{game.image}</div>
                <div className="relative z-20">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{game.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{game.description}</p>
                    <div className="flex items-center">
                      <Button 
                        className="bg-white/20 hover:bg-white/30 text-white" 
                        size="sm"
                      >
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        Play Now
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl text-white mb-2">No games found</h3>
            <p className="text-gray-400">Try a different search term</p>
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline" 
              className="mt-4 border-[#ffd700]/40 text-[#ffd700] hover:bg-[#ffd700]/10"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}