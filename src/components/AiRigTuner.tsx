import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Sliders, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Gauge, 
  ShieldCheck,
  Monitor
} from 'lucide-react';
import { AiTuningResult } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEngine';

interface Props {
  detectedGpu: string;
  detectedCores: number;
  detectedRamGB: number;
}

export const AiRigTuner: React.FC<Props> = ({
  detectedGpu,
  detectedCores,
  detectedRamGB,
}) => {
  const [gameTitle, setGameTitle] = useState('Counter-Strike 2');
  const [resolution, setResolution] = useState('1920x1080');
  const [targetFps, setTargetFps] = useState('240 FPS');
  const [gpu, setGpu] = useState(detectedGpu || 'NVIDIA GeForce RTX 4070');
  const [cpu, setCpu] = useState(`Intel Core i7 / AMD Ryzen (${detectedCores} cores)`);
  const [ram, setRam] = useState(`${detectedRamGB}GB High-Speed DDR4/DDR5`);
  const [goal, setGoal] = useState('Competitive Maximum FPS (Lowest Input Lag)');

  const [isLoading, setIsLoading] = useState(false);
  const [tuningResult, setTuningResult] = useState<AiTuningResult | null>(null);
  const [copiedLaunch, setCopiedLaunch] = useState(false);

  const handleTune = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClickSound();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tune-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle,
          resolution,
          targetFps,
          gpu,
          cpu,
          ram,
          currentIssues: goal,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch tuning recommendation');
      const data = await res.json();
      setTuningResult(data);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLaunch = () => {
    if (!tuningResult) return;
    navigator.clipboard.writeText(tuningResult.launchOptions);
    setCopiedLaunch(true);
    playSuccessChime();
    setTimeout(() => setCopiedLaunch(false), 2000);
  };

  const handleDownloadCfg = () => {
    if (!tuningResult) return;
    const content = `// ApexBoost AutoExec & Optimization Config for ${gameTitle}
// Generated at: ${new Date().toISOString()}
// Target Rig: ${gpu} | ${cpu} | ${ram}

${tuningResult.launchOptions}

// In-Game Settings Recommendations
${tuningResult.optimalSettings.map((s) => `// ${s.setting}: ${s.recommendedValue} (${s.impact})`).join('\n')}

// Driver Tweaks
${tuningResult.driverSettings.map((t) => `// ${t}`).join('\n')}

echo "[ApexBoost] Competitive config initialized successfully!"
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexboost_${gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.cfg`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccessChime();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            AI Rig Doctor & Config Generator
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Engineered hardware synergy analysis with custom Direct3D settings and launch flags.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <form
        onSubmit={handleTune}
        className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Target Game</label>
            <input
              type="text"
              required
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g. Counter-Strike 2, Cyberpunk 2077, Valorant"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Display Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="1920x1080">1920x1080 (1080p FHD)</option>
              <option value="2560x1440">2560x1440 (1440p QHD)</option>
              <option value="3840x2160">3840x2160 (4K UHD)</option>
              <option value="1280x960">1280x960 (4:3 Stretched Competitive)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Optimization Target</label>
            <select
              value={targetFps}
              onChange={(e) => setTargetFps(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="240 FPS">240 FPS (Esports / Low Latency)</option>
              <option value="144 FPS">144 FPS (Smooth High Refresh)</option>
              <option value="60 FPS">60 FPS (Fidelity & Ray Tracing)</option>
              <option value="360 FPS">360 FPS (Pro Tournament Lock)</option>
            </select>
          </div>
        </div>

        {/* Hardware Rig Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1 border-t border-slate-800/80">
          <div>
            <label className="text-slate-400 block mb-1">Graphics Card (GPU)</label>
            <input
              type="text"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Processor (CPU)</label>
            <input
              type="text"
              value={cpu}
              onChange={(e) => setCpu(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Memory (RAM)</label>
            <input
              type="text"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/10"
          >
            <Zap className={`w-4 h-4 fill-slate-950 ${isLoading ? 'animate-bounce' : ''}`} />
            <span>{isLoading ? 'Analyzing Hardware Synergies...' : 'Generate Rig Optimization Plan'}</span>
          </button>
        </div>
      </form>

      {/* Results View */}
      {tuningResult && (
        <div className="space-y-5 animate-fade-in">
          {/* Bottleneck Summary & Projection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Hardware Balance State</span>
              <div className="text-lg font-bold text-white mb-2">
                {tuningResult.primaryBottleneck}
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>GPU Load Bias</span>
                  <span className="text-emerald-400">{tuningResult.gpuBottleneckScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${tuningResult.gpuBottleneckScore}%` }} />
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>CPU Thread Contention</span>
                  <span className="text-cyan-400">{tuningResult.cpuBottleneckScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${tuningResult.cpuBottleneckScore}%` }} />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Projected Frame Rate</span>
              <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mb-1">
                {tuningResult.projectedFpsRange}
              </div>
              <p className="text-xs text-slate-400">
                1% frame lows stabilized above 120 FPS to eliminate micro-stutters during 180° flick turns.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Config Actions</span>
                <p className="text-xs text-slate-300">
                  Export ready-to-use launch commands and autoexec script for your game directory.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleDownloadCfg}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .cfg</span>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Options Strip */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Optimized Steam / Launcher Parameters
              </span>
              <button
                onClick={handleCopyLaunch}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedLaunch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLaunch ? 'Copied!' : 'Copy Flags'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all">
              {tuningResult.launchOptions}
            </div>
          </div>

          {/* Granular In-Game Settings Table */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Granular In-Game Settings Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Graphics Setting</th>
                    <th className="py-2.5 px-3">Recommended Value</th>
                    <th className="py-2.5 px-3">Optimization Impact</th>
                    <th className="py-2.5 px-3">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {tuningResult.optimalSettings.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-white">{item.setting}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{item.recommendedValue}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                          {item.impact}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver & OS Latency Tweaks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold uppercase font-mono text-cyan-400">
                GPU Driver Control Panel Tweaks
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {tuningResult.driverSettings.map((drv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400">·</span>
                    <span>{drv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold uppercase font-mono text-emerald-400">
                System Latency & DPC Mitigations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {tuningResult.latencyReductionTweaks.map((lat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">·</span>
                    <span>{lat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
