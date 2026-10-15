export interface GameProfile {
  id: string;
  title: string;
  genre: 'Esports FPS' | 'Battle Royale' | 'Action RPG' | 'Simulation' | 'Open World';
  bannerImage: string;
  currentFps: number;
  targetFps: number;
  resolution: string;
  preset: 'competitive' | 'balanced' | 'ultra';
  isBoosted: boolean;
  launchPath?: string;
  notes?: string;
  lastPlayed?: string;
}

export interface SystemMetrics {
  fps: number;
  fpsMin: number;
  fpsMax: number;
  fpsOnePercentLow: number;
  frameTimeMs: number;
  cpuUsagePercent: number;
  cpuCores: number;
  ramUsedGB: number;
  ramTotalGB: number;
  ramPercent: number;
  gpuUsagePercent: number;
  gpuName: string;
  pingMs: number;
  jitterMs: number;
  packetLossPercent: number;
}

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface PerformanceIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  metricType: 'fps' | 'cpu' | 'ram' | 'network';
  description: string;
  impact: string;
  suggestedAction: string;
  autoFixAvailable: boolean;
  fixed?: boolean;
}

export interface NetworkServer {
  id: string;
  name: string;
  region: string;
  location: string;
  testUrl: string;
  ping: number | null;
  status: 'idle' | 'testing' | 'optimal' | 'moderate' | 'high';
}

export interface AiTuningResult {
  primaryBottleneck: string;
  gpuBottleneckScore: number;
  cpuBottleneckScore: number;
  projectedFpsRange: string;
  optimalSettings: Array<{
    setting: string;
    recommendedValue: string;
    reason: string;
    impact: string;
  }>;
  launchOptions: string;
  driverSettings: string[];
  latencyReductionTweaks: string[];
  diagnosticSummary: string;
}

export interface CrosshairConfig {
  style: 'cross' | 'dot' | 'circle' | 'chevron' | 'box';
  color: string;
  size: number;
  thickness: number;
  gap: number;
  hasDot: boolean;
  opacity: number;
}
