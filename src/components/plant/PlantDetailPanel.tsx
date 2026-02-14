// Plantasia: Guardians — Plant Detail Panel
import { useGameStore } from '../../stores/gameStore';
import { colors } from '../../constants/colors';

export function PlantDetailPanel() {
    const selectedPlantId = useGameStore(s => s.selectedPlantId);
    const plants = useGameStore(s => s.plants);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const selectPlant = useGameStore(s => s.selectPlant);
    const sensorData = useGameStore(s => s.sensorData);

    const plant = plants.find(p => p.id === selectedPlantId);
    if (!plant) return null;

    const handleChat = () => setActivePanel('plant_chat');
    const handleClose = () => { selectPlant(null); setActivePanel('none'); };

    const statusEmoji = {
        healthy: '💚', threatened: '⚠️', in_battle: '⚔️', damaged: '💔', dead: '👻'
    };

    const personalityColor = colors.personality[plant.personality.type] || '#3B82F6';

    const moisture = sensorData?.soilMoisture ?? null;
    const moistureColor = moisture
        ? moisture > 80 ? colors.sensor.moistureHigh
            : moisture < 20 ? colors.sensor.moistureLow
                : colors.sensor.moistureOk
        : '#9CA3AF';

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>{statusEmoji[plant.healthStatus]} {plant.nickname}</h2>
                    <button className="panel-close" onClick={handleClose}>✕</button>
                </div>
                <div className="panel-body">
                    {/* Plant Info */}
                    <div className="plant-detail-header">
                        <div className="plant-avatar-circle" style={{ background: `${plant.avatarColor}22`, border: `3px solid ${plant.avatarColor}` }}>
                            🌿
                        </div>
                        <div>
                            <div className="plant-common-name">{plant.commonName}</div>
                            <div className="plant-species-name">{plant.species}</div>
                            <span
                                className="personality-badge"
                                style={{
                                    background: `${personalityColor}15`,
                                    color: personalityColor,
                                    border: `1px solid ${personalityColor}30`,
                                }}
                            >
                                {plant.personality.type} personality
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="plant-stats">
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: colors.plant.healthy }}>Lv.{plant.level}</div>
                            <div className="stat-label">Level</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#F59E0B' }}>{plant.xp}</div>
                            <div className="stat-label">XP</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#F87171' }}>{plant.happiness}%</div>
                            <div className="stat-label">Happy</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#38BDF8' }}>{plant.shieldStrength}%</div>
                            <div className="stat-label">Shield</div>
                        </div>
                    </div>

                    {/* Moisture Bar */}
                    {moisture !== null && (
                        <div style={{ marginTop: '12px' }}>
                            <div className="moisture-label">
                                💧 Soil Moisture: {moisture}%
                            </div>
                            <div className="moisture-bar">
                                <div className="moisture-fill" style={{
                                    width: `${moisture}%`,
                                    backgroundColor: moistureColor,
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Personality Quirks */}
                    <div style={{ marginTop: '16px' }}>
                        <div className="section-label">Quirks</div>
                        <div className="quirk-container">
                            {plant.personality.quirks.map((q, i) => (
                                <span key={i} className="quirk-tag">{q}</span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="plant-actions">
                        <button className="action-btn primary" onClick={handleChat}>
                            💬 Chat
                        </button>
                        <button className="action-btn secondary" onClick={() => setActivePanel('health_check')}>
                            🩺 Health Check
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
