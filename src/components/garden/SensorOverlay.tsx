// Plantasia: Guardians — Sensor Overlay Component
import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getSensorBridge } from '../../services/sensorBridge';
import { zombieTemplates } from '../../constants/zombies';
import type { ZombieEnemy } from '../../types';

export function SensorOverlay() {
    const updateSensorData = useGameStore(s => s.updateSensorData);
    const setSensorConnection = useGameStore(s => s.setSensorConnection);
    const spawnZombie = useGameStore(s => s.spawnZombie);
    const addCoins = useGameStore(s => s.addCoins);
    const updatePlantShield = useGameStore(s => s.updatePlantShield);
    const plants = useGameStore(s => s.plants);
    const zombies = useGameStore(s => s.zombies);
    const pushGameEvent = useGameStore(s => s.pushGameEvent);

    const handleGameEvents = useCallback(() => {
        const bridge = getSensorBridge();

        const unsubSensor = bridge.onSensorData((data) => {
            updateSensorData(data);
        });

        const unsubConnection = bridge.onConnectionChange((state) => {
            setSensorConnection(state);
        });

        const unsubEvents = bridge.onGameEvent((event) => {
            const targetPlant = plants.find(p => p.healthStatus !== 'dead');

            switch (event.type) {
                case 'zombie_trigger': {
                    // Don't spawn duplicate zombie types
                    const exists = zombies.some(z => z.type === event.zombieType && z.state !== 'defeated');
                    if (exists || !targetPlant) break;

                    const template = zombieTemplates[event.zombieType];
                    const newZombie: ZombieEnemy = {
                        id: `zombie_${event.zombieType}_${Date.now()}`,
                        type: event.zombieType,
                        name: template.name,
                        disease: template.disease,
                        subtitle: template.subtitle,
                        state: 'approaching',
                        targetPlantId: targetPlant.id,
                        threatLevel: template.threatLevel,
                        lore: template.lore,
                        color: template.color,
                        emoji: template.emoji,
                        defeatSteps: template.defeatSteps,
                        position: { x: (Math.random() - 0.5) * 8, y: 0, z: (Math.random() - 0.5) * 8 },
                        progress: 0,
                    };
                    spawnZombie(newZombie);
                    pushGameEvent({ type: 'zombie_spawned', zombieId: newZombie.id, zombieType: event.zombieType, targetPlantId: targetPlant.id });
                    break;
                }
                case 'touch_reaction': {
                    addCoins(event.coins);
                    if (targetPlant) {
                        pushGameEvent({ type: 'plant_touched', plantId: targetPlant.id, coins: event.coins });
                    }
                    break;
                }
                case 'shield_building': {
                    if (targetPlant) {
                        updatePlantShield(targetPlant.id, event.strength);
                        pushGameEvent({ type: 'shield_built', plantId: targetPlant.id, strength: event.strength });
                    }
                    break;
                }
            }
        });

        return () => {
            unsubSensor();
            unsubConnection();
            unsubEvents();
        };
    }, []);

    useEffect(() => {
        const cleanup = handleGameEvents();
        return cleanup;
    }, [handleGameEvents]);

    // This component mostly handles side-effects (sensor→store bridge)
    // Visual output is handled by GardenHUD's sensor badge
    return null;
}
