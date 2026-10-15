import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Settings2, 
  Check, 
  Flame, 
  Maximize2, 
  ChevronRight, 
  Sliders, 
  ExternalLink,
  Gamepad2,
  X,
  Sparkles
} from 'lucide-react';
import { GameProfile } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEngine';

interface Props {
  games: GameProfile[];
  onLaunchGame: (game: GameProfile) => void;
  onUpdateGamePreset: (gameId: string, preset: 'competitive' | 'balanced' | 'ultra') => void;
  onAddGame: (newGame: Omit<GameProfile, 'id'>) => void;
  isBoostActive: boolean;
}

export const GameLibrary: React.FC<Props> = ({
  games,
  onLaunchGame,
  onUpdateGamePreset,
  onAddGame,
  isBoostActive,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedGameForConfig, setSelectedGameForConfig] = useState<GameProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Game Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState<GameProfile['genre']>('Esports FPS');
  const [newTargetFps, setNewTargetFps] = useState(144);
  const [newResolution, setNewResolution] = useState('1920x1080 (16:9)');
  const [newPreset, setNewPreset] = useState<'competitive' | 'balanced' | 'ultra'>('competitive');

  const filteredGames = games.filter((g) => {
    if (filter === 'all') return true;
    return g.genre.toLowerCase().includes(filter.toLowerCase());
  });

  const handleLaunch = (game: GameProfile) => {
    playSuccessChime();
    onLaunchGame(game);
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGame({
      title: newTitle.trim(),
      genre: newGenre,
      currentFps: Math.round(newTargetFps * 0.85),
      targetFps: newTargetFps,
      resolution: newResolution,
      preset: newPreset,
      isBoosted: isBoostActive,
      bannerImage: '/src/assets/images/game_tactical_fps_1792052156350.jpg',
      notes: 'Custom profile configured with high priority thread affinity.',
      lastPlayed: 'Never',
    });

    setNewTitle('');
    setShowAddModal(false);
    playSuccessChime();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            Game Library & Launcher
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Per-title optimization profiles with instant low-latency launch configurations.
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setShowAddModal(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Custom Game
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-fit">
        {[
          { id: 'all', label: 'All Titles' },
          { id: 'fps', label: 'Esports FPS' },
          { id: 'battle royale', label: 'Battle Royale' },
          { id: 'action', label: 'Action RPG' },
          { id: 'simulation', label: 'Simulation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClickSound();
              setFilter(tab.id);
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="group rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            {/* Image Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <img
                src={game.bannerImage}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Resilient styled fallback container
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-black/60 text-slate-300 backdrop-blur-md border border-white/10">
                  {game.genre}
                </span>

                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-md border ${
                  game.preset === 'competitive'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                    : game.preset === 'ultra'
                    ? 'bg-purple-950/70 text-purple-300 border-purple-500/30'
                    : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30'
                }`}>
                  {game.preset.toUpperCase()}
                </span>
              </div>

              {/* Title & Resolution on Image */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  {game.title}
                </h3>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                  <span>{game.resolution}</span>
                  <span className="text-slate-500">·</span>
                  <span>Played: {game.lastPlayed}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats & Launch Area */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">CURRENT FPS</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {game.currentFps} FPS
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TARGET REFRESH</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    {game.targetFps} Hz
                  </span>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tuning Preset</span>
                  <button
                    onClick={() => {
                      playClickSound();
                      setSelectedGameForConfig(game);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Config</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
                  {(['competitive', 'balanced', 'ultra'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        playClickSound();
                        onUpdateGamePreset(game.id, p);
                      }}
                      className={`py-1 rounded capitalize transition-colors cursor-pointer ${
                        game.preset === p
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleLaunch(game)}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Launch With Boost</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Config Drawer / Modal */}
      {selectedGameForConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedGameForConfig.title} — Optimization Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Custom low-latency flags and Direct3D settings for this executable.
                </p>
              </div>
              <button
                onClick={() => setSelectedGameForConfig(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Steam / Command Line Launch Options</label>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 break-all select-all">
                  -novid -high -threads 8 +mat_queue_mode 2 -tickrate 128 +cl_forcepreload 1 -freq {selectedGameForConfig.targetFps}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Executable Target Path</label>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 truncate">
                  {selectedGameForConfig.launchPath || 'Default Game Launcher Executable'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">Reflex / Anti-Lag</span>
                  <span className="text-emerald-400 font-semibold">Enabled + Boost</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">Fullscreen Optimizations</span>
                  <span className="text-emerald-400 font-semibold">Bypassed (Exclusive)</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Engineer Notes</label>
                <p className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-slate-300 font-sans">
                  {selectedGameForConfig.notes}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedGameForConfig(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleLaunch(selectedGameForConfig);
                  setSelectedGameForConfig(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Launch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGame}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                Register Game Executable
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call of Duty: Black Ops 6"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Genre Category</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Esports FPS">Esports FPS</option>
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Action RPG">Action RPG</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Open World">Open World</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Monitor Target Hz</label>
                  <select
                    value={newTargetFps}
                    onChange={(e) => setNewTargetFps(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    <option value={60}>60 Hz (Standard)</option>
                    <option value={120}>120 Hz</option>
                    <option value={144}>144 Hz (Esports)</option>
                    <option value={240}>240 Hz (Competitive)</option>
                    <option value={360}>360 Hz (Pro)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Resolution Profile</label>
                <select
                  value={newResolution}
                  onChange={(e) => setNewResolution(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="1920x1080 (16:9)">1920x1080 (1080p FHD)</option>
                  <option value="2560x1440 (16:9)">2560x1440 (1440p QHD)</option>
                  <option value="3840x2160 (16:9)">3840x2160 (4K UHD)</option>
                  <option value="1280x960 (4:3 Stretched)">1280x960 (4:3 Stretched CS2)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Default Tuning Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['competitive', 'balanced', 'ultra'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPreset(p)}
                      className={`py-1.5 rounded-lg border text-center capitalize transition-colors ${
                        newPreset === p
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Save & Add Game
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
