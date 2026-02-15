// Plantasia: Guardians — Mock Data for Demo
import type { PlantCharacter, ZombieEnemy, Quest } from '../types';
import { createQuestFromTemplate, questTemplates } from '../constants/quests';

// ─── Demo Plants ───
// Demo starts with just Gerald + Zen. Princess Finn is added live via scan.

export const mockPlants: PlantCharacter[] = [
    {
        id: 'plant_gerald',
        species: 'Monstera deliciosa',
        commonName: 'Swiss Cheese Plant',
        nickname: 'Gerald',
        personality: {
            type: 'dramatic',
            quirks: ['Gasps at everything', 'Refers to self in third person', 'Overly emotional about water'],
            speakingStyle: 'Theatrical and dramatic, with lots of exclamation marks',
        },
        avatarColor: '#22C55E',
        healthStatus: 'healthy',
        mood: 'happy',
        position: { x: -2, y: 0, z: 0 },
        xp: 250,
        level: 3,
        happiness: 85,
        streak: 5,
        shieldStrength: 60,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'plant_zen',
        species: 'Sansevieria trifasciata',
        commonName: 'Snake Plant',
        nickname: 'Zen',
        personality: {
            type: 'chill',
            quirks: ['Speaks in haiku sometimes', 'Never worried about anything', 'Meditates a lot'],
            speakingStyle: 'Calm and zen, uses short profound sentences',
        },
        avatarColor: '#059669',
        healthStatus: 'healthy',
        mood: 'happy',
        position: { x: 2, y: 0, z: 0 },
        xp: 180,
        level: 2,
        happiness: 95,
        streak: 12,
        shieldStrength: 80,
        createdAt: new Date().toISOString(),
    },
];

// ─── Demo Zombies ───
// No pre-spawned zombies — Thirster spawns live during check-in demo

export const mockZombies: ZombieEnemy[] = [];

// ─── Demo Quests ───
// Only daily check-in quest. Battle quest created dynamically when zombie spawns.

export const mockQuests: Quest[] = [
    createQuestFromTemplate(
        questTemplates.find(q => q.id === 'quest_daily_checkin')!,
    ),
];

// ─── Dynamic garden positions based on size ───
import { gardenLayouts } from './shopData';
import type { GardenSize } from '../types';

export function getGardenSlots(size: GardenSize) {
    return gardenLayouts[size];
}

export function getNextAvailableSlot(
    usedPositions: { x: number; y: number; z: number }[],
    gardenSize: GardenSize = 'small'
): { x: number; y: number; z: number } | null {
    const slots = gardenLayouts[gardenSize];
    return slots.find(slot =>
        !usedPositions.some(used => used.x === slot.x && used.z === slot.z)
    ) || null;
}
