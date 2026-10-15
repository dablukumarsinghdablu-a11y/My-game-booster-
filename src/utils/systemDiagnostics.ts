import { PerformanceIssue, SystemMetrics } from '../types';

/**
 * Detect hardware GPU renderer string via WebGL context
 */
export function detectGpuRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'Integrated Graphics / Standard Display';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer) return renderer.replace(/ANGLE \((.*)\)/, '$1');
    }
    return (gl as any).getParameter((gl as any).RENDERER) || 'Direct3D / Vulkan Accelerator';
  } catch (e) {
    return 'Hardware Accelerated GPU';
  }
}

/**
 * Detect system hardware specs
 */
export function getHardwareProfile() {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;
  const ramGB = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 16 : 16;
  const gpu = typeof window !== 'undefined' ? detectGpuRenderer() : 'Dedicated Graphics';

  return {
    cores,
    ramGB,
    gpu,
    isHighEnd: cores >= 8 && ramGB >= 16,
  };
}

/**
 * Diagnose active performance bottlenecks based on telemetry
 */
export function evaluatePerformanceIssues(
  metrics: SystemMetrics,
  isBoostActive: boolean
): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // 1. FPS Jitter / Frame Time Consistency Check
  if (metrics.frameTimeMs > 16.6 || (metrics.fpsOnePercentLow > 0 && metrics.fps - metrics.fpsOnePercentLow > 25)) {
    issues.push({
      id: 'issue-fps-stutter',
      title: 'Micro-Stutter & Frame Pacing Jitter',
      severity: metrics.frameTimeMs > 24 ? 'critical' : 'warning',
      metricType: 'fps',
      description: `Frame rendering time reached ${metrics.frameTimeMs.toFixed(1)}ms with 1% low dipping to ${Math.round(metrics.fpsOnePercentLow)} FPS.`,
      impact: 'Perceptible hitching during mouse flicking and camera rotation.',
      suggestedAction: 'Enable Frame Rate Cap (Refresh Rate - 3) and Flush GPU Render Pipeline.',
      autoFixAvailable: true,
    });
  }

  // 2. RAM Saturation Check
  if (metrics.ramPercent > 78) {
    issues.push({
      id: 'issue-ram-pressure',
      title: 'High RAM Working Set & Standby Cache Saturated',
      severity: metrics.ramPercent > 88 ? 'critical' : 'warning',
      metricType: 'ram',
      description: `System RAM allocation is at ${Math.round(metrics.ramPercent)}% (${metrics.ramUsedGB.toFixed(1)} GB used of ${metrics.ramTotalGB} GB).`,
      impact: 'Triggers Windows pagefile swapping to disk, inducing sudden millisecond freezing.',
      suggestedAction: 'Purge Standby Memory Cache and trim background browser heaps.',
      autoFixAvailable: true,
    });
  }

  // 3. CPU Core Contention Check
  if (metrics.cpuUsagePercent > 70) {
    issues.push({
      id: 'issue-cpu-load',
      title: 'CPU Core Scheduling & Background Thread Spikes',
      severity: metrics.cpuUsagePercent > 85 ? 'critical' : 'warning',
      metricType: 'cpu',
      description: `Aggregated CPU usage is at ${Math.round(metrics.cpuUsagePercent)}% across ${metrics.cpuCores} cores.`,
      impact: 'Preempts game render thread, causing frame rate dips in high particle scenes.',
      suggestedAction: 'Enforce Game Core Affinity and suspend non-gaming background daemons.',
      autoFixAvailable: true,
    });
  }

  // 4. Boost Optimization Status
  if (!isBoostActive) {
    issues.push({
      id: 'issue-boost-inactive',
      title: 'Windows Power Plan Throttling Active',
      severity: 'info',
      metricType: 'cpu',
      description: 'Standard balanced energy profile is permitting dynamic CPU downclocking.',
      impact: 'CPU clock multipliers throttle down during momentary quiet scenes.',
      suggestedAction: 'Engage Turbo Game Boost mode to lock maximum boost clock speed.',
      autoFixAvailable: true,
    });
  }

  // 5. Network Bufferbloat Check
  if (metrics.jitterMs > 14 || metrics.pingMs > 75) {
    issues.push({
      id: 'issue-network-jitter',
      title: 'Network Packet Jitter & Bufferbloat',
      severity: 'warning',
      metricType: 'network',
      description: `Latency variance is ${metrics.jitterMs.toFixed(1)}ms with current ping at ${Math.round(metrics.pingMs)}ms.`,
      impact: 'Desync and hit-registration delay in competitive matches.',
      suggestedAction: 'Enable TCP NoDelay and QoS Game Packet Prioritization.',
      autoFixAvailable: true,
    });
  }

  return issues;
}
