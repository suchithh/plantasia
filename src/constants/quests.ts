// Plantasia: Guardians — Quest Templates
import { Quest, QuestType } from '../types';

export interface QuestTemplate {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    stepDescriptions: string[];
    stepSubtitles?: string[];
    stepActions?: ({ type: 'navigate' | 'interaction' | 'observation' | 'care'; target?: string; value?: number } | undefined)[];
    reward: { coins: number; xp: number; trophy?: string };
    educational: string;
    timeLimitHours?: number;
}

export const questTemplates: QuestTemplate[] = [
    {
        id: 'quest_water_plant',
        title: '💧 Water Your Friend',
        description: 'Your plant is getting thirsty! Give them a good drink.',
        type: 'care',
        stepDescriptions: [
            'Check the soil moisture level',
            'Water until moisture reaches 40-60%',
            'Wait 30 seconds for water to absorb',
        ],
        stepSubtitles: [
            'Tap on the sensor icon to see moisture',
            'Use the watering can in the tools menu',
            'Patience is key for healthy roots',
        ],
        stepActions: [
            { type: 'observation', target: 'moisture' },
            { type: 'care', target: 'water', value: 40 },
            { type: 'navigate', target: 'wait' }, // simplified for now
        ],
        reward: { coins: 25, xp: 50 },
        educational: 'Most plants prefer soil that\'s moist but not soggy. The "finger test" — sticking your finger an inch into soil — is the easiest way to check!',
    },
    {
        id: 'quest_defeat_drownface',
        title: '⚔️ Defeat Drownface!',
        description: 'Drownface is attacking! Stop overwatering to defeat him.',
        type: 'battle',
        stepDescriptions: [
            'Ask your plant what\'s wrong',
            'Let soil dry out below 60% moisture',
            'Take a picture of the plant to prove it',
        ],
        stepSubtitles: [
            'Tap your plant to open chat',
            'Stop watering and wait for soil to dry',
            'Use the camera tool to scan your plant',
        ],
        stepActions: [
            { type: 'interaction', target: 'plant_chat' },
            { type: 'care', target: 'dry', value: 60 },
            { type: 'interaction', target: 'scan' },
        ],
        reward: { coins: 50, xp: 100, trophy: '🏆 Root Rot Slayer' },
        educational: 'Root rot kills more houseplants than any other problem. Roots need oxygen just like you do — waterlogged soil suffocates them!',
        timeLimitHours: 48, // Extended as requested
    },
    {
        id: 'quest_daily_checkin',
        title: '🌅 Good Morning, Garden!',
        description: 'Start your day by checking on your plants.',
        type: 'daily',
        stepDescriptions: [
            'Check soil temperature',
            'Verify light levels are sufficient',
            'Ensure soil moisture is stable',
        ],
        stepSubtitles: [
            'Tap the sensor icon',
            'Look for the sun icon in sensor data',
            'Check if moisture is in the green zone',
        ],
        stepActions: [
            { type: 'observation', target: 'temperature' },
            { type: 'observation', target: 'light' },
            { type: 'observation', target: 'moisture' },
        ],
        reward: { coins: 15, xp: 30 },
        educational: 'Stable environments make for happy plants. Quick daily checks prevent stress!',
        timeLimitHours: 24, // Explicit 24h
    },
    {
        id: 'quest_first_scan',
        title: '📸 Meet Your First Plant',
        description: 'Scan a real plant to add it to your garden!',
        type: 'photo',
        stepDescriptions: [
            'Tap the Scan button in the garden',
            'Point your camera at a real plant',
            'Capture the photo',
            'Give your plant a name!',
        ],
        stepSubtitles: [
            'Find the camera icon',
            'Ensure good lighting',
            'Snap a clear picture',
            'Type a name for your new friend',
        ],
        stepActions: [
            { type: 'navigate', target: 'scan' },
            { type: 'interaction', target: 'camera_open' },
            { type: 'interaction', target: 'capture' },
            { type: 'interaction', target: 'naming' },
        ],
        reward: { coins: 100, xp: 200, trophy: '🌱 Plant Parent' },
        educational: 'Every plant has unique needs based on its species. Identifying your plant correctly is the first step to great care!',
    },
    {
        id: 'quest_touch_plant',
        title: '🤗 High-Five Your Plant',
        description: 'Touch the sensor on your real plant to interact!',
        type: 'touch',
        stepDescriptions: [
            'Check the sensor connection',
            'Verify soil moisture reading',
            'Read the current light level',
        ],
        stepSubtitles: [
            'Ensure sensor is paired',
            'See if the plant has water',
            'Check if it\'s getting enough sun',
        ],
        stepActions: [
            { type: 'observation', target: 'connection' },
            { type: 'observation', target: 'moisture' },
            { type: 'observation', target: 'light' },
        ],
        reward: { coins: 30, xp: 60 },
        educational: 'Sensors help us understand what plants can\'t say. Monitoring data is the future of botany!',
    },
    {
        id: 'quest_defeat_thirster',
        title: '⚔️ Defeat Thirster!',
        description: 'Thirster is draining your plant! Water it before it\'s too late.',
        type: 'battle',
        stepDescriptions: [
            'Ask your plant what\'s wrong',
            'Water until soil moisture > 40%',
            'Take a picture of the plant to prove it',
        ],
        stepSubtitles: [
            'Tap your plant to open chat',
            'Use the watering can',
            'Scan your plant to confirm health',
        ],
        stepActions: [
            { type: 'interaction', target: 'plant_chat' },
            { type: 'care', target: 'water', value: 40 },
            { type: 'interaction', target: 'scan' },
        ],
        reward: { coins: 40, xp: 80, trophy: '💪 Hydration Hero' },
        educational: 'Consistent watering is key. Most plants like a "soak and dry" approach — water thoroughly, then wait until the top inch of soil is dry.',
        timeLimitHours: 24, // Extended
    },
];

export function createQuestFromTemplate(template: QuestTemplate, plantId?: string, zombieId?: string): Quest {
    return {
        id: `${template.id}_${Date.now()}`,
        title: template.title,
        description: template.description,
        type: template.type,
        steps: template.stepDescriptions.map((desc, i) => ({
            id: `step_${i}`,
            description: desc,
            subtitle: template.stepSubtitles?.[i],
            action: template.stepActions?.[i],
            completed: false,
        })),
        reward: template.reward,
        zombieId,
        plantId,
        timeLimit: template.timeLimitHours,
        active: false,
        completed: false,
        educational: template.educational,
    };
}
