// Plantasia: Guardians — Plant Detail Panel
import { useGameStore } from '../../stores/gameStore';
import { colors } from '../../constants/colors';
import { zombieTemplates } from '../../constants/zombies';
import type { CareTask } from '../../types';
import {
    Heart,
    AlertTriangle,
    Swords,
    HeartCrack,
    Ghost,
    Leaf,
    Droplets,
    MessageCircle,
    Stethoscope,
    Shield,
    Star,
    Smile,
    X,
    Camera,
    Flame,
    ClipboardCheck,
    Skull,
} from 'lucide-react';
import { useEffect } from 'react';

const statusIcons: Record<string, typeof Heart> = {
    healthy: Heart,
    threatened: AlertTriangle,
    in_battle: Swords,
    damaged: HeartCrack,
    dead: Ghost,
};

const statusColors: Record<string, string> = {
    healthy: '#22C55E',
    threatened: '#F59E0B',
    in_battle: '#EF4444',
    damaged: '#9CA3AF',
    dead: '#6B7280',
};

// Generate care tasks based on sensor data
function generateCareTasks(plantId: string, moisture: number | null): CareTask[] {
    const tasks: CareTask[] = [];

    if (moisture !== null && moisture < 30) {
        tasks.push({
            id: `care_water_${plantId}`,
            plantId,
            title: '💧 Water Your Plant',
            description: `Soil is at ${moisture}% — aim for 40-60%`,
            coins: 15,
            completed: false,
            zombieType: 'thirster',
            sensorDriven: true,
        });
    }

    if (moisture !== null && moisture > 75) {
        tasks.push({
            id: `care_drain_${plantId}`,
            plantId,
            title: '🚰 Check Drainage',
            description: `Soil is at ${moisture}% — that's too wet!`,
            coins: 15,
            completed: false,
            zombieType: 'drownface',
            sensorDriven: true,
        });
    }

    // Weekly tasks (always show)
    tasks.push({
        id: `care_pest_${plantId}`,
        plantId,
        title: '🔍 Pest Check',
        description: 'Look under leaves for tiny bugs or webs',
        coins: 10,
        completed: false,
        zombieType: 'the_swarm',
        sensorDriven: false,
    });

    tasks.push({
        id: `care_light_${plantId}`,
        plantId,
        title: '☀️ Check Light Exposure',
        description: 'Make sure your plant has the right amount of light',
        coins: 10,
        completed: false,
        zombieType: 'sunscorch',
        sensorDriven: false,
    });

    return tasks;
}

