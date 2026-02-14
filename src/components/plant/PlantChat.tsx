// Plantasia: Guardians — Plant Chat Component
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { chatWithPlant } from '../../services/gemini';
import { Leaf, SendHorizontal, X } from 'lucide-react';

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

    // Quick reply suggestions
    const quickReplies = [
        'How are you feeling?',
        'Any zombies nearby?',
        'Tell me a plant fact!',
        'Do you need water?',
    ];

    return (
        <div className="panel-overlay" onClick={handleClose}>
            <div className="panel" onClick={e => e.stopPropagation()} style={{ maxHeight: '75vh' }}>
                <div className="panel-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="chat-avatar"
                            style={{ background: `${plant.avatarColor}22` }}
                        ><Leaf size={15} /></span>
                        Chat with {plant.nickname}
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
                    {messages.length === 0 && (
                        <div className="quick-reply-container">
                            {quickReplies.map((text, i) => (
                                <button key={i} onClick={() => { setInput(text); }}
                                    className="quick-reply">
                                    {text}
                                </button>
                            ))}
                        </div>
                    )}

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
