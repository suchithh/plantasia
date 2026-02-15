// Plantasia: Guardians — Daily Check-In
import { useRef, useState, useEffect } from 'react';
import { Camera, X, Sparkles, Activity, Droplets } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { analyzeCheckIn } from '../../services/gemini';
import { getSensorBridge } from '../../services/sensorBridge';
import { zombieTemplates } from '../../constants/zombies';
import { createQuestFromTemplate, questTemplates } from '../../constants/quests';
import type { CheckInAnalysis, ZombieEnemy } from '../../types';

export function DailyCheckIn() {
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const plants = useGameStore(s => s.plants);
    const selectedCheckInPlantId = useGameStore(s => s.selectedCheckInPlantId);

    // Auto-select the first plant if none customized or specific one not selected
    const selectedPlant = selectedCheckInPlantId
        ? plants.find(p => p.id === selectedCheckInPlantId)
        : plants[0];

    const setLastCheckInResult = useGameStore(s => s.setLastCheckInResult);
    const recordCheckIn = useGameStore(s => s.recordCheckIn);
    const addCoins = useGameStore(s => s.addCoins);
    const spawnZombie = useGameStore(s => s.spawnZombie);
    const addQuest = useGameStore(s => s.addQuest);
    const pushGameEvent = useGameStore(s => s.pushGameEvent);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [step, setStep] = useState<'camera' | 'analysis'>('camera');
    const [sensorData, setSensorData] = useState<any>(null);

    // Get sensor data
    useEffect(() => {
        const bridge = getSensorBridge();
        const unsubscribe = bridge.onSensorData((data) => {
            setSensorData(data);
        });
        return () => unsubscribe();
    }, []);

    // Start camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: 640, height: 480 }
                });
                streamRef.current = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (e) {
                console.error("Camera error", e);
            }
        };
        startCamera();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current || !selectedPlant) return;

        setStep('analysis');

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        // Stop camera stream to save resources
        streamRef.current?.getTracks().forEach(t => t.stop());

        try {
            const raw = await analyzeCheckIn(base64, selectedPlant.species);

            const result: CheckInAnalysis = {
                healthy: raw.healthy,
                confidence: raw.confidence || 0.85,
                tips: raw.tips || [],
                coins: raw.healthy ? 25 + Math.min(selectedPlant.streak * 5, 50) : 10,
                zombieType: raw.zombieType,
                disease: raw.disease,
                severity: raw.severity,
                explanation: raw.explanation,
                defeatSteps: raw.defeatSteps,
            };

            // Record check-in
            recordCheckIn({
                id: `checkin_${Date.now()}`,
                plantId: selectedPlant.id,
                date: new Date().toISOString(),
                healthy: result.healthy,
                coins: result.coins,
                zombieType: result.zombieType,
                tips: result.tips,
            });

            // Reward coins
            addCoins(result.coins);
            pushGameEvent({ type: 'daily_checkin', plantId: selectedPlant.id, healthy: result.healthy, coins: result.coins });

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
                        targetPlantId: selectedPlant.id,
                        threatLevel: template.threatLevel,
                        lore: template.lore,
                        color: template.color,
                        emoji: template.emoji,
                        defeatSteps: result.defeatSteps || template.defeatSteps,
                        position: {
                            x: selectedPlant.position.x >= 0 ? 7 : -7,
                            y: 0,
                            z: selectedPlant.position.z >= 0 ? 7 : -7,
                        },
                        progress: 0,
                    };
                    spawnZombie(zombie);
                    pushGameEvent({ type: 'zombie_spawned', zombieId: zombie.id, zombieType: result.zombieType, targetPlantId: selectedPlant.id });

                    // Create matching quest
                    const questTemplate = questTemplates.find(q => q.id === `quest_defeat_${result.zombieType}`);
                    if (questTemplate) {
                        const quest = createQuestFromTemplate(questTemplate, selectedPlant.id, zombie.id);
                        quest.active = true;
                        addQuest(quest);
                    }
                }
            }

            setLastCheckInResult(result);
            setActivePanel('checkin_result');

        } catch (err) {
            console.error('Check-in analysis failed:', err);
            // Fallback: assume healthy if scanning fails
            const fallback: CheckInAnalysis = {
                healthy: true, confidence: 0.7, coins: 15,
                tips: ['Your plant looks good! Keep up the care routine.', 'Remember to check soil moisture regularly.'],
            };
            addCoins(fallback.coins);
            recordCheckIn({
                id: `checkin_${Date.now()}`,
                plantId: selectedPlant.id,
                date: new Date().toISOString(),
                healthy: true,
                coins: fallback.coins,
                tips: fallback.tips,
            });
            setLastCheckInResult(fallback);
            setActivePanel('checkin_result');
            setStep('camera');
        }
    };

    const handleClose = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setActivePanel('none');
    };

    if (!selectedPlant) return null;

    return (
        <div className="checkin-overlay">
            <div className="checkin-hud">
                <div className="checkin-header">
                    <h2>Daily Check-in</h2>
                    <p>Let's check on {selectedPlant.nickname}</p>
                </div>

                <div className="checkin-camera-frame">
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {step === 'camera' && (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="checkin-video" />
                            <div className="camera-guide-overlay">
                                <div className="guide-corners" />
                                <div className="guide-text">
                                    <Camera size={20} />
                                    Align plant in frame
                                </div>
                            </div>
                        </>
                    )}
                    {step === 'analysis' && (
                        <div className="analysis-view">
                            <div className="scanner-line" />
                            <div className="analysis-status">
                                <Sparkles size={24} className="spin-slow" />
                                <span>Analyzing plant health...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="checkin-controls">
                    {step === 'camera' && (
                        <button className="capture-btn-large" onClick={handleCapture}>
                            <div className="capture-inner" />
                        </button>
                    )}
                    <button className="checkin-close-fab" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                {sensorData && (
                    <div className="sensor-mini-status" style={{ marginTop: '20px', color: 'white', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px' }}>
                        <Droplets size={16} color="#60A5FA" />
                        <span>Soil Moisture: {sensorData.moisture}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