export function PlantDetailPanel() {
    const selectedPlantId = useGameStore(s => s.selectedPlantId);
    const plants = useGameStore(s => s.plants);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const selectPlant = useGameStore(s => s.selectPlant);
    const sensorData = useGameStore(s => s.sensorData);
    const setSelectedCheckInPlant = useGameStore(s => s.setSelectedCheckInPlant);
    const careTasks = useGameStore(s => s.careTasks);
    const setCareTasks = useGameStore(s => s.setCareTasks);
    const completeCareTask = useGameStore(s => s.completeCareTask);

    const plant = plants.find(p => p.id === selectedPlantId);

    // Generate care tasks when plant is selected
    useEffect(() => {
        if (plant) {
            const tasks = generateCareTasks(plant.id, sensorData?.soilMoisture ?? null);
            setCareTasks(tasks);
        }
    }, [plant?.id, sensorData?.soilMoisture, plant, setCareTasks]);

    if (!plant) return null;

    const handleChat = () => setActivePanel('plant_chat');
    const handleClose = () => { selectPlant(null); setActivePanel('none'); };
    const handleCheckIn = () => {
        setSelectedCheckInPlant(plant.id);
        setActivePanel('daily_checkin');
    };

    const StatusIcon = statusIcons[plant.healthStatus] || Heart;
    const statusColor = statusColors[plant.healthStatus] || '#22C55E';
    const personalityColor = colors.personality[plant.personality.type] || '#3B82F6';

    const moisture = sensorData?.soilMoisture ?? null;
    const moistureColor = moisture
        ? moisture > 80 ? colors.sensor.moistureHigh
            : moisture < 20 ? colors.sensor.moistureLow
                : colors.sensor.moistureOk
        : '#9CA3AF';

    const plantTasks = careTasks.filter(t => t.plantId === plant.id);

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>
                        <StatusIcon size={20} color={statusColor} />
                        {plant.nickname}
                    </h2>
                    <button className="panel-close" onClick={handleClose}><X size={16} /></button>
                </div>
                <div className="panel-body">
                    {/* Plant Info */}
                    <div className="plant-detail-header">
                        <div className="plant-avatar-circle" style={{ background: `${plant.avatarColor}22`, border: `3px solid ${plant.avatarColor}` }}>
                            <Leaf size={28} color={plant.avatarColor} />
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

                    {/* Streak & Last Check-In */}
                    {plant.streak > 0 && (
                        <div className="plant-streak-bar">
                            <Flame size={16} color="#F59E0B" />
                            <span>{plant.streak} day streak!</span>
                            {plant.lastCheckIn && (
                                <span className="last-checkin-date">
                                    Last: {new Date(plant.lastCheckIn).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="plant-stats">
                        <div className="stat-card">
                            <div className="stat-icon"><Star size={16} color={colors.plant.healthy} /></div>
                            <div className="stat-value" style={{ color: colors.plant.healthy }}>Lv.{plant.level}</div>
                            <div className="stat-label">Level</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><Star size={16} color="#F59E0B" /></div>
                            <div className="stat-value" style={{ color: '#F59E0B' }}>{plant.xp}</div>
                            <div className="stat-label">XP</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><Smile size={16} color="#F87171" /></div>
                            <div className="stat-value" style={{ color: '#F87171' }}>{plant.happiness}%</div>
                            <div className="stat-label">Happy</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><Shield size={16} color="#38BDF8" /></div>
                            <div className="stat-value" style={{ color: '#38BDF8' }}>{plant.shieldStrength}%</div>
                            <div className="stat-label">Shield</div>
                        </div>
                    </div>

                    {/* Moisture Bar */}
                    {moisture !== null && (
                        <div style={{ marginTop: '12px' }}>
                            <div className="moisture-label">
                                <Droplets size={14} color={moistureColor} /> Soil Moisture: {moisture}%
                            </div>
                            <div className="moisture-bar">
                                <div className="moisture-fill" style={{
                                    width: `${moisture}%`,
                                    backgroundColor: moistureColor,
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Care Tasks */}
                    {plantTasks.length > 0 && (
                        <div className="care-tasks-section">
                            <div className="section-label">
                                <ClipboardCheck size={14} /> Care Tasks
                            </div>
                            {plantTasks.map(task => {
                                const zombieInfo = zombieTemplates[task.zombieType];
                                return (
                                    <div key={task.id} className={`care-task-card ${task.completed ? 'completed' : ''}`}>
                                        <div className="care-task-main">
                                            <button
                                                className="care-task-check"
                                                onClick={() => completeCareTask(task.id)}
                                                disabled={task.completed}
                                            >
                                                {task.completed ? '✓' : '○'}
                                            </button>
                                            <div className="care-task-text">
                                                <div className="care-task-title">{task.title}</div>
                                                <div className="care-task-desc">{task.description}</div>
                                            </div>
                                            <span className="care-task-coins">+{task.coins}</span>
                                        </div>
                                        {!task.completed && (
                                            <div className="care-task-zombie-warning" style={{ color: zombieInfo?.color }}>
                                                <Skull size={12} />
                                                <span>Neglect spawns <strong>{zombieInfo?.name}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                        <button className="action-btn checkin" onClick={handleCheckIn}>
                            <Camera size={16} /> Daily Check-In
                        </button>
                        <button className="action-btn primary" onClick={handleChat}>
                            <MessageCircle size={16} /> Chat
                        </button>
                        <button className="action-btn secondary" onClick={() => setActivePanel('health_check')}>
                            <Stethoscope size={16} /> Health Check
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

