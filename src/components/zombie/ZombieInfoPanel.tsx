// Plantasia: Guardians — Zombie Info Panel
import { useGameStore } from '../../stores/gameStore';

export function ZombieInfoPanel() {
    const selectedZombieId = useGameStore(s => s.selectedZombieId);
    const zombies = useGameStore(s => s.zombies);
    const selectZombie = useGameStore(s => s.selectZombie);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const defeatZombie = useGameStore(s => s.defeatZombie);
    const addCoins = useGameStore(s => s.addCoins);

    const zombie = zombies.find(z => z.id === selectedZombieId);
    if (!zombie) return null;

    const handleClose = () => { selectZombie(null); setActivePanel('none'); };

    const handleDefeat = () => {
        defeatZombie(zombie.id);
        addCoins(50);
        handleClose();
    };

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>{zombie.emoji} Zombie Alert!</h2>
                    <button className="panel-close" onClick={handleClose}>✕</button>
                </div>
                <div className="panel-body">
                    {/* Zombie Header */}
                    <div className="zombie-header">
                        <div className="zombie-avatar" style={{ background: `${zombie.color}20`, border: `3px solid ${zombie.color}` }}>
                            {zombie.emoji}
                        </div>
                        <div>
                            <div className="zombie-name" style={{ color: zombie.color }}>{zombie.name}</div>
                            <div className="zombie-subtitle">{zombie.subtitle}</div>
                            <div className="threat-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ fontSize: '14px' }}>
                                        {i < zombie.threatLevel ? '⭐' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Disease Info */}
                    <div className="lore-section">
                        <h4>🔬 What is it?</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{zombie.lore.whatIsIt}</p>
                    </div>

                    <div className="lore-section">
                        <h4>🤔 Why does it happen?</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{zombie.lore.whyItHappens}</p>
                    </div>

                    {/* Early Warnings */}
                    <div className="lore-section">
                        <h4>⚠️ Early Warning Signs</h4>
                        <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.8 }}>
                            {zombie.lore.earlyWarnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Science Section */}
                    <div className="edu-card">
                        <div className="edu-card-title">🧬 The Science</div>
                        <p>{zombie.lore.science}</p>
                    </div>

                    {/* Defeat Steps */}
                    <div style={{ marginTop: '16px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
                            ⚔️ How to Defeat {zombie.name}
                        </h4>
                        <ul className="defeat-steps">
                            {zombie.defeatSteps.map((step, i) => (
                                <li key={i} className="defeat-step">
                                    <div className="defeat-step-number">{i + 1}</div>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Defeat Button */}
                    <button
                        className="action-btn primary"
                        style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem' }}
                        onClick={handleDefeat}
                    >
                        ⚔️ Mark as Defeated (+50 coins)
                    </button>

                    {/* Backstory */}
                    <div className="lore-section" style={{ marginTop: '16px' }}>
                        <h4>📖 Backstory</h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.5, fontStyle: 'italic' }}>{zombie.lore.backstory}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
