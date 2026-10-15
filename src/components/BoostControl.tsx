import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  CheckCircle, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi,
  Sparkles
} from 'lucide-react';
import { playBoostSound, playClickSound, playSuccessChime } from '../utils/soundEngine';

interface Props {
  isBoostActive: boolean;
  onActivateBoost: () => void;
  onDeactivateBoost: () => void;
  reclaimedRAM: number; // in GB
  suspendedProcesses: number;
}

export const BoostControl: React.FC<Props> = ({
  isBoostActive,
  onActivateBoost,
  onDeactivateBoost,
  reclaimedRAM,
  suspendedProcesses,
}) => {
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostStep, setBoostStep] = useState<string>('');
  const [boostProgress, setBoostProgress] = useState<number>(0);

  const startBoostSequence = () => {
    playBoostSound();
    setIsBoosting(true);
    setBoostProgress(5);
    setBoostStep('Inspecting running process tree...');

    const steps = [
      { progress: 25, label: 'Purging Windows standby memory & trimming inactive heap cache...' },
      { progress: 50, label: 'Suspending 40+ non-gaming background daemons & update services...' },
      { progress: 75, label: 'Enforcing High-Priority CPU core affinity & DirectStorage I/O pipeline...' },
      { progress: 92, label: 'Flushing Direct3D shader stutters & setting 0.5ms high-precision timer...' },
      { progress: 100, label: 'Turbo Gaming Profile engaged! Max clock frequency locked.' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setBoostProgress(steps[current].progress);
        setBoostStep(steps[current].label);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBoosting(false);
          playSuccessChime();
          onActivateBoost();
        }, 400);
      }
    }, 380);
  };

  const handleRevert = () => {
    playClickSound();
    onDeactivateBoost();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 p-6 md:p-8">
      {/* Background ambient lighting */}
      <div 
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isBoostActive 
            ? 'bg-emerald-500/15' 
            : 'bg-cyan-500/10'
        }`} 
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left side details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              Apex Core Optimization Engine
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">
              Direct Hardware Level Tuning
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isBoostActive ? (
              <span className="text-emerald-400 flex items-center gap-3">
                Turbo Game Boost Engaged
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  ACTIVE
                </span>
              </span>
            ) : (
              'Maximum Gaming Rig Performance'
            )}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {isBoostActive
              ? `System is running in ultra-low-latency esports configuration. Standby list cache purged (${reclaimedRAM.toFixed(1)} GB freed), non-gaming threads suspended (${suspendedProcesses} daemons), and 0.5ms high-precision system timer locked.`
              : 'One-click automated boost frees system RAM, eliminates micro-stutters, locks CPU clock states, and allocates maximum Direct3D execution priority to your active game.'}
          </p>

          {/* Key optimization perks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Core Parking Disabled</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standby Cache Trimmed</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Wifi className="w-4 h-4 text-purple-400 shrink-0" />
              <span>TCP NoDelay QoS</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Anti-Cheat Safe</span>
            </div>
          </div>
        </div>

        {/* Right side primary CTA & Stats */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 shrink-0">
          {!isBoostActive ? (
            <button
              onClick={startBoostSequence}
              disabled={isBoosting}
              className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>{isBoosting ? 'BOOSTING SYSTEM...' : 'BOOST SYSTEM NOW'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>+22% Avg FPS Boost Active</span>
              </div>
              <button
                onClick={handleRevert}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
                title="Revert back to standard Windows balanced profile"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revert to Balanced</span>
              </button>
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="text-xs text-slate-400 font-mono flex items-center justify-center lg:justify-end gap-3">
            <span>Reclaimed: <strong className="text-emerald-400">{reclaimedRAM.toFixed(1)} GB</strong></span>
            <span>·</span>
            <span>Silenced: <strong className="text-cyan-400">{suspendedProcesses} Daemons</strong></span>
          </div>
        </div>
      </div>

      {/* Progress Animation during Boost Sequence */}
      {isBoosting && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              {boostStep}
            </span>
            <span className="text-white font-bold">{boostProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${boostProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
