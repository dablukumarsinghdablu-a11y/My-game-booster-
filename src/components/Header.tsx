import React from 'react';
import { Zap, Volume2, VolumeX, Layers } from 'lucide-react';
import { playClickSound, setSoundEnabled, getSoundEnabled } from '../utils/soundEngine';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isBoostActive: boolean;
  onOpenOverlay: () => void;
  soundActive: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  isBoostActive,
  onOpenOverlay,
  soundActive,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            playClickSound();
            onSelectTab('dashboard');
          }}
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>ApexBoost</span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              playClickSound();
              onSelectTab('dashboard');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'dashboard' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('monitor');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'monitor' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Performance Monitor
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('library');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'library' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Game Library
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('network');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'network' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Network Diagnostic
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('tuner');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'tuner' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            AI Rig Tuner
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('sensitivity');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'sensitivity' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Sensitivity
          </button>
        </nav>

        {/* Zone 3: 1 primary action & tactical utilities */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onToggleSound();
            }}
            title={soundActive ? 'Mute Tactical SFX' : 'Enable Tactical SFX'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={() => {
              playClickSound();
              onOpenOverlay();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>HUD Overlay (Alt+Z)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
