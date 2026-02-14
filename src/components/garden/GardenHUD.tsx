// Plantasia: Guardians — Garden HUD Overlay
import { useGameStore } from '../../stores/gameStore';

export function GardenHUD() {
    const coins = useGameStore(s => s.coins);
    const quests = useGameStore(s => s.quests);
    const sensorConnection = useGameStore(s => s.sensorConnection);
    const sensorData = useGameStore(s => s.sensorData);
    const setActivePanel = useGameStore(s => s.setActivePanel);

    const activeQuest = quests.find(q => q.active && !q.completed);
    const completedSteps = activeQuest?.steps.filter(s => s.completed).length || 0;
    const totalSteps = activeQuest?.steps.length || 0;

    const sensorLabel = sensorConnection === 'connected_real' ? 'Live Sensor'
        : sensorConnection === 'connected_simulated' ? 'Simulated'
            : 'No Sensor';

    const sensorClass = sensorConnection === 'connected_real' ? 'connected'
        : sensorConnection === 'connected_simulated' ? 'simulated'
            : 'disconnected';

    return (
        <div className="hud">
            <div className="hud-left">
                {/* Coin Counter */}
                <div className="coin-counter">
                    <span className="coin-icon">🪙</span>
                    <span>{coins}</span>
                </div>

                {/* Active Quest Indicator */}
                {activeQuest && (
                    <div className="quest-indicator" onClick={() => setActivePanel('quest_list')}>
                        <span>📜</span>
                        <span>{activeQuest.title}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                            {completedSteps}/{totalSteps}
                        </span>
                    </div>
                )}
            </div>

            <div className="hud-right">
                {/* Sensor Status */}
                <div className={`sensor-badge ${sensorClass}`} onClick={() => setActivePanel('quest_list')}>
                    <div className={`sensor-dot ${sensorClass}`} />
                    <span>{sensorLabel}</span>
                    {sensorData && sensorConnection !== 'disconnected' && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                            💧{sensorData.soilMoisture}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
