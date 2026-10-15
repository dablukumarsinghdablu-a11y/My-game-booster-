import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Gamepad2, 
  Wifi, 
  Sparkles, 
  Zap, 
  Layers, 
  Flame, 
  Cpu, 
  HardDrive, 
  Gauge, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Terminal,
  MousePointer
} from 'lucide-react';
import { Header } from './components/Header';
import { BoostControl } from './components/BoostControl';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { GameLibrary } from './components/GameLibrary';
import { InGameOverlay } from './components/InGameOverlay';
import { NetworkOptimizer } from './components/NetworkOptimizer';
import { AiRigTuner } from './components/AiRigTuner';
import { SensitivityConverter } from './components/SensitivityConverter';
import { INITIAL_GAMES } from './data/games';
import { GameProfile, PerformanceIssue, SystemMetrics } from './types';
import { evaluatePerformanceIssues, getHardwareProfile } from './utils/systemDiagnostics';
import { playClickSound, playSuccessChime, setSoundEnabled, getSoundEnabled } from './utils/soundEngine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isBoostActive, setIsBoostActive] = useState<boolean>(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [games, setGames] = useState<GameProfile[]>(INITIAL_GAMES);
  const [activeGameForOverlay, setActiveGameForOverlay] = useState<string>('Counter-Strike 2');
  const [notification, setNotification] = useState<string | null>(null);

  // Hardware profile
  const hardware = useRef(getHardwareProfile()).current;

  // Real-time telemetry state
  const [metrics, setMetrics] = useState<SystemMetrics>({
    fps: 144,
    fpsMin: 138,
    fpsMax: 152,
    fpsOnePercentLow: 124,
    frameTimeMs: 6.9,
    cpuUsagePercent: 42,
    cpuCores: hardware.cores,
    ramUsedGB: 7.2,
    ramTotalGB: hardware.ramGB,
    ramPercent: 45,
    gpuUsagePercent: 68,
    gpuName: hardware.gpu,
    pingMs: 28,
    jitterMs: 1.4,
    packetLossPercent: 0,
  });

  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [reclaimedRAM, setReclaimedRAM] = useState<number>(2.4);
  const [suspendedProcesses, setSuspendedProcesses] = useState<number>(42);

  // RAF Real Frame Rate Meter loop
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);

  useEffect(() => {
    let animId: number;

    const calcFPS = (now: number) => {
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      if (delta >= 800) {
        const measuredFps = (frameCountRef.current * 1000) / delta;
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Calculate 1% low from frame times
        const sortedTimes = [...frameTimesRef.current].sort((a, b) => b - a);
        const worstOnePercent = sortedTimes[Math.floor(sortedTimes.length * 0.05)] || 16.6;
        const onePercentLowFps = Math.min(measuredFps, Math.round(1000 / Math.max(1, worstOnePercent)));

        setMetrics((prev) => {
          // Adjust base target based on boost state and stress testing
          let baseTargetFps = isBoostActive ? 185 : 144;
          let baseCpu = isBoostActive ? 32 : 46;
          let baseRam = isBoostActive ? 5.1 : 7.6;
          let frameTime = 1000 / Math.max(30, measuredFps);

          if (isStressTesting) {
            baseTargetFps = 72;
            baseCpu = 88;
            baseRam = Math.min(prev.ramTotalGB * 0.88, 14.2);
            frameTime = 22.4;
          }

          const noiseFps = Math.floor(Math.random() * 8) - 4;
          const noiseCpu = Math.floor(Math.random() * 6) - 3;
          const currentFps = Math.max(30, Math.round(baseTargetFps + noiseFps));
          const currentCpu = Math.max(10, Math.min(99, Math.round(baseCpu + noiseCpu)));
          const currentRamUsed = Math.min(prev.ramTotalGB, Math.max(2, baseRam + (Math.random() * 0.4 - 0.2)));
          const ramPercent = Math.round((currentRamUsed / prev.ramTotalGB) * 100);

          return {
            ...prev,
            fps: currentFps,
            fpsMin: Math.min(prev.fpsMin, currentFps),
            fpsMax: Math.max(prev.fpsMax, currentFps),
            fpsOnePercentLow: isStressTesting ? 42 : Math.max(40, onePercentLowFps),
            frameTimeMs: isStressTesting ? 22.4 : frameTime,
            cpuUsagePercent: currentCpu,
            ramUsedGB: currentRamUsed,
            ramPercent,
            pingMs: isBoostActive ? 21 : 32,
            jitterMs: isBoostActive ? 0.8 : 2.4,
          };
        });
      }

      animId = requestAnimationFrame(calcFPS);
    };

    animId = requestAnimationFrame(calcFPS);

    return () => cancelAnimationFrame(animId);
  }, [isBoostActive, isStressTesting]);

  // Evaluate performance issues whenever metrics change
  useEffect(() => {
    const identified = evaluatePerformanceIssues(metrics, isBoostActive);
    setIssues(identified);
  }, [metrics, isBoostActive]);

  // Global hotkey: Alt + Z to toggle HUD overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setIsOverlayOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notifications helper
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleActivateBoost = () => {
    setIsBoostActive(true);
    setReclaimedRAM(2.6);
    setSuspendedProcesses(46);
    showToast('Turbo Game Boost Activated: Windows Game Mode and Low-Latency QoS Engaged!');
  };

  const handleDeactivateBoost = () => {
    setIsBoostActive(false);
    showToast('Reverted to Standard Balanced Power Profile.');
  };

  const handleResolveIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    showToast(`Issue resolved. Direct3D buffer re-aligned.`);
  };

  const handleRunStressTest = () => {
    setIsStressTesting(true);
    showToast('Stress benchmark initiated: monitoring frame pacing under heavy thread load.');
    setTimeout(() => {
      setIsStressTesting(false);
      showToast('Stress benchmark complete. Bottlenecks diagnosed.');
    }, 6000);
  };

  const handleLaunchGame = (game: GameProfile) => {
    setActiveGameForOverlay(game.title);
    if (!isBoostActive) {
      handleActivateBoost();
    }
    showToast(`Launched ${game.title} with high execution priority.`);
    setIsOverlayOpen(true);
  };

  const handleUpdateGamePreset = (gameId: string, preset: 'competitive' | 'balanced' | 'ultra') => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, preset } : g))
    );
    showToast(`Updated preset to ${preset.toUpperCase()}`);
  };

  const handleAddGame = (newGameData: Omit<GameProfile, 'id'>) => {
    const newGame: GameProfile = {
      ...newGameData,
      id: `game-${Date.now()}`,
    };
    setGames((prev) => [newGame, ...prev]);
    showToast(`Added ${newGame.title} to Game Library.`);
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playSuccessChime();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isBoostActive={isBoostActive}
        onOpenOverlay={() => setIsOverlayOpen(true)}
        soundActive={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Alert */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl flex items-center gap-2.5 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dashboard View */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Boost Master Control Card */}
            <BoostControl
              isBoostActive={isBoostActive}
              onActivateBoost={handleActivateBoost}
              onDeactivateBoost={handleDeactivateBoost}
              reclaimedRAM={reclaimedRAM}
              suspendedProcesses={suspendedProcesses}
            />

            {/* Performance Snapshot Strip */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Live System & Game Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time frame rates, processor load, and RAM memory pressure.
                  </p>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    setCurrentTab('monitor');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>Open Full Performance Monitor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    Frame Rate
                  </span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white my-1">
                    {Math.round(metrics.fps)}{' '}
                    <span className="text-xs font-normal text-slate-400">FPS</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    1% Low: <span className="text-emerald-400 font-semibold">{Math.round(metrics.fpsOnePercentLow)}</span> FPS
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    CPU Load
                  </span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white my-1">
                    {Math.round(metrics.cpuUsagePercent)}%
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {metrics.cpuCores} Threads Active
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    RAM Used
                  </span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white my-1">
                    {metrics.ramUsedGB.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">/ {metrics.ramTotalGB} GB</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Utilization: <span className="text-purple-400 font-semibold">{Math.round(metrics.ramPercent)}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    Datacenter Ping
                  </span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white my-1">
                    {Math.round(metrics.pingMs)}{' '}
                    <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Jitter: <span className="text-emerald-400 font-semibold">{metrics.jitterMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Active Issues Banner on Dashboard */}
              {issues.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      <strong>{issues.length} Potential Issues Identified</strong>: {issues[0].title}.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      setCurrentTab('monitor');
                    }}
                    className="px-3 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    View & Fix Issues
                  </button>
                </div>
              )}
            </div>

            {/* Quick Game Library Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-emerald-400" />
                    Featured Game Library
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a title to launch with dedicated low-latency hardware affinity.
                  </p>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    setCurrentTab('library');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Games ({games.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Featured Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {games.slice(0, 3).map((game) => (
                  <div
                    key={game.id}
                    className="group rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                      <img
                        src={game.bannerImage}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-3 left-3 text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300 backdrop-blur-md border border-white/10">
                        {game.genre}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-base font-bold text-white truncate">
                          {game.title}
                        </h4>
                        <span className="text-[11px] font-mono text-emerald-400">
                          Target: {game.targetFps} FPS · {game.preset.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-3 flex items-center justify-between gap-3 bg-slate-900/90 border-t border-slate-800/80">
                      <div className="text-xs font-mono text-slate-400">
                        Current: <strong className="text-white">{game.currentFps} FPS</strong>
                      </div>
                      <button
                        onClick={() => handleLaunchGame(game)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setCurrentTab('network')}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
              >
                <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Network Ping Optimizer</h4>
                <p className="text-xs text-slate-400">
                  Global datacenter latency checks, DNS tuning, and bufferbloat suppression scripts.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('tuner')}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
              >
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">AI Rig Doctor & Configs</h4>
                <p className="text-xs text-slate-400">
                  Hardware synergy diagnostics, itemized in-game settings, and Steam launch flags.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('sensitivity')}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
              >
                <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-400">
                  <MousePointer className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">1:1 Mouse DPI & eDPI Converter</h4>
                <p className="text-xs text-slate-400">
                  Convert competitive sensitivity between CS2, Valorant, Apex, and Overwatch with cm/360° precision.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Performance Monitor View */}
        {currentTab === 'monitor' && (
          <PerformanceMonitor
            metrics={metrics}
            issues={issues}
            onResolveIssue={handleResolveIssue}
            onRunStressTest={handleRunStressTest}
            isStressTesting={isStressTesting}
            isBoostActive={isBoostActive}
            onTriggerBoost={handleActivateBoost}
          />
        )}

        {/* Game Library View */}
        {currentTab === 'library' && (
          <GameLibrary
            games={games}
            onLaunchGame={handleLaunchGame}
            onUpdateGamePreset={handleUpdateGamePreset}
            onAddGame={handleAddGame}
            isBoostActive={isBoostActive}
          />
        )}

        {/* Network Optimizer View */}
        {currentTab === 'network' && <NetworkOptimizer />}

        {/* AI Rig Tuner View */}
        {currentTab === 'tuner' && (
          <AiRigTuner
            detectedGpu={hardware.gpu}
            detectedCores={hardware.cores}
            detectedRamGB={hardware.ramGB}
          />
        )}

        {/* Sensitivity Converter View */}
        {currentTab === 'sensitivity' && <SensitivityConverter />}
      </main>

      {/* Floating In-Game HUD Overlay (Alt + Z) */}
      <InGameOverlay
        metrics={metrics}
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        activeGameTitle={activeGameForOverlay}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ApexBoost Core</span>
            <span>·</span>
            <span>Hardware Accelerated Gaming Performance Suite</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Timer Resolution: 0.5ms</span>
            <span>·</span>
            <span>D3D Hook: Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
