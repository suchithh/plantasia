// Plantasia: Guardians — Garden HUD Overlay
// Bubble-free design: text with contrast, Lucide icons, no emojis
import { useGameStore } from '../../stores/gameStore';
import {
    Leaf,
    Coins,
    Scroll,
    ShieldAlert,
    Wifi,
    WifiOff,
    Radio,
    Droplets,
} from 'lucide-react';

// SVG arc gauge for quest progress
function QuestGauge({ completed, total, onClick }: { completed: number; total: number; onClick: () => void }) {
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
                    fill="none" stroke="#A7F3D0" strokeWidth={stroke}
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
    const completedSteps = activeQuest?.steps.filter(s => s.completed).length || 0;
    const totalSteps = activeQuest?.steps.length || 0;
    const activeZombiesList = zombies.filter(z => z.state !== 'defeated');

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
                <div className="hud-title">
                    <Leaf size={26} strokeWidth={2.5} className="hud-title-icon" />
                    <div>
                        <h1 className="hud-game-name">Plantasia</h1>
                        <span className="hud-game-sub">Guardians</span>
                    </div>
                </div>
                <div className="hud-coins">
                    <Coins size={20} strokeWidth={2.5} className="hud-coin-icon" />
                    <span className="hud-coin-value">{coins}</span>
                </div>
            </div>

            {/* ─── Top-right: Sensor ─── */}
            <div className="hud-top-right">
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
            <div className="hud-bottom-left">
                {/* Active quest progress */}
                {activeQuest && (
                    <div className="hud-quest">
                        <QuestGauge
                            completed={completedSteps}
                            total={totalSteps}
                            onClick={() => setActivePanel('quest_list')}
                        />
                        <button className="hud-quest-label" onClick={() => setActivePanel('quest_list')}>
                            {activeQuest.title}
                        </button>
                    </div>
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
        </div>
    );
}
