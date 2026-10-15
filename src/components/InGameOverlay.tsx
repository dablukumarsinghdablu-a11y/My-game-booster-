import React, { useState } from 'react';
import { 
  Crosshair, 
  Layers, 
  Eye, 
  Clock, 
  VolumeX, 
  Volume2, 
  Sliders, 
  X, 
  Maximize, 
  Check, 
  Sparkles,
  Zap,
  Monitor
} from 'lucide-react';
import { CrosshairConfig, SystemMetrics } from '../types';
import { playClickSound } from '../utils/soundEngine';

interface Props {
  metrics: SystemMetrics;
  isOpen: boolean;
  onClose: () => void;
  activeGameTitle?: string;
}

export const InGameOverlay: React.FC<Props> = ({
  metrics,
  isOpen,
  onClose,
  activeGameTitle = 'Counter-Strike 2',
}) => {
  const [crosshair, setCrosshair] = useState<CrosshairConfig>({
    style: 'cross',
    color: '#10b981', // emerald
    size: 14,
    thickness: 2,
    gap: 4,
    hasDot: true,
    opacity: 0.95,
  });

  const [overlayPosition, setOverlayPosition] = useState<'top-left' | 'top-right' | 'bottom-left'>('top-left');
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(true);
  const [isCrosshairEnabled, setIsCrosshairEnabled] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(1420); // 23 mins

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-6 overflow-y-auto animate-fade-in">
      {/* Top Bar of Overlay */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Apex In-Game Tactical HUD Overlay
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                ACTIVE IN: {activeGameTitle}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Low overhead DirectDraw rasterizer. Toggle anytime using{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                Alt + Z
              </kbd>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Interactive Stage: Simulated Game Viewport with Live HUD & Crosshair */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* The Viewport */}
        <div className="lg:col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center shadow-2xl">
          {/* Simulated Game Backdrop */}
          <img
            src="/src/assets/images/game_tactical_fps_1792052156350.jpg"
            alt="Game backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.7]"
          />

          {/* Floating HUD Telemetry Widget inside Game */}
          <div
            className={`absolute z-20 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono shadow-2xl ${
              overlayPosition === 'top-left'
                ? 'top-4 left-4'
                : overlayPosition === 'top-right'
                ? 'top-4 right-4'
                : 'bottom-4 left-4'
            }`}
          >
            <div className="flex items-center gap-4 text-white">
              <div>
                <span className="text-[10px] text-slate-400 block">FPS</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {Math.round(metrics.fps)}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block">1% LOW</span>
                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                  {Math.round(metrics.fpsOnePercentLow)}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block">CPU</span>
                <span className="text-sm font-semibold text-cyan-400 tabular-nums">
                  {Math.round(metrics.cpuUsagePercent)}%
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block">RAM</span>
                <span className="text-sm font-semibold text-purple-400 tabular-nums">
                  {metrics.ramUsedGB.toFixed(1)}G
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block">PING</span>
                <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                  {Math.round(metrics.pingMs)}ms
                </span>
              </div>
            </div>
          </div>

          {/* Precision Crosshair Render in Viewport Center */}
          {isCrosshairEnabled && (
            <div className="absolute z-20 pointer-events-none flex items-center justify-center">
              {crosshair.style === 'cross' && (
                <div className="relative flex items-center justify-center">
                  {/* Top */}
                  <div
                    style={{
                      height: `${crosshair.size}px`,
                      width: `${crosshair.thickness}px`,
                      backgroundColor: crosshair.color,
                      opacity: crosshair.opacity,
                      marginBottom: `${crosshair.gap * 2 + crosshair.size}px`,
                    }}
                    className="absolute shadow-sm"
                  />
                  {/* Bottom */}
                  <div
                    style={{
                      height: `${crosshair.size}px`,
                      width: `${crosshair.thickness}px`,
                      backgroundColor: crosshair.color,
                      opacity: crosshair.opacity,
                      marginTop: `${crosshair.gap * 2 + crosshair.size}px`,
                    }}
                    className="absolute shadow-sm"
                  />
                  {/* Left */}
                  <div
                    style={{
                      width: `${crosshair.size}px`,
                      height: `${crosshair.thickness}px`,
                      backgroundColor: crosshair.color,
                      opacity: crosshair.opacity,
                      marginRight: `${crosshair.gap * 2 + crosshair.size}px`,
                    }}
                    className="absolute shadow-sm"
                  />
                  {/* Right */}
                  <div
                    style={{
                      width: `${crosshair.size}px`,
                      height: `${crosshair.thickness}px`,
                      backgroundColor: crosshair.color,
                      opacity: crosshair.opacity,
                      marginLeft: `${crosshair.gap * 2 + crosshair.size}px`,
                    }}
                    className="absolute shadow-sm"
                  />
                  {/* Center Dot */}
                  {crosshair.hasDot && (
                    <div
                      style={{
                        width: `${crosshair.thickness * 1.5}px`,
                        height: `${crosshair.thickness * 1.5}px`,
                        backgroundColor: crosshair.color,
                        opacity: crosshair.opacity,
                      }}
                      className="rounded-full shadow-sm"
                    />
                  )}
                </div>
              )}

              {crosshair.style === 'dot' && (
                <div
                  style={{
                    width: `${crosshair.size}px`,
                    height: `${crosshair.size}px`,
                    backgroundColor: crosshair.color,
                    opacity: crosshair.opacity,
                  }}
                  className="rounded-full shadow-md"
                />
              )}

              {crosshair.style === 'circle' && (
                <div
                  style={{
                    width: `${crosshair.size * 2}px`,
                    height: `${crosshair.size * 2}px`,
                    borderColor: crosshair.color,
                    borderWidth: `${crosshair.thickness}px`,
                    opacity: crosshair.opacity,
                  }}
                  className="rounded-full border shadow-md flex items-center justify-center"
                >
                  {crosshair.hasDot && (
                    <div
                      style={{
                        width: `${crosshair.thickness * 1.5}px`,
                        height: `${crosshair.thickness * 1.5}px`,
                        backgroundColor: crosshair.color,
                      }}
                      className="rounded-full"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick HUD Position Selector Overlay on Viewport */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10 text-[11px] text-slate-300 font-mono">
            <span>HUD:</span>
            {(['top-left', 'top-right', 'bottom-left'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setOverlayPosition(pos)}
                className={`px-2 py-0.5 rounded capitalize ${
                  overlayPosition === pos ? 'bg-emerald-500 text-black font-bold' : 'hover:text-white'
                }`}
              >
                {pos.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Crosshair & Tactical Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                Hardware Crosshair Generator
              </h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCrosshairEnabled}
                  onChange={(e) => setIsCrosshairEnabled(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                />
                Enabled
              </label>
            </div>

            {/* Crosshair Styles */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Style</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['cross', 'dot', 'circle'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      playClickSound();
                      setCrosshair((prev) => ({ ...prev, style: st }));
                    }}
                    className={`py-1.5 rounded-lg border capitalize font-medium transition-colors ${
                      crosshair.style === st
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Color Palette</label>
              <div className="flex items-center gap-2">
                {[
                  '#10b981', // Emerald
                  '#06b6d4', // Cyan
                  '#ec4899', // Hot Pink
                  '#eab308', // Cyber Yellow
                  '#ffffff', // White
                  '#ef4444', // Red
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      playClickSound();
                      setCrosshair((prev) => ({ ...prev, color }));
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      crosshair.color === color ? 'scale-110 border-white ring-2 ring-emerald-500/50' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Sliders: Size, Gap, Thickness */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Crosshair Size</span>
                  <span className="font-mono text-white">{crosshair.size}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={crosshair.size}
                  onChange={(e) => setCrosshair((prev) => ({ ...prev, size: parseInt(e.target.value, 10) }))}
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Center Gap</span>
                  <span className="font-mono text-white">{crosshair.gap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={crosshair.gap}
                  onChange={(e) => setCrosshair((prev) => ({ ...prev, gap: parseInt(e.target.value, 10) }))}
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Center Dot</span>
                <button
                  onClick={() => setCrosshair((prev) => ({ ...prev, hasDot: !prev.hasDot }))}
                  className={`px-3 py-1 text-xs rounded-md font-mono ${
                    crosshair.hasDot ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {crosshair.hasDot ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tactical Toggles */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Session Playtime: <strong className="text-white font-mono">{formatTimer(sessionSeconds)}</strong>
              </span>
              <span className="text-slate-500 text-[11px]">Break in 37m</span>
            </div>

            <button
              onClick={() => setIsDoNotDisturb((prev) => !prev)}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                isDoNotDisturb
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>Do Not Disturb (Silence Windows Notifications)</span>
              <span className="font-mono">{isDoNotDisturb ? 'ACTIVE' : 'MUTED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay Bottom Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Engine: <strong className="text-slate-200">DirectX 12 / Vulkan Hook</strong></span>
          <span>·</span>
          <span>Render Latency: <strong className="text-emerald-400 font-mono">0.12ms</strong></span>
        </div>

        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-colors"
        >
          Return to Game (Esc)
        </button>
      </div>
    </div>
  );
};
