// Plantasia: Guardians — Garden HUD Overlay
// Bubble-free design: text with contrast, Lucide icons, no emojis
import { useGameStore } from '../../stores/gameStore';
import { getSensorBridge } from '../../services/sensorBridge';
import {
    Leaf,
    Coins,
    Scroll,
    ShieldAlert,
    Wifi,
    WifiOff,
    Radio,
    Droplets,
    ShoppingBag,
    Bluetooth,
    AlertTriangle,
    Camera,
} from 'lucide-react';

// SVG arc gauge for quest progress
function QuestGauge({ completed, total, color, onClick }: { completed: number; total: number; color?: string; onClick: () => void }) {
    const radius = 20;
    const stroke = 3.5;
    const circumference = 2 * Math.PI * radius;
    const progress = total > 0 ? completed / total : 0;
    const dashOffset = circumference * (1 - progress);

    return (
        <button className="quest-gauge" onClick={onClick} title="View quests">
            <svg viewBox="0 0 48 48" className="gauge-ring">
                <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
                <circle
                    cx="24" cy="24" r={radius}
                    fill="none" stroke={color || "#A7F3D0"} strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 24 24)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 4px rgba(167,243,208,0.5))' }}
                />
            </svg>
            <Scroll size={18} className="gauge-icon" />
            <span className="gauge-fraction">{completed}/{total}</span>
        </button>
    );
}

export function GardenHUD() {
    const coins = useGameStore(s => s.coins);
    const quests = useGameStore(s => s.quests);
    const zombies = useGameStore(s => s.zombies);
    const sensorConnection = useGameStore(s => s.sensorConnection);
    const sensorData = useGameStore(s => s.sensorData);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const selectZombie = useGameStore(s => s.selectZombie);

    const activeQuest = quests.find(q => q.active && !q.completed);
    const nextQuest = quests.find(q => !q.completed);
    const displayQuest = activeQuest || nextQuest;

    const completedSteps = displayQuest?.steps.filter(s => s.completed).length || 0;
    const totalSteps = displayQuest?.steps.length || 0;
    const activeZombiesList = zombies.filter(z => z.state !== 'defeated');

    // Split quests
    const emergencyQuest = quests.find(q => q.active && q.type === 'battle');
    const dailyQuest = quests.find(q => !q.completed && q.type !== 'battle');

    const showEmergency = !!emergencyQuest;
    const showDaily = !!dailyQuest;

    const sensorClass = sensorConnection === 'connected_real' ? 'connected'
        : sensorConnection === 'connected_simulated' ? 'simulated'
            : 'disconnected';

    const moisture = sensorData?.soilMoisture ?? null;
    const moistureStatus = moisture !== null
        ? moisture > 80 ? 'wet' : moisture < 20 ? 'dry' : 'good'
        : null;

    const SensorIcon = sensorConnection === 'disconnected' ? WifiOff
        : sensorConnection === 'connected_real' ? Wifi : Radio;

    return (
        <div className="hud">
            {/* ─── Top-left: Title + Coins ─── */}
            <div className="hud-top-left">
                <div className="hud-logo-container">
                    <img
                        src="/imgs/logo.png"
                        alt="Logo"
                        style={{
                            height: '36px',
                            width: '36px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="hud-logo-text">
                        <h1 className="hud-game-name">PLANTASIA</h1>
                        <span className="hud-game-sub">GUARDIANS</span>
                    </div>
                </div>
                <div className="hud-coins">
                    <Coins size={20} strokeWidth={2.5} className="hud-coin-icon" />
                    <span className="hud-coin-value">{coins}</span>
                </div>
            </div>

            {/* ─── Priority Banner (Center Top) ─── */}
            {emergencyQuest && (
                <div className="hud-priority-banner" onClick={() => setActivePanel('quest_list')}>
                    <div className="banner-pulse" />
                    <AlertTriangle size={16} fill="white" stroke="#EF4444" />
                    <span>DEFEND GARDEN!</span>
                </div>
            )}

            {/* ─── Top-right: Shop + Sensor ─── */}
            <div className="hud-top-right">
                <button className="hud-shop-btn" onClick={() => setActivePanel('scan')} title="Scan Plant" style={{ marginRight: '8px', background: 'rgba(255,255,255,0.2)' }}>
                    <Camera size={20} strokeWidth={2.5} />
                </button>
                <button className="hud-shop-btn" onClick={() => setActivePanel('shop')} title="Shop">
                    <ShoppingBag size={20} strokeWidth={2.5} />
                </button>
                {sensorConnection === 'disconnected' && (
                    <button className="hud-pair-btn" onClick={() => setActivePanel('sensor_pair')} title="Pair Sensor">
                        <Bluetooth size={18} strokeWidth={2.5} />
                    </button>
                )}
                <div className={`hud-sensor ${sensorClass}`}>
                    <SensorIcon size={18} strokeWidth={2.5} className="hud-sensor-icon" />
                    {moisture !== null && sensorConnection !== 'disconnected' && (
                        <div className={`hud-moisture ${moistureStatus}`}>
                            <Droplets size={16} strokeWidth={2.5} />
                            <span>{moisture}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Bottom-left: Garden status ─── */}
            {/* ─── Bottom-left: Garden status ─── */}
            {(showEmergency || showDaily || activeZombiesList.length > 0) && (
                <div className="hud-bottom-left">

                    {/* Emergency Quest (Zombie) */}
                    {emergencyQuest && (
                        <div className="hud-quest emergency" style={{ marginBottom: showDaily ? '12px' : '0' }}>
                            <QuestGauge
                                completed={emergencyQuest.steps.filter(s => s.completed).length}
                                total={emergencyQuest.steps.length}
                                color="#EF4444"
                                onClick={() => setActivePanel('quest_list')}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em' }}>THREAT</span>
                                <button className="hud-quest-label" onClick={() => setActivePanel('quest_list')} style={{ color: '#FECACA' }}>
                                    {emergencyQuest.title}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Daily Quest */}
                    {dailyQuest && (
                        <div className="hud-quest daily">
                            <QuestGauge
                                completed={dailyQuest.steps.filter(s => s.completed).length}
                                total={dailyQuest.steps.length}
                                color="#A7F3D0"
                                onClick={() => setActivePanel('quest_list')}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.05em' }}>DAILY</span>
                                <button className="hud-quest-label" onClick={() => setActivePanel('quest_list')}>
                                    {dailyQuest.title}
                                </button>
                            </div>
                        </div>
                    )}

                    {(showEmergency || showDaily) && activeZombiesList.length > 0 && (
                        <div className="hud-divider" />
                    )}

                    {/* Zombie threats — shows WHO is attacking, not just a count */}
                    {activeZombiesList.length > 0 && (
                        <div className="hud-threat-group">
                            {activeZombiesList.slice(0, 2).map(z => (
                                <button
                                    key={z.id}
                                    className="hud-zombie-chip"
                                    onClick={() => selectZombie(z.id)}
                                >
                                    <span className="hud-zombie-emoji">{z.emoji}</span>
                                    <span className="hud-zombie-name" style={{ color: z.color }}>{z.name}</span>
                                    <ShieldAlert size={16} className="hud-zombie-alert" />
                                </button>
                            ))}
                            <div className="hud-action-hint">
                                Tap a plant to ask for help
                            </div>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
}
