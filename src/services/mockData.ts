// Plantasia: Guardians — Mock Data for Demo
import type { PlantCharacter, ZombieEnemy, Quest } from '../types';
import { zombieTemplates } from '../constants/zombies';
import { createQuestFromTemplate, questTemplates } from '../constants/quests';
import { colors } from '../constants/colors';

// ─── Demo Plants ───

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
        position: { x: 2, y: 0, z: 0 },
        xp: 180,
        level: 2,
        happiness: 95,
        streak: 12,
        shieldStrength: 80,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'plant_princess',
        species: 'Calathea ornata',
        commonName: 'Pin-Stripe Calathea',
        nickname: 'Princess Fern',
        personality: {
            type: 'anxious',
            quirks: ['Worries about everything', 'Needs constant reassurance', 'Sensitive to change'],
            speakingStyle: 'Nervous and dramatic, asks lots of "what if" questions',
        },
        avatarColor: '#A855F7',
        healthStatus: 'threatened',
        position: { x: 0, y: 0, z: 2 },
        xp: 120,
        level: 2,
        happiness: 45,
        streak: 1,
        shieldStrength: 20,
        createdAt: new Date().toISOString(),
    },
];

// ─── Demo Zombies ───

const drownfaceTemplate = zombieTemplates.drownface;
export const mockZombies: ZombieEnemy[] = [
    {
        id: 'zombie_drownface_1',
        type: 'drownface',
        name: drownfaceTemplate.name,
        disease: drownfaceTemplate.disease,
        subtitle: drownfaceTemplate.subtitle,
        state: 'approaching',
        targetPlantId: 'plant_princess',
        threatLevel: drownfaceTemplate.threatLevel,
        lore: drownfaceTemplate.lore,
        color: drownfaceTemplate.color,
        emoji: drownfaceTemplate.emoji,
        defeatSteps: drownfaceTemplate.defeatSteps,
        position: { x: -4, y: 0, z: 4 },
        progress: 0.3,
    },
];

// ─── Demo Quests ───

export const mockQuests: Quest[] = [
    createQuestFromTemplate(
        questTemplates.find(q => q.id === 'quest_defeat_drownface')!,
        'plant_princess',
        'zombie_drownface_1'
    ),
    createQuestFromTemplate(
        questTemplates.find(q => q.id === 'quest_daily_checkin')!,
    ),
];

// Mark first quest as active
mockQuests[0].active = true;

// ─── Available garden positions for new plants ───
export const gardenSlots = [
    { x: -2, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 2, y: 0, z: 0 },
    { x: -2, y: 0, z: 2 },
    { x: 0, y: 0, z: 2 },
    { x: 2, y: 0, z: 2 },
    { x: -2, y: 0, z: -2 },
    { x: 0, y: 0, z: -2 },
    { x: 2, y: 0, z: -2 },
];

export function getNextAvailableSlot(usedPositions: { x: number; y: number; z: number }[]): { x: number; y: number; z: number } | null {
    return gardenSlots.find(slot =>
        !usedPositions.some(used => used.x === slot.x && used.z === slot.z)
    ) || null;
}
