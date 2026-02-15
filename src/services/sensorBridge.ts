// Plantasia: Guardians — Sensor Bridge
// Unified interface wrapping real BLE and simulator fallback

import type { SensorData, SensorConnectionState } from '../types';
import { connectToSensor, onSensorData as onBLEData, disconnectSensor, isWebBluetoothSupported, isConnected as isBLEConnected } from './bluetooth';
import { getHardwareSimulator } from './hardwareSimulator';

type SensorCallback = (data: SensorData) => void;
type ConnectionCallback = (state: SensorConnectionState) => void;
type GameEventCallback = (event: SensorGameEvent) => void;

export type SensorGameEvent =
    | { type: 'zombie_trigger'; zombieType: 'drownface' | 'thirster'; reason: string }
    | { type: 'touch_reaction'; coins: number }
    | { type: 'shield_building'; strength: number }
    | { type: 'moisture_update'; level: number; zone: 'low' | 'healthy' | 'high' };

// Zombie spawn thresholds
const MOISTURE_HIGH_THRESHOLD = 80;
const MOISTURE_LOW_THRESHOLD = 20;
const MOISTURE_HEALTHY_MIN = 40;
const MOISTURE_HEALTHY_MAX = 60;
const TOUCH_BONUS_COINS = 15;

// Track sustained moisture for zombie spawning
let highMoistureCount = 0;
let lowMoistureCount = 0;
const SUSTAINED_THRESHOLD = 5; // readings before spawning

class SensorBridge {
    private connectionState: SensorConnectionState = 'disconnected';
    private sensorListeners: SensorCallback[] = [];
    private connectionListeners: ConnectionCallback[] = [];
    private gameEventListeners: GameEventCallback[] = [];
    private unsubscribe: (() => void) | null = null;
    private isRealHardware = false;

    get isReal(): boolean { return this.isRealHardware; }
    get state(): SensorConnectionState { return this.connectionState; }

    async connect(): Promise<SensorConnectionState> {
        this.setConnectionState('connecting');

        // Try real BLE first
        if (isWebBluetoothSupported()) {
            try {
                const connected = await connectToSensor();
                if (connected) {
                    this.isRealHardware = true;
                    this.unsubscribe = onBLEData((data) => this.handleSensorData(data));
                    this.setConnectionState('connected_real');
                    return 'connected_real';
                }
            } catch (e) {
                console.log('BLE connection failed, falling back to simulator');
            }
        }

        // Fallback to simulator
        this.isRealHardware = false;
        const sim = getHardwareSimulator();
        sim.start();
        this.unsubscribe = sim.subscribe((data) => this.handleSensorData(data));
        this.setConnectionState('connected_simulated');
        return 'connected_simulated';
    }

    connectSimulator(): void {
        this.isRealHardware = false;
        const sim = getHardwareSimulator();
        sim.start();
        this.unsubscribe = sim.subscribe((data) => this.handleSensorData(data));
        this.setConnectionState('connected_simulated');
    }

    disconnect(): void {
        if (this.isRealHardware) {
            disconnectSensor();
        } else {
            getHardwareSimulator().stop();
        }
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.setConnectionState('disconnected');
        highMoistureCount = 0;
        lowMoistureCount = 0;
    }

    // Simulate touch (for demo without hardware)
    simulateTouch(): void {
        if (!this.isRealHardware) {
            getHardwareSimulator().triggerTouch();
        }
    }

    // Control moisture trend (for demo)
    setMoistureTrend(trend: 'stable' | 'rising' | 'falling'): void {
        if (!this.isRealHardware) {
            getHardwareSimulator().setMoistureTrend(trend);
        }
    }

    // Set moisture to exact value instantly (for demo precision)
    setMoistureValue(value: number): void {
        if (!this.isRealHardware) {
            getHardwareSimulator().setMoistureValue(value);
        }
    }

    // Subscribe to raw sensor data
    onSensorData(cb: SensorCallback): () => void {
        this.sensorListeners.push(cb);
        return () => { this.sensorListeners = this.sensorListeners.filter(l => l !== cb); };
    }

    // Subscribe to connection state changes
    onConnectionChange(cb: ConnectionCallback): () => void {
        this.connectionListeners.push(cb);
        return () => { this.connectionListeners = this.connectionListeners.filter(l => l !== cb); };
    }

    // Subscribe to game events derived from sensor data
    onGameEvent(cb: GameEventCallback): () => void {
        this.gameEventListeners.push(cb);
        return () => { this.gameEventListeners = this.gameEventListeners.filter(l => l !== cb); };
    }

    // ─── Private ───

    private handleSensorData(data: SensorData): void {
        // Broadcast raw data
        this.sensorListeners.forEach(cb => cb(data));

        // Process game events
        this.processGameEvents(data);
    }

    private processGameEvents(data: SensorData): void {
        const { soilMoisture, touchDetected } = data;

        // Moisture zone update
        const zone = soilMoisture > MOISTURE_HIGH_THRESHOLD ? 'high'
            : soilMoisture < MOISTURE_LOW_THRESHOLD ? 'low'
                : 'healthy';

        this.emitGameEvent({ type: 'moisture_update', level: soilMoisture, zone });

        // Zombie spawning — sustained bad moisture
        if (soilMoisture > MOISTURE_HIGH_THRESHOLD) {
            highMoistureCount++;
            lowMoistureCount = 0;
            if (highMoistureCount >= SUSTAINED_THRESHOLD) {
                this.emitGameEvent({
                    type: 'zombie_trigger',
                    zombieType: 'drownface',
                    reason: `Soil moisture at ${soilMoisture}% — way too wet!`,
                });
                highMoistureCount = 0; // Reset after spawn
            }
        } else if (soilMoisture < MOISTURE_LOW_THRESHOLD) {
            lowMoistureCount++;
            highMoistureCount = 0;
            if (lowMoistureCount >= SUSTAINED_THRESHOLD) {
                this.emitGameEvent({
                    type: 'zombie_trigger',
                    zombieType: 'thirster',
                    reason: `Soil moisture at ${soilMoisture}% — bone dry!`,
                });
                lowMoistureCount = 0;
            }
        } else {
            highMoistureCount = Math.max(0, highMoistureCount - 1);
            lowMoistureCount = Math.max(0, lowMoistureCount - 1);
        }

        // Shield building — healthy range
        if (soilMoisture >= MOISTURE_HEALTHY_MIN && soilMoisture <= MOISTURE_HEALTHY_MAX) {
            this.emitGameEvent({ type: 'shield_building', strength: Math.min(100, soilMoisture) });
        }

        // Touch reaction
        if (touchDetected) {
            this.emitGameEvent({ type: 'touch_reaction', coins: TOUCH_BONUS_COINS });
        }
    }

    private emitGameEvent(event: SensorGameEvent): void {
        this.gameEventListeners.forEach(cb => cb(event));
    }

    private setConnectionState(state: SensorConnectionState): void {
        this.connectionState = state;
        this.connectionListeners.forEach(cb => cb(state));
    }
}

// Singleton
let bridge: SensorBridge | null = null;

export function getSensorBridge(): SensorBridge {
    if (!bridge) bridge = new SensorBridge();
    return bridge;
}

export default SensorBridge;
