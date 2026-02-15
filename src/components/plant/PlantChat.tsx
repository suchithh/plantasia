// Plantasia: Guardians — Plant Chat Component
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { chatWithPlant } from '../../services/gemini';
import { Leaf, SendHorizontal, X, MessageCircleQuestion, Sparkles } from 'lucide-react';

const personalityColors: Record<string, string> = {
    dramatic: '#F472B6', // Pink
    chill: '#4ADE80',    // Green
    anxious: '#A78BFA',  // Purple
    wise: '#60A5FA',     // Blue
    cheerful: '#FBBF24', // Yellow
};

const moodEmojis: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    worried: '😰',
    excited: '🤩',
    dramatic: '🎭',
    sleepy: '😴',
};

export function PlantChat() {
    const selectedPlantId = useGameStore(s => s.selectedPlantId);
    const plants = useGameStore(s => s.plants);
    const zombies = useGameStore(s => s.zombies);
    const quests = useGameStore(s => s.quests);
    const sensorConnection = useGameStore(s => s.sensorConnection);
    const gameEvents = useGameStore(s => s.gameEvents);
    const chatMessages = useGameStore(s => s.chatMessages);
    const isChatLoading = useGameStore(s => s.isChatLoading);
    const addChatMessage = useGameStore(s => s.addChatMessage);
    const setChatLoading = useGameStore(s => s.setChatLoading);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const selectPlant = useGameStore(s => s.selectPlant);
    const triggerReaction = useGameStore(s => s.triggerPlantReaction);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const plant = plants.find(p => p.id === selectedPlantId);
    if (!plant) return null;

    const messages = chatMessages[plant.id] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isChatLoading) return;

        const userMsg = {
            id: `msg_${Date.now()}`,
            sender: 'user' as const,
            text: input.trim(),
            timestamp: Date.now(),
        };

        addChatMessage(plant.id, userMsg);
        setInput('');
        setChatLoading(true);
        triggerReaction(plant.id, 'bounce'); // React to user input immediately

        try {
            const response = await chatWithPlant(plant, userMsg.text, messages, {
                activeZombies: zombies.filter(z => z.state !== 'defeated').map(z => z.name),
                activeQuests: quests.filter(q => q.active).map(q => q.title),
                sensorStatus: sensorConnection,
                recentEvents: gameEvents.slice(-3).map(e => e.type),
            });

            addChatMessage(plant.id, {
                id: `msg_${Date.now()}_plant`,
                sender: 'plant',
                text: response,
                timestamp: Date.now(),
            });
        } catch (err) {
            addChatMessage(plant.id, {
                id: `msg_${Date.now()}_err`,
                sender: 'plant',
                text: `*${plant.nickname} seems confused* ...something glitched. Try again?`,
                timestamp: Date.now(),
            });
        }

        setChatLoading(false);
    };

    const handleClose = () => { selectPlant(null); setActivePanel('none'); };

    // Context-aware Quick Replies
    const getQuickReplies = () => {
        const replies = [];
        const hasZombies = zombies.some(z => z.state !== 'defeated' && z.state !== 'dying');
        const needsWater = plant.healthStatus === 'threatened' || plant.happiness < 50;

        if (hasZombies) {
            replies.push("Are you safe?", "I'll protect you!", "How close is it?");
        } else if (needsWater) {
            replies.push("Do you need water?", "You look thirsty.", "Hang in there.");
        } else {
            // Personality based
            if (plant.personality.type === 'dramatic') replies.push("Tell me some gossip!", "Why so quiet?", "Am I fabulous?");
            if (plant.personality.type === 'chill') replies.push("Vibe check.", "Relaxing today?", "Needs sun?");
            if (plant.personality.type === 'anxious') replies.push("Is everything okay?", "Did you hear that?", "You're safe.");
            replies.push("You look great!", "Tell me a fact.");
        }
        return replies.slice(0, 4);
    };

    const activeQuickReplies = getQuickReplies();
    const themeColor = personalityColors[plant.personality.type] || '#4ADE80';

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()} style={{ maxHeight: '75vh', borderColor: themeColor, borderWidth: '2px', borderStyle: 'solid' }}>
                <div className="panel-header" style={{ borderBottomColor: `${themeColor}44` }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColor }}>
                        <div className="chat-avatar-container" style={{ position: 'relative' }}>
                            <span className="chat-avatar"
                                style={{ background: `${themeColor}22`, color: themeColor }}
                            ><Leaf size={15} /></span>
                            <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '12px' }}>
                                {moodEmojis[plant.mood || 'neutral'] || '😐'}
                            </span>
                        </div>
                        {plant.nickname}
                    </h2>
                    <button className="panel-close" onClick={handleClose}><X size={16} /></button>
                </div>

                <div className="chat-container">
                    <div className="chat-messages">
                        {/* Welcome message if no history */}
                        {messages.length === 0 && (
                            <div className="chat-bubble plant">
                                Hey there! I'm {plant.nickname}. {plant.personality.speakingStyle} What's up?
                            </div>
                        )}

                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}

                        {isChatLoading && (
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div className="quick-reply-container">
                        {activeQuickReplies.map((text, i) => (
                            <button key={i} onClick={() => { setInput(text); }}
                                className="quick-reply"
                                style={{ borderColor: `${themeColor}66`, color: themeColor }}>
                                {text}
                            </button>
                        ))}
                    </div>

                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            placeholder={`Talk to ${plant.nickname}...`}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={isChatLoading}
                        />
                        <button className="chat-send-btn" onClick={handleSend} disabled={isChatLoading}>
                            <SendHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
