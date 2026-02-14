// Plantasia: Guardians — Zombie Info Panel
import { useGameStore } from '../../stores/gameStore';
import {
    Skull,
    Microscope,
    HelpCircle,
    AlertTriangle,
    Dna,
    Swords,
    BookOpen,
    Star,
    X,
} from 'lucide-react';

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
                    <h2><Skull size={22} /> Zombie Alert!</h2>
                    <button className="panel-close" onClick={handleClose}><X size={16} /></button>
                </div>
                <div className="panel-body">
                    {/* Zombie Header */}
                    <div className="zombie-header">
                        <div className="zombie-avatar" style={{ background: `${zombie.color}20`, border: `3px solid ${zombie.color}` }}>
                            <Skull size={32} color={zombie.color} />
                        </div>
                        <div>
                            <div className="zombie-name" style={{ color: zombie.color }}>{zombie.name}</div>
                            <div className="zombie-subtitle">{zombie.subtitle}</div>
                            <div className="threat-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < zombie.threatLevel ? '#FBBF24' : 'none'}
                                        color={i < zombie.threatLevel ? '#FBBF24' : '#D1D5DB'}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Disease Info */}
                    <div className="lore-section">
                        <h4><Microscope size={16} /> What is it?</h4>
                        <p style={{ fontSize: '1.02rem', lineHeight: 1.55 }}>{zombie.lore.whatIsIt}</p>
                    </div>

                    <div className="lore-section">
                        <h4><HelpCircle size={16} /> Why does it happen?</h4>
                        <p style={{ fontSize: '1.02rem', lineHeight: 1.55 }}>{zombie.lore.whyItHappens}</p>
                    </div>

                    {/* Early Warnings */}
                    <div className="lore-section">
                        <h4><AlertTriangle size={16} /> Early Warning Signs</h4>
                        <ul style={{ paddingLeft: '16px', fontSize: '1rem', lineHeight: 1.8 }}>
                            {zombie.lore.earlyWarnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Science Section */}
                    <div className="edu-card">
                        <div className="edu-card-title"><Dna size={16} /> The Science</div>
                        <p>{zombie.lore.science}</p>
                    </div>

                    {/* Defeat Steps */}
                    <div style={{ marginTop: '16px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Swords size={18} /> How to Defeat {zombie.name}
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
                        style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem', gap: '8px' }}
                        onClick={handleDefeat}
                    >
                        <Swords size={18} /> Mark as Defeated (+50 coins)
                    </button>

                    {/* Backstory */}
                    <div className="lore-section" style={{ marginTop: '16px' }}>
                        <h4><BookOpen size={16} /> Backstory</h4>
                        <p style={{ fontSize: '1rem', lineHeight: 1.55, fontStyle: 'italic' }}>{zombie.lore.backstory}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
