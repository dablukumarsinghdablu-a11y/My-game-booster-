import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Gauge,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { PerformanceIssue, SystemMetrics } from '../types';
import { playClickSound, playSuccessChime, playWarningSound } from '../utils/soundEngine';

interface Props {
  metrics: SystemMetrics;
  issues: PerformanceIssue[];
  onResolveIssue: (issueId: string) => void;
  onRunStressTest: () => void;
  isStressTesting: boolean;
  isBoostActive: boolean;
  onTriggerBoost: () => void;
}

export const PerformanceMonitor: React.FC<Props> = ({
  metrics,
  issues,
  onResolveIssue,
  onRunStressTest,
  isStressTesting,
  isBoostActive,
  onTriggerBoost,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<Array<{ fps: number; cpu: number; ram: number; time: number }>>([]);
  const [fixedLogs, setFixedLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'issues' | 'bottlenecks'>('live');

  // Push rolling telemetry data points
  useEffect(() => {
    const list = historyRef.current;
    list.push({
      fps: metrics.fps,
      cpu: metrics.cpuUsagePercent,
      ram: metrics.ramPercent,
      time: Date.now(),
    });
    if (list.length > 50) {
      list.shift();
    }
  }, [metrics]);

  // Render high-frequency smooth telemetry graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const list = historyRef.current;
      if (list.length < 2) {
        animId = requestAnimationFrame(render);
        return;
      }

      const stepX = width / 50;

      // Draw FPS Line (Emerald / Green)
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      list.forEach((pt, i) => {
        const x = i * stepX;
        // FPS scale 0 - 300
        const y = height - (Math.min(300, Math.max(0, pt.fps)) / 300) * (height - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw CPU Line (Cyan / Blue)
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      list.forEach((pt, i) => {
        const x = i * stepX;
        const y = height - (pt.cpu / 100) * (height - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw RAM Line (Amber / Violet)
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      list.forEach((pt, i) => {
        const x = i * stepX;
        const y = height - (pt.ram / 100) * (height - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleFix = (issue: PerformanceIssue) => {
    playSuccessChime();
    onResolveIssue(issue.id);
    setFixedLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Applied resolution for: ${issue.title}`,
      ...prev.slice(0, 5),
    ]);
  };

  const criticalIssuesCount = issues.filter((i) => i.severity === 'critical').length;
  const warningIssuesCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Hardware & Game Performance Monitor
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time frame pacing, CPU core scheduler telemetry, and active bottleneck detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              onRunStressTest();
            }}
            disabled={isStressTesting}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
              isStressTesting
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Flame className={`w-4 h-4 ${isStressTesting ? 'text-amber-400' : 'text-slate-400'}`} />
            {isStressTesting ? 'Simulating High Load...' : 'Run Stress & Stutter Test'}
          </button>

          {!isBoostActive && (
            <button
              onClick={() => {
                playClickSound();
                onTriggerBoost();
              }}
              className="px-4 py-2 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-black" />
              Engage Turbo Boost
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FPS & Frame Time Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Frame Rate (FPS)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {metrics.frameTimeMs.toFixed(1)} ms
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-extrabold font-mono tabular-nums text-white">
              {Math.round(metrics.fps)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              TARGET: 144+
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[11px]">1% Low</div>
              <div className={`font-semibold tabular-nums ${metrics.fpsOnePercentLow < 60 ? 'text-amber-400' : 'text-slate-200'}`}>
                {Math.round(metrics.fpsOnePercentLow)} FPS
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Avg FPS</div>
              <div className="font-semibold text-slate-200 tabular-nums">
                {Math.round((metrics.fpsMin + metrics.fpsMax) / 2 || metrics.fps)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Max FPS</div>
              <div className="font-semibold text-slate-200 tabular-nums">
                {Math.round(metrics.fpsMax)}
              </div>
            </div>
          </div>
        </div>

        {/* CPU Usage Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              CPU Utilization
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {metrics.cpuCores} Threads Active
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-extrabold font-mono tabular-nums text-white">
              {Math.round(metrics.cpuUsagePercent)}%
            </span>
            <span className="text-xs font-medium text-slate-400">
              {metrics.cpuUsagePercent > 75 ? (
                <span className="text-amber-400">High Contention</span>
              ) : (
                <span className="text-cyan-400">Nominal Load</span>
              )}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.cpuUsagePercent > 80
                  ? 'bg-rose-500'
                  : metrics.cpuUsagePercent > 60
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, metrics.cpuUsagePercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>DPC Latency: &lt; 0.4ms</span>
            <span className="text-slate-500">Core Parking: Disabled</span>
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-400" />
              System RAM Memory
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {metrics.ramUsedGB.toFixed(1)} / {metrics.ramTotalGB} GB
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-extrabold font-mono tabular-nums text-white">
              {Math.round(metrics.ramPercent)}%
            </span>
            <span className="text-xs font-medium text-slate-400">
              {(metrics.ramTotalGB - metrics.ramUsedGB).toFixed(1)} GB Available
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.ramPercent > 85 ? 'bg-rose-500' : 'bg-purple-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, metrics.ramPercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Standby Cache: Cleaned</span>
            <span className="text-emerald-400 font-medium">Pagefile: Low</span>
          </div>
        </div>
      </div>

      {/* Telemetry Visualizer Chart */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Real-Time Hardware Waveform
            </h3>
            <p className="text-xs text-slate-500">
              Continuous 60-frame telemetry capturing micro-hitching and thread scheduling ripples.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              FPS ({Math.round(metrics.fps)})
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              CPU ({Math.round(metrics.cpuUsagePercent)}%)
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
              RAM ({Math.round(metrics.ramPercent)}%)
            </span>
          </div>
        </div>

        <div className="relative w-full h-40 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Active Potential Issues Detective Section */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${issues.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Potential Performance Issues & Diagnostics
                {issues.length > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 font-mono">
                    {issues.length} DETECTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    OPTIMAL
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Automated bottleneck engine analyzing frame pacing, memory allocation, and CPU scheduling.
              </p>
            </div>
          </div>

          {issues.length > 1 && (
            <button
              onClick={() => {
                issues.forEach((issue) => handleFix(issue));
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fix All Issues ({issues.length})
            </button>
          )}
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-emerald-500/20 bg-emerald-950/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-emerald-200">
              Hardware Operating in Peak Esports Profile
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No micro-stutters, memory leaks, or thermal scheduling penalties detected. Frame times are stable.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border transition-all ${
                  issue.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : issue.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          issue.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : issue.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {issue.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300">
                      {issue.description}
                    </p>

                    <div className="text-xs text-slate-400 pt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong className="text-slate-300">In-game impact:</strong> {issue.impact}</span>
                      <span><strong className="text-slate-300">Suggested Action:</strong> {issue.suggestedAction}</span>
                    </div>
                  </div>

                  {issue.autoFixAvailable && (
                    <button
                      onClick={() => handleFix(issue)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      Auto-Fix Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolution History Console */}
        {fixedLogs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-emerald-400/90 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Optimization Audit Trail
            </div>
            {fixedLogs.map((log, idx) => (
              <div key={idx} className="truncate">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hardware Environment Summary */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-500 block mb-0.5">Graphics Accelerator</span>
          <span className="font-semibold text-slate-200 font-mono truncate block">
            {metrics.gpuName}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">Processor Topology</span>
          <span className="font-semibold text-slate-200 font-mono block">
            {metrics.cpuCores} Physical/SMT Execution Units
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">Physical Memory Pool</span>
          <span className="font-semibold text-slate-200 font-mono block">
            {metrics.ramTotalGB} GB High-Bandwidth Dual Channel
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">DirectStorage & Resizable BAR</span>
          <span className="font-semibold text-emerald-400 font-mono block">
            Enabled & Initialized
          </span>
        </div>
      </div>
    </div>
  );
};
