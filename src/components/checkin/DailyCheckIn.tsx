// Plantasia: Guardians — Daily Check-In (Camera)
import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Loader, Sparkles, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { analyzeCheckIn } from '../../services/gemini';
import { zombieTemplates } from '../../constants/zombies';
import { createQuestFromTemplate, questTemplates } from '../../constants/quests';
import type { CheckInAnalysis, ZombieEnemy } from '../../types';

type Phase = 'camera' | 'capturing' | 'analyzing' | 'done';

export function DailyCheckIn() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const selectedCheckInPlantId = useGameStore(s => s.selectedCheckInPlantId);
    const plants = useGameStore(s => s.plants);
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const setLastCheckInResult = useGameStore(s => s.setLastCheckInResult);
    const recordCheckIn = useGameStore(s => s.recordCheckIn);
    const addCoins = useGameStore(s => s.addCoins);
    const spawnZombie = useGameStore(s => s.spawnZombie);
    const addQuest = useGameStore(s => s.addQuest);
    const pushGameEvent = useGameStore(s => s.pushGameEvent);

    const plant = plants.find(p => p.id === selectedCheckInPlantId);
    const [phase, setPhase] = useState<Phase>('camera');

    // Start camera
    useEffect(() => {
        let cancelled = false;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            })
            .catch(console.error);
        return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, []);

    const capture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !plant) return;
        setPhase('capturing');

        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        // Stop camera
        streamRef.current?.getTracks().forEach(t => t.stop());
        setPhase('analyzing');

        try {
            const raw = await analyzeCheckIn(base64, plant.species);

            const result: CheckInAnalysis = {
                healthy: raw.healthy,
                confidence: raw.confidence || 0.85,
                tips: raw.tips || [],
                coins: raw.healthy ? 25 + Math.min(plant.streak * 5, 50) : 10,
                zombieType: raw.zombieType,
                disease: raw.disease,
                severity: raw.severity,
                explanation: raw.explanation,
                defeatSteps: raw.defeatSteps,
            };

            // Record check-in
            recordCheckIn({
                id: `checkin_${Date.now()}`,
                plantId: plant.id,
                date: new Date().toISOString(),
                healthy: result.healthy,
                coins: result.coins,
                zombieType: result.zombieType,
                tips: result.tips,
            });

            // Reward coins
            addCoins(result.coins);
            pushGameEvent({ type: 'daily_checkin', plantId: plant.id, healthy: result.healthy, coins: result.coins });

            // If unhealthy, spawn zombie + quest
            if (!result.healthy && result.zombieType) {
                const template = zombieTemplates[result.zombieType];
                if (template) {
                    const zombie: ZombieEnemy = {
                        id: `zombie_${Date.now()}`,
                        type: result.zombieType,
                        name: template.name,
                        disease: result.disease || template.disease,
                        subtitle: template.subtitle,
                        state: 'approaching',
                        targetPlantId: plant.id,
                        threatLevel: template.threatLevel,
                        lore: template.lore,
                        color: template.color,
                        emoji: template.emoji,
                        defeatSteps: result.defeatSteps || template.defeatSteps,
                        position: { x: plant.position.x + 3, y: 0, z: plant.position.z },
                        progress: 0,
                    };
                    spawnZombie(zombie);
                    pushGameEvent({ type: 'zombie_spawned', zombieId: zombie.id, zombieType: result.zombieType, targetPlantId: plant.id });

                    // Create matching quest
                    const questTemplate = questTemplates.find(q => q.id === `quest_defeat_${result.zombieType}`);
                    if (questTemplate) {
                        const quest = createQuestFromTemplate(questTemplate, plant.id, zombie.id);
                        quest.active = true;
                        addQuest(quest);
                    }
                }
            }

            setLastCheckInResult(result);
            setPhase('done');
            // Navigate to result screen
            setActivePanel('checkin_result');
        } catch (err) {
            console.error('Check-in analysis failed:', err);
            // Fallback: assume healthy
            const fallback: CheckInAnalysis = {
                healthy: true, confidence: 0.7, coins: 15,
                tips: ['Your plant looks good! Keep up the care routine.', 'Remember to check soil moisture regularly.'],
            };
            addCoins(fallback.coins);
            recordCheckIn({
                id: `checkin_${Date.now()}`,
                plantId: plant.id,
                date: new Date().toISOString(),
                healthy: true,
                coins: fallback.coins,
                tips: fallback.tips,
            });
            setLastCheckInResult(fallback);
            setActivePanel('checkin_result');
        }
    }, [plant, recordCheckIn, addCoins, spawnZombie, addQuest, pushGameEvent, setLastCheckInResult, setActivePanel]);

    if (!plant) return null;

    return (
        <div className="checkin-overlay">
            <div className="checkin-card">
                <button className="checkin-close" onClick={() => setActivePanel('plant_detail')}>
                    <X size={20} />
                </button>

                <h2 className="checkin-title">
                    {phase === 'camera' && `How is ${plant.nickname} doing?`}
                    {phase === 'capturing' && 'Got it!'}
                    {phase === 'analyzing' && 'Analyzing...'}
                    {phase === 'done' && 'Done!'}
                </h2>
                <p className="checkin-subtitle">
                    {phase === 'camera' && 'Take a photo for their daily check-in'}
                    {phase === 'analyzing' && 'Our plant doctor is taking a look...'}
                </p>

                <div className="checkin-camera-area">
                    {(phase === 'camera' || phase === 'capturing') && (
                        <video ref={videoRef} className="checkin-video" playsInline muted />
                    )}
                    {phase === 'analyzing' && (
                        <div className="checkin-analyzing">
                            <Loader size={48} className="spin" />
                            <p>Checking for diseases, pests, and overall health...</p>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {phase === 'camera' && (
                    <button className="checkin-capture-btn" onClick={capture}>
                        <Camera size={24} />
                        <span>Check In</span>
                    </button>
                )}
            </div>
        </div>
    );
}
