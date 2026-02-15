// Plantasia: Guardians — Hardware Simulator
// Fallback when no real ESP32 is available
// Ported from original/plantasia/services/hardwareSimulator.ts

import type { SensorData } from '../types';

type SensorCallback = (data: SensorData) => void;

interface SimulatorConfig {
    baseGSR: number;
    baseSoilMoisture: number;
    varianceRange: number;
    updateIntervalMs: number;
}

const defaultConfig: SimulatorConfig = {
    baseGSR: 2048,
    baseSoilMoisture: 55, // Healthy range center (percentage)
    varianceRange: 5,
    updateIntervalMs: 1000, // 1Hz for simulator (lower than real 10Hz)
};

class HardwareSimulator {
    private config: SimulatorConfig;
    private gsrHistory: number[] = [];
    private listeners: SensorCallback[] = [];
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;

    // Simulated "mood"
    private currentMood: 'calm' | 'curious' | 'excited' | 'stressed' = 'calm';
    private moodDuration = 0;

    // Soil moisture trends (for zombie spawning)
    private moistureTrend: 'stable' | 'rising' | 'falling' = 'stable';
    private targetMoisture: number;
    private touchCooldown = 0;

    constructor(config?: Partial<SimulatorConfig>) {
        this.config = { ...defaultConfig, ...config };
        this.targetMoisture = this.config.baseSoilMoisture;
    }

    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;

        this.intervalId = setInterval(() => {
            const data = this.generateSensorData();
            this.listeners.forEach(cb => cb(data));
        }, this.config.updateIntervalMs);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    subscribe(callback: SensorCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // Simulate touch event
    triggerTouch(): void {
        this.currentMood = 'excited';
        this.moodDuration = 5;
        this.touchCooldown = 3;
    }

    // Let demo control moisture for showing zombie spawns
    setMoistureTrend(trend: 'stable' | 'rising' | 'falling'): void {
        this.moistureTrend = trend;
        if (trend === 'rising') this.targetMoisture = 50; // Will trigger Drownface but safe for quest (>40%)
        else if (trend === 'falling') this.targetMoisture = 10; // Will trigger Thirster
        else this.targetMoisture = 55; // Healthy
    }

    // Set moisture to an exact value instantly (for demo precision)
    setMoistureValue(value: number): void {
        this.config.baseSoilMoisture = value;
        this.targetMoisture = value;
    }

    private generateSensorData(): SensorData {
        // Update mood
        if (this.moodDuration > 0) {
            this.moodDuration--;
        } else if (Math.random() < 0.05) {
            const moods = ['calm', 'curious', 'excited', 'stressed'] as const;
            this.currentMood = moods[Math.floor(Math.random() * moods.length)];
            this.moodDuration = 3 + Math.floor(Math.random() * 5);
        } else {
            this.currentMood = 'calm';
        }

        // GSR based on mood
        const moodMultiplier = { calm: 1, curious: 1.5, excited: 2.5, stressed: 3 };
        const variance = this.config.varianceRange * moodMultiplier[this.currentMood];
        const gsrValue = this.config.baseGSR + (Math.random() - 0.5) * variance * 100;

        this.gsrHistory.push(gsrValue);
        if (this.gsrHistory.length > 20) this.gsrHistory.shift();

        const gsrVariance = this.calculateVariance(this.gsrHistory);

        // Soil moisture — slowly moves toward target
        const currentMoisture = this.config.baseSoilMoisture;
        const diff = this.targetMoisture - currentMoisture;
        this.config.baseSoilMoisture += diff * 0.05 + (Math.random() - 0.5) * 2;
        this.config.baseSoilMoisture = Math.max(0, Math.min(100, this.config.baseSoilMoisture));

        // Touch detection
        const touchDetected = this.touchCooldown > 0;
        if (this.touchCooldown > 0) this.touchCooldown--;

        return {
            gsrValue: Math.round(gsrValue),
            soilMoisture: Math.round(this.config.baseSoilMoisture),
            gsrVariance: Math.round(gsrVariance * 100) / 100,
            touchDetected,
            timestamp: Date.now(),
        };
    }

    private calculateVariance(values: number[]): number {
        if (values.length < 2) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - mean, 2));
        return squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
}

// Singleton
let simulator: HardwareSimulator | null = null;

export function getHardwareSimulator(): HardwareSimulator {
    if (!simulator) {
        simulator = new HardwareSimulator();
    }
    return simulator;
}

export default HardwareSimulator;
