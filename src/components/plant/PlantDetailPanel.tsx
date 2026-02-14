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
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{plant.commonName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic' }}>{plant.species}</div>
                            <div style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                marginTop: '4px',
                                background: `${personalityColor}15`,
                                color: personalityColor,
                                border: `1px solid ${personalityColor}30`,
                            }}>
                                {plant.personality.type} personality
                            </div>
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
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
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
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>
                            Quirks
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {plant.personality.quirks.map((q, i) => (
                                <span key={i} style={{
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    background: 'rgba(0,0,0,0.04)',
                                }}>
                                    {q}
                                </span>
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
