// Plantasia: Guardians — App Shell
import { useEffect, useState } from 'react';
import { GardenScene } from './components/garden/GardenScene';
import { GardenHUD } from './components/garden/GardenHUD';
import { SensorOverlay } from './components/garden/SensorOverlay';
import { PlantDetailPanel } from './components/plant/PlantDetailPanel';
import { PlantChat } from './components/plant/PlantChat';
import { ZombieInfoPanel } from './components/zombie/ZombieInfoPanel';
import { QuestPanel } from './components/quest/QuestPanel';
import { ScanView } from './components/scan/ScanView';
import { useGameStore } from './stores/gameStore';
import { getSensorBridge } from './services/sensorBridge';
import type { GameEvent } from './types';

// Toast messages with emoji animations
const toastConfig: Record<string, { message: string, icon: string, color: string }> = {
    zombie_spawned: { message: 'A zombie has appeared!', icon: '🧟', color: '#EF4444' },
    zombie_defeated: { message: 'Zombie defeated! +50 coins', icon: '⚔️', color: '#22C55E' },
    quest_completed: { message: 'Quest completed!', icon: '🎉', color: '#FBBF24' },
    plant_touched: { message: 'Plant says hello! +15 coins', icon: '🤗', color: '#F472B6' },
    shield_built: { message: 'Shield strength increasing!', icon: '🛡️', color: '#38BDF8' },
    plant_added: { message: 'New plant added to garden!', icon: '🌱', color: '#22C55E' },
    coins_earned: { message: 'Coins earned!', icon: '🪙', color: '#FBBF24' },
};

function GameToast({ event }: { event: GameEvent }) {
    const [visible, setVisible] = useState(true);
    const config = toastConfig[event.type] || { message: 'Something happened!', icon: '✨', color: '#3B82F6' };

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="game-toast" style={{ borderLeftColor: config.color }}>
            <span className="toast-icon">{config.icon}</span>
            <span>{config.message}</span>
        </div>
    );
}

// Demo control panel
function DemoControls({ sensorConnection, onConnectSim, onConnectBLE, onDisconnect, onTouch, onMoisture }: {
    sensorConnection: string;
    onConnectSim: () => void;
    onConnectBLE: () => void;
    onDisconnect: () => void;
    onTouch: () => void;
    onMoisture: (trend: 'stable' | 'rising' | 'falling') => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`demo-controls ${expanded ? 'expanded' : ''}`}>
            <button className="demo-toggle" onClick={() => setExpanded(!expanded)}>
                {expanded ? '✕' : '🎮'}
            </button>
            {expanded && (
                <div className="demo-panel">
                    <div className="demo-title">Demo Controls</div>
                    {sensorConnection === 'disconnected' ? (
                        <div className="demo-group">
                            <button className="demo-btn primary" onClick={onConnectSim}>
                                <span>🎮</span> Start Demo
                            </button>
                            <button className="demo-btn" onClick={onConnectBLE}>
                                <span>📡</span> Real Sensor
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="demo-group">
                                <button className="demo-btn success" onClick={onTouch}>
                                    <span>👆</span> Touch Plant
                                </button>
                            </div>
                            <div className="demo-group">
                                <div className="demo-label">Moisture Simulation</div>
                                <button className="demo-btn danger" onClick={() => onMoisture('rising')}>
                                    <span>💧</span> Overwater
                                </button>
                                <button className="demo-btn warning" onClick={() => onMoisture('falling')}>
                                    <span>🏜️</span> Dry Out
                                </button>
                                <button className="demo-btn success" onClick={() => onMoisture('stable')}>
                                    <span>✅</span> Healthy
                                </button>
                            </div>
                            <div className="demo-group">
                                <button className="demo-btn" onClick={onDisconnect}>
                                    <span>⏹️</span> Stop Demo
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export function App() {
    const activePanel = useGameStore(s => s.activePanel);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const gameEvents = useGameStore(s => s.gameEvents);
    const sensorConnection = useGameStore(s => s.sensorConnection);
    const setSensorConnection = useGameStore(s => s.setSensorConnection);

    const latestEvent = gameEvents[gameEvents.length - 1];
    const [toastEvent, setToastEvent] = useState<GameEvent | null>(null);

    // Show toast for new events
    useEffect(() => {
        if (latestEvent) {
            setToastEvent(latestEvent);
            const timer = setTimeout(() => setToastEvent(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [latestEvent]);

    // Demo controls
    const handleConnectSimulator = () => {
        const bridge = getSensorBridge();
        bridge.connectSimulator();
        setSensorConnection('connected_simulated');
    };

    const handleConnectBLE = async () => {
        const bridge = getSensorBridge();
        const state = await bridge.connect();
        setSensorConnection(state);
    };

    const handleSimulateTouch = () => {
        const bridge = getSensorBridge();
        bridge.simulateTouch();
    };

    const handleMoistureTrend = (trend: 'stable' | 'rising' | 'falling') => {
        const bridge = getSensorBridge();
        bridge.setMoistureTrend(trend);
    };

    const handleDisconnect = () => {
        const bridge = getSensorBridge();
        bridge.disconnect();
        setSensorConnection('disconnected');
    };

    return (
        <div className="game-container">
            {/* 3D Garden (fullscreen) */}
            <GardenScene />

            {/* Sensor → Game Event Bridge */}
            <SensorOverlay />

            {/* HUD Overlay */}
            <GardenHUD />

            {/* Add Plant Button */}
            <button className="add-plant-btn" onClick={() => setActivePanel('scan')}>
                <span className="add-icon">+</span>
                <span className="add-label">Add Plant</span>
            </button>

            {/* Game Toast */}
            {toastEvent && <GameToast event={toastEvent} />}

            {/* Panels */}
            {activePanel === 'plant_detail' && <PlantDetailPanel />}
            {activePanel === 'plant_chat' && <PlantChat />}
            {activePanel === 'zombie_info' && <ZombieInfoPanel />}
            {activePanel === 'quest_list' && <QuestPanel />}
            {activePanel === 'scan' && <ScanView />}

            {/* Demo Controls */}
            <DemoControls
                sensorConnection={sensorConnection}
                onConnectSim={handleConnectSimulator}
                onConnectBLE={handleConnectBLE}
                onDisconnect={handleDisconnect}
                onTouch={handleSimulateTouch}
                onMoisture={handleMoistureTrend}
            />
        </div>
    );
}
