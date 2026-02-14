// Plantasia: Guardians — Check-In Result Screen
import { Heart, AlertTriangle, Coins, Flame, ArrowLeft, Swords } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { zombieTemplates } from '../../constants/zombies';

export function CheckInResult() {
    const result = useGameStore(s => s.lastCheckInResult);
    const selectedCheckInPlantId = useGameStore(s => s.selectedCheckInPlantId);
    const plants = useGameStore(s => s.plants);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const setLastCheckInResult = useGameStore(s => s.setLastCheckInResult);

    const plant = plants.find(p => p.id === selectedCheckInPlantId);

    if (!result || !plant) return null;

    const zombieTemplate = result.zombieType ? zombieTemplates[result.zombieType] : null;

    const handleDone = () => {
        setLastCheckInResult(null);
        setActivePanel('none');
    };

    const handleViewZombie = () => {
        // Find the most recent zombie targeting this plant
        const { zombies, selectZombie } = useGameStore.getState();
        const zombie = zombies.find(z => z.targetPlantId === plant.id && z.state !== 'defeated');
        if (zombie) selectZombie(zombie.id);
        else handleDone();
    };

    return (
        <div className={`checkin-result-overlay ${result.healthy ? 'healthy' : 'unhealthy'}`}>
            <div className="checkin-result-card">
                {/* Header */}
                <div className={`checkin-result-header ${result.healthy ? 'healthy' : 'unhealthy'}`}>
                    <div className="checkin-result-icon">
                        {result.healthy ? <Heart size={48} /> : <AlertTriangle size={48} />}
                    </div>
                    <h2>{result.healthy ? `${plant.nickname} is thriving!` : `Uh oh! ${plant.nickname} needs help!`}</h2>
                    <p className="checkin-result-confidence">
                        {Math.round(result.confidence * 100)}% confidence
                    </p>
                </div>

                {/* Coins earned */}
                <div className="checkin-result-coins">
                    <Coins size={20} />
                    <span>+{result.coins} coins</span>
                    {plant.streak > 1 && (
                        <span className="checkin-streak-badge">
                            <Flame size={14} />
                            {plant.streak} day streak!
                        </span>
                    )}
                </div>

                {/* Tips (healthy path) */}
                {result.healthy && result.tips.length > 0 && (
                    <div className="checkin-result-tips">
                        <h3>Care Tips</h3>
                        {result.tips.map((tip, i) => (
                            <div key={i} className="checkin-tip-card">
                                <span className="tip-number">{i + 1}</span>
                                <p>{tip}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Zombie reveal (unhealthy path) */}
                {!result.healthy && zombieTemplate && (
                    <div className="checkin-result-zombie">
                        <div className="zombie-reveal-card" style={{ borderColor: zombieTemplate.color }}>
                            <div className="zombie-reveal-emoji">{zombieTemplate.emoji}</div>
                            <div className="zombie-reveal-info">
                                <h3 style={{ color: zombieTemplate.color }}>{zombieTemplate.name}</h3>
                                <p className="zombie-reveal-disease">{result.disease || zombieTemplate.disease}</p>
                                <p className="zombie-reveal-explanation">{result.explanation}</p>
                            </div>
                        </div>

                        {result.defeatSteps && result.defeatSteps.length > 0 && (
                            <div className="checkin-defeat-steps">
                                <h4>How to fight back:</h4>
                                {result.defeatSteps.map((step, i) => (
                                    <div key={i} className="defeat-step">
                                        <Swords size={14} />
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="checkin-result-actions">
                    {!result.healthy && zombieTemplate && (
                        <button className="checkin-action-btn fight" onClick={handleViewZombie}>
                            <Swords size={18} />
                            View Zombie
                        </button>
                    )}
                    <button className="checkin-action-btn done" onClick={handleDone}>
                        <ArrowLeft size={18} />
                        Back to Garden
                    </button>
                </div>
            </div>
        </div>
    );
}
