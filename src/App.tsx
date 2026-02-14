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

function GameToast({ event }: { event: GameEvent }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    const messages: Record<string, string> = {
        zombie_spawned: '🧟 A zombie has appeared!',
        zombie_defeated: '⚔️ Zombie defeated! +50 coins',
        quest_completed: '🎉 Quest completed!',
        plant_touched: '🤗 Plant says hello! +15 coins',
        shield_built: '🛡️ Shield strength increasing!',
        plant_added: '🌱 New plant added to garden!',
        coins_earned: '🪙 Coins earned!',
    };

    return (
        <div className="game-toast">
            {messages[event.type] || '✨ Something happened!'}
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
            const timer = setTimeout(() => setToastEvent(null), 3500);
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
                +
            </button>

            {/* Game Toast */}
            {toastEvent && <GameToast event={toastEvent} />}

            {/* Panels */}
            {activePanel === 'plant_detail' && <PlantDetailPanel />}
            {activePanel === 'plant_chat' && <PlantChat />}
            {activePanel === 'zombie_info' && <ZombieInfoPanel />}
            {activePanel === 'quest_list' && <QuestPanel />}
            {activePanel === 'scan' && <ScanView />}

            {/* Demo Controls (bottom-left) */}
            <div className="demo-controls">
                {sensorConnection === 'disconnected' ? (
                    <>
                        <button className="demo-btn" onClick={handleConnectSimulator}>
                            🎮 Start Simulator
                        </button>
                        <button className="demo-btn" onClick={handleConnectBLE}>
                            📡 Connect Real Sensor
                        </button>
                    </>
                ) : (
                    <>
                        <button className="demo-btn" onClick={handleSimulateTouch}>
                            👆 Simulate Touch
                        </button>
                        <button className="demo-btn" onClick={() => handleMoistureTrend('rising')}>
                            💧 Overwater (Drownface)
                        </button>
                        <button className="demo-btn" onClick={() => handleMoistureTrend('falling')}>
                            🏜️ Dry Out (Thirster)
                        </button>
                        <button className="demo-btn" onClick={() => handleMoistureTrend('stable')}>
                            ✅ Healthy Moisture
                        </button>
                        <button className="demo-btn" onClick={handleDisconnect}>
                            ⏹️ Disconnect
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
