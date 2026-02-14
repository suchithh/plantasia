// Plantasia: Guardians — Garden HUD Overlay
import { useGameStore } from '../../stores/gameStore';

export function GardenHUD() {
    const coins = useGameStore(s => s.coins);
    const quests = useGameStore(s => s.quests);
    const zombies = useGameStore(s => s.zombies);
    const sensorConnection = useGameStore(s => s.sensorConnection);
    const sensorData = useGameStore(s => s.sensorData);
    const setActivePanel = useGameStore(s => s.setActivePanel);

    const activeQuest = quests.find(q => q.active && !q.completed);
    const completedSteps = activeQuest?.steps.filter(s => s.completed).length || 0;
    const totalSteps = activeQuest?.steps.length || 0;

    const activeZombies = zombies.filter(z => z.state !== 'defeated').length;

    const sensorLabel = sensorConnection === 'connected_real' ? 'Live'
        : sensorConnection === 'connected_simulated' ? 'Demo'
            : 'Offline';

    const sensorClass = sensorConnection === 'connected_real' ? 'connected'
        : sensorConnection === 'connected_simulated' ? 'simulated'
            : 'disconnected';

    const moisture = sensorData?.soilMoisture ?? null;
    const moistureStatus = moisture !== null
        ? moisture > 80 ? 'wet'
            : moisture < 20 ? 'dry'
                : 'good'
        : null;

    return (
        <div className="hud">
            <div className="hud-left">
                {/* Game Logo */}
                <div className="game-logo">
                    <span className="logo-emoji">🌿</span>
                    <div className="logo-text">
                        <span className="logo-title">Plantasia</span>
                        <span className="logo-subtitle">Guardians</span>
                    </div>
                </div>

                {/* Coin Counter */}
                <div className="coin-counter">
                    <span className="coin-icon">🪙</span>
                    <span className="coin-value">{coins}</span>
                </div>

                {/* Active Quest Indicator */}
                {activeQuest && (
                    <div className="quest-indicator" onClick={() => setActivePanel('quest_list')}>
                        <span className="quest-icon">📜</span>
                        <div className="quest-info">
                            <span className="quest-title">{activeQuest.title}</span>
                            <div className="quest-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                    />
                                </div>
                                <span className="progress-text">{completedSteps}/{totalSteps}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Zombie Alert */}
                {activeZombies > 0 && (
                    <div className="zombie-alert">
                        <span className="alert-icon">🧟</span>
                        <span className="alert-text">{activeZombies} threat{activeZombies > 1 ? 's' : ''} nearby!</span>
                    </div>
                )}
            </div>

            <div className="hud-right">
                {/* Sensor Status */}
                <div className={`sensor-badge ${sensorClass}`}>
                    <div className={`sensor-dot ${sensorClass}`} />
                    <div className="sensor-info">
                        <span className="sensor-label">{sensorLabel}</span>
                        {moisture !== null && sensorConnection !== 'disconnected' && (
                            <div className={`moisture-display ${moistureStatus}`}>
                                <span className="moisture-icon">💧</span>
                                <span className="moisture-value">{moisture}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
