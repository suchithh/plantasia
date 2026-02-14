// Plantasia: Guardians — Quest Panel
import { useGameStore } from '../../stores/gameStore';

export function QuestPanel() {
    const quests = useGameStore(s => s.quests);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const activateQuest = useGameStore(s => s.activateQuest);
    const completeQuestStep = useGameStore(s => s.completeQuestStep);
    const completeQuest = useGameStore(s => s.completeQuest);

    const handleClose = () => setActivePanel('none');

    const activeQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    const handleStepToggle = (questId: string, stepId: string) => {
        completeQuestStep(questId, stepId);

        // Check if all steps completed
        const quest = quests.find(q => q.id === questId);
        if (quest) {
            const allDone = quest.steps.every(s => s.id === stepId || s.completed);
            if (allDone) {
                setTimeout(() => completeQuest(questId), 500);
            }
        }
    };

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>📜 Quests</h2>
                    <button className="panel-close" onClick={handleClose}>✕</button>
                </div>
                <div className="panel-body">
                    {/* Active Quests */}
                    {activeQuests.length > 0 ? (
                        activeQuests.map(quest => (
                            <div key={quest.id} className={`quest-card ${quest.active ? 'active' : ''}`}>
                                <div className="quest-title">{quest.title}</div>
                                <div className="quest-desc">{quest.description}</div>

                                {/* Steps */}
                                <div style={{ marginBottom: '12px' }}>
                                    {quest.steps.map(step => (
                                        <div key={step.id} className="quest-step"
                                            onClick={() => !step.completed && handleStepToggle(quest.id, step.id)}
                                            style={{ cursor: step.completed ? 'default' : 'pointer' }}
                                        >
                                            <div className={`quest-step-check ${step.completed ? 'done' : ''}`}>
                                                {step.completed && '✓'}
                                            </div>
                                            <span style={{
                                                textDecoration: step.completed ? 'line-through' : 'none',
                                                color: step.completed ? '#9CA3AF' : '#1F2937',
                                            }}>
                                                {step.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Reward */}
                                <div className="quest-reward">
                                    <span>🪙 {quest.reward.coins}</span>
                                    <span>⭐ {quest.reward.xp} XP</span>
                                    {quest.reward.trophy && <span>{quest.reward.trophy}</span>}
                                </div>

                                {/* Educational tie-in */}
                                <div className="edu-card">
                                    <div className="edu-card-title">💡 Did you know?</div>
                                    <p>{quest.educational}</p>
                                </div>

                                {/* Activate if not active */}
                                {!quest.active && (
                                    <button
                                        className="action-btn primary"
                                        style={{ width: '100%', marginTop: '12px' }}
                                        onClick={() => activateQuest(quest.id)}
                                    >
                                        Start Quest
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎉</div>
                            <div className="empty-state-title">All quests completed!</div>
                            <div className="empty-state-sub">Check back later for new challenges.</div>
                        </div>
                    )}

                    {/* Completed Quests */}
                    {completedQuests.length > 0 && (
                        <>
                            <div className="completed-header">
                                Completed ({completedQuests.length})
                            </div>
                            {completedQuests.map(quest => (
                                <div key={quest.id} className="quest-card completed">
                                    <div className="quest-title">{quest.title}</div>
                                    <div className="quest-reward">
                                        <span>🪙 {quest.reward.coins}</span>
                                        {quest.reward.trophy && <span>{quest.reward.trophy}</span>}
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
