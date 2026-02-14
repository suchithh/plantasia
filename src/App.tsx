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
import { SensorPairScreen } from './components/sensor/SensorPairScreen';
import { DailyCheckIn } from './components/checkin/DailyCheckIn';
import { CheckInResult } from './components/checkin/CheckInResult';
import { ShopPanel } from './components/shop/ShopPanel';
import { BottomDock } from './components/ui/BottomDock';
import { useGameStore } from './stores/gameStore';
import { getSensorBridge } from './services/sensorBridge';
import type { GameEvent } from './types';
import {
    Skull,
    Swords,
    PartyPopper,
    Heart,
    Shield,
    Sprout,
    Coins,
    Gamepad2,
    Radio,
    Hand,
    Droplets,
    CloudSun,
    CircleCheck,
    CircleStop,
    Plus,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Toast messages with Lucide icons
const toastConfig: Record<string, { message: string, Icon: LucideIcon, color: string }> = {
    zombie_spawned: { message: 'A zombie has appeared!', Icon: Skull, color: '#EF4444' },
    zombie_defeated: { message: 'Zombie defeated! +50 coins', Icon: Swords, color: '#22C55E' },
    quest_completed: { message: 'Quest completed!', Icon: PartyPopper, color: '#FBBF24' },
    plant_touched: { message: 'Plant says hello! +15 coins', Icon: Heart, color: '#F472B6' },
    shield_built: { message: 'Shield strength increasing!', Icon: Shield, color: '#38BDF8' },
    plant_added: { message: 'New plant added to garden!', Icon: Sprout, color: '#22C55E' },
    coins_earned: { message: 'Coins earned!', Icon: Coins, color: '#FBBF24' },
    daily_checkin: { message: 'Daily check-in complete!', Icon: Heart, color: '#22C55E' },
    shop_purchase: { message: 'Item purchased!', Icon: Coins, color: '#FBBF24' },
};

function GameToast({ event }: { event: GameEvent }) {
    const [visible, setVisible] = useState(true);
    const config = toastConfig[event.type] || { message: 'Something happened!', Icon: Sprout, color: '#3B82F6' };

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    const { Icon } = config;

    return (
        <div className="game-toast" style={{ borderLeftColor: config.color }}>
            <span className="toast-icon"><Icon size={18} color={config.color} /></span>
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
                {expanded ? <X size={18} /> : <Gamepad2 size={18} />}
            </button>
            {expanded && (
                <div className="demo-panel">
                    <div className="demo-title">Demo Controls</div>
                    {sensorConnection === 'disconnected' ? (
                        <div className="demo-group">
                            <button className="demo-btn primary" onClick={onConnectSim}>
                                <Gamepad2 size={16} /> Start Demo
                            </button>
                            <button className="demo-btn" onClick={onConnectBLE}>
                                <Radio size={16} /> Real Sensor
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="demo-group">
                                <button className="demo-btn success" onClick={onTouch}>
                                    <Hand size={16} /> Touch Plant
                                </button>
                            </div>
                            <div className="demo-group">
                                <div className="demo-label">Moisture Simulation</div>
                                <button className="demo-btn danger" onClick={() => onMoisture('rising')}>
                                    <Droplets size={16} /> Overwater
                                </button>
                                <button className="demo-btn warning" onClick={() => onMoisture('falling')}>
                                    <CloudSun size={16} /> Dry Out
                                </button>
                                <button className="demo-btn success" onClick={() => onMoisture('stable')}>
                                    <CircleCheck size={16} /> Healthy
                                </button>
                            </div>
                            <div className="demo-group">
                                <button className="demo-btn" onClick={onDisconnect}>
                                    <CircleStop size={16} /> Stop Demo
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

            {/* Bottom Dock — Unified Controls (Only visible when no panel is open) */}
            {activePanel === 'none' && <BottomDock />}

            {/* Game Toast */}
            {toastEvent && <GameToast event={toastEvent} />}

            {/* Panels */}
            {activePanel === 'plant_detail' && <PlantDetailPanel />}
            {activePanel === 'plant_chat' && <PlantChat />}
            {activePanel === 'zombie_info' && <ZombieInfoPanel />}
            {activePanel === 'quest_list' && <QuestPanel />}
            {activePanel === 'scan' && <ScanView />}
            {activePanel === 'sensor_pair' && <SensorPairScreen />}
            {activePanel === 'daily_checkin' && <DailyCheckIn />}
            {activePanel === 'checkin_result' && <CheckInResult />}
            {activePanel === 'shop' && <ShopPanel />}

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
