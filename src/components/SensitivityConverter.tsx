import React, { useState } from 'react';
import { MousePointer, ArrowRightLeft, Target, Shield, Check } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEngine';

// Conversion yaw multipliers
const YAW_FACTORS: Record<string, number> = {
  cs2: 0.022,
  valorant: 0.07,
  apex: 0.022,
  overwatch: 0.0066,
  fortnite: 0.005555,
  warzone: 0.0066,
};

const GAME_NAMES: Record<string, string> = {
  cs2: 'Counter-Strike 2 / Source',
  valorant: 'Valorant',
  apex: 'Apex Legends',
  overwatch: 'Overwatch 2',
  fortnite: 'Fortnite',
  warzone: 'Call of Duty: Warzone',
};

export const SensitivityConverter: React.FC = () => {
  const [sourceGame, setSourceGame] = useState<string>('cs2');
  const [targetGame, setTargetGame] = useState<string>('valorant');
  const [sensitivity, setSensitivity] = useState<number>(1.8);
  const [dpi, setDpi] = useState<number>(800);

  const calculateTargetSens = () => {
    const sourceYaw = YAW_FACTORS[sourceGame] || 0.022;
    const targetYaw = YAW_FACTORS[targetGame] || 0.07;
    const degreesPerDot = sensitivity * sourceYaw;
    const targetSens = degreesPerDot / targetYaw;
    return targetSens.toFixed(3);
  };

  const calculateCm360 = () => {
    const sourceYaw = YAW_FACTORS[sourceGame] || 0.022;
    const degreesPerCount = sensitivity * sourceYaw;
    const countsPer360 = 360 / degreesPerCount;
    const inches360 = countsPer360 / dpi;
    const cm360 = inches360 * 2.54;
    return cm360.toFixed(1);
  };

  const calculateEdpi = () => {
    return Math.round(sensitivity * dpi);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MousePointer className="w-5 h-5 text-emerald-400" />
          Pro Mouse Sensitivity & 1:1 eDPI Converter
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Preserve perfect muscle memory across competitive shooter engines with exact cm/360° matching.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="text-slate-300 font-semibold block mb-1.5">Source Game</label>
          <select
            value={sourceGame}
            onChange={(e) => {
              playClickSound();
              setSourceGame(e.target.value);
            }}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
          >
            {Object.entries(GAME_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1.5">Current In-Game Sens</label>
          <input
            type="number"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
          />
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1.5">Mouse Hardware DPI</label>
          <select
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
          >
            <option value={400}>400 DPI</option>
            <option value={800}>800 DPI (Standard)</option>
            <option value={1200}>1200 DPI</option>
            <option value={1600}>1600 DPI (Low Input Lag)</option>
            <option value={3200}>3200 DPI</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1.5">Convert To Game</label>
          <select
            value={targetGame}
            onChange={(e) => {
              playClickSound();
              setTargetGame(e.target.value);
            }}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
          >
            {Object.entries(GAME_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Output Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono block">MATCHED SENSITIVITY</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums my-1">
            {calculateTargetSens()}
          </div>
          <span className="text-xs text-slate-400">
            For {GAME_NAMES[targetGame]}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono block">PHYSICAL DISTANCE (360°)</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums my-1">
            {calculateCm360()} <span className="text-base text-slate-400 font-normal">cm</span>
          </div>
          <span className="text-xs text-slate-400">
            Mousepad space required for full turn
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono block">EFFECTIVE DPI (eDPI)</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums my-1">
            {calculateEdpi()}
          </div>
          <span className="text-xs text-slate-400">
            Hardware DPI × In-Game Sensitivity
          </span>
        </div>
      </div>
    </div>
  );
};
