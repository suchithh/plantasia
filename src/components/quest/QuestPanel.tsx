// Plantasia: Guardians — Quest Panel
import { useGameStore } from '../../stores/gameStore';
import { Scroll, Coins, Star, Lightbulb, Check, Trophy, X, Swords, ChevronRight, ShieldAlert, Leaf } from 'lucide-react';

export function QuestPanel() {
    const quests = useGameStore(s => s.quests);
    const zombies = useGameStore(s => s.zombies);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const activateQuest = useGameStore(s => s.activateQuest);
    const completeQuestStep = useGameStore(s => s.completeQuestStep);
    const completeQuest = useGameStore(s => s.completeQuest);

    const handleClose = () => setActivePanel('none');

    const activeQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    // Split active requests
    const emergencyQuests = activeQuests.filter(q => q.type === 'battle');
    const dailyQuests = activeQuests.filter(q => q.type !== 'battle');

    const handleStepToggle = (questId: string, stepId: string) => {
        // Only allow manual toggling if no action is defined
        const quest = quests.find(q => q.id === questId);
        const step = quest?.steps.find(s => s.id === stepId);

        if (step && !step.action) {
            completeQuestStep(questId, stepId);
        }
    };

    const renderQuestCard = (quest: any, variant: 'emergency' | 'daily') => {
        const completedCount = quest.steps.filter((s: any) => s.completed).length;
        const progress = quest.steps.length > 0 ? completedCount / quest.steps.length : 0;
        const isEmergency = variant === 'emergency';
        const targetZombie = quest.type === 'battle' && quest.zombieId
            ? zombies.find(z => z.id === quest.zombieId)
            : null;

        return (
            <div key={quest.id} className={`quest-card ${quest.active ? 'active' : ''} ${isEmergency ? 'emergency-card' : ''}`}
                style={isEmergency ? { borderColor: '#F87171', background: 'rgba(239, 68, 68, 0.1)' } : {}}>
                {/* Quest header with type badge */}
                <div className="quest-header-row">
                    <div className={`quest-type-badge ${quest.type}`} style={isEmergency ? { background: '#EF4444', color: 'white' } : {}}>
                        {quest.type === 'battle' ? <Swords size={14} /> : <Scroll size={14} />}
                        <span>{quest.type.toUpperCase()}</span>
                    </div>
                    {quest.active && (
                        <div className="quest-progress-pill">
                            {completedCount}/{quest.steps.length}
                        </div>
                    )}
                </div>



                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {targetZombie && (
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            background: `${targetZombie.color}20`,
                            border: `2px solid ${targetZombie.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>{targetZombie.emoji}</span>
                        </div>
                    )}
                    <div>
                        <div className="quest-title" style={isEmergency ? { color: '#991B1B' } : { color: '#111827' }}>
                            {targetZombie ? `Defeat ${targetZombie.name}` : quest.title}
                        </div>
                        {targetZombie && (
                            <div style={{ fontSize: '0.8rem', color: targetZombie.color, fontWeight: 700, textTransform: 'uppercase' }}>
                                {targetZombie.subtitle}
                            </div>
                        )}
                    </div>
                </div>

                <div className="quest-desc" style={isEmergency ? { color: '#7F1D1D' } : { color: '#374151' }}>{quest.description}</div>

                {/* Steps as timeline */}
                <div className="quest-timeline">
                    {quest.steps.map((step: any, i: number) => (
                        <div
                            key={step.id}
                            className={`quest-timeline-step ${step.completed ? 'done' : ''} ${!step.completed && i === completedCount ? 'current' : ''}`}
                            onClick={() => !step.completed && handleStepToggle(quest.id, step.id)}
                            style={{ cursor: step.completed || step.action ? 'default' : 'pointer' }}
                        >
                            <div className="quest-timeline-track">
                                <div className={`quest-timeline-dot ${step.completed ? 'done' : ''}`}
                                    style={isEmergency && !step.completed ? { borderColor: '#EF4444' } : {}}>
                                    {step.completed && <Check size={10} strokeWidth={3} />}
                                </div>
                                {i < quest.steps.length - 1 && (
                                    <div className={`quest-timeline-line ${step.completed ? 'done' : ''}`} />
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className={`quest-timeline-text ${step.completed ? 'completed' : ''}`}
                                    style={isEmergency && !step.completed ? { color: '#7F1D1D' } : { color: step.completed ? '#6B7280' : '#111827' }}>
                                    {step.description}
                                </span>
                                {step.subtitle && !step.completed && (
                                    <span className="quest-timeline-sub" style={{ fontSize: '0.75rem', color: isEmergency ? '#B91C1C' : '#6B7280', fontStyle: 'italic' }}>
                                        {step.subtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                {
                    quest.active && (
                        <div className="quest-progress-bar">
                            <div className="quest-progress-fill"
                                style={{ width: `${progress * 100}%`, background: isEmergency ? '#EF4444' : 'var(--primary)' }} />
                        </div>
                    )
                }

                {/* Rewards as chips */}
                <div className="quest-reward-chips">
                    <span className="quest-chip coins">
                        <Coins size={13} /> {quest.reward.coins}
                    </span>
                    <span className="quest-chip xp">
                        <Star size={13} /> {quest.reward.xp} XP
                    </span>
                    {quest.reward.trophy && (
                        <span className="quest-chip trophy">
                            <Trophy size={13} /> {quest.reward.trophy}
                        </span>
                    )}
                </div>

                {/* Activate if not active */}
                {
                    !quest.active && (
                        <button
                            className="quest-activate-btn"
                            onClick={() => activateQuest(quest.id)}
                            style={isEmergency ? { background: '#EF4444', color: 'white' } : {}}
                        >
                            Begin Defense <ChevronRight size={16} />
                        </button>
                    )
                }
            </div >
        );
    };

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel quest-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2><Scroll size={22} /> Quests</h2>
                    <button className="panel-close" onClick={handleClose}><X size={16} /></button>
                </div>
                <div className="panel-body">
                    {/* Emergency Quests (Red) */}
                    {emergencyQuests.length > 0 && (
                        <div className="quest-section emergency" style={{ marginBottom: '24px' }}>
                            <h3 className="section-title" style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <ShieldAlert size={18} /> Active Threats
                            </h3>
                            {emergencyQuests.map(quest => renderQuestCard(quest, 'emergency'))}
                        </div>
                    )}

                    {/* Daily Quests (Blue/Green) */}
                    {dailyQuests.length > 0 && (
                        <div className="quest-section daily">
                            <h3 className="section-title" style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Leaf size={18} /> Daily Care
                            </h3>
                            {dailyQuests.map(quest => renderQuestCard(quest, 'daily'))}
                        </div>
                    )}

                    {activeQuests.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Trophy size={32} /></div>
                            <div className="empty-state-title">All quests completed!</div>
                            <div className="empty-state-sub">Check back later for new challenges.</div>
                        </div>
                    )}

                    {/* Completed Quests */}
                    {completedQuests.length > 0 && (
                        <>
                            <div className="completed-header" style={{ marginTop: '24px' }}>
                                Completed ({completedQuests.length})
                            </div>
                            {completedQuests.map(quest => (
                                <div key={quest.id} className="quest-card completed">
                                    <div className="quest-title">{quest.title}</div>
                                    <div className="quest-reward-chips">
                                        <span className="quest-chip coins">
                                            <Coins size={13} /> {quest.reward.coins}
                                        </span>
                                        {quest.reward.trophy && (
                                            <span className="quest-chip trophy">
                                                <Trophy size={13} /> {quest.reward.trophy}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
