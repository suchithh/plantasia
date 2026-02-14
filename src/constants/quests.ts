// Plantasia: Guardians — Quest Templates
import { Quest, QuestType } from '../types';

export interface QuestTemplate {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    stepDescriptions: string[];
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
        reward: { coins: 25, xp: 50 },
        educational: 'Most plants prefer soil that\'s moist but not soggy. The "finger test" — sticking your finger an inch into soil — is the easiest way to check!',
    },
    {
        id: 'quest_defeat_drownface',
        title: '⚔️ Defeat Drownface!',
        description: 'Drownface is attacking! Stop overwatering to defeat him.',
        type: 'battle',
        stepDescriptions: [
            'Read about why overwatering is dangerous',
            'Let soil dry out below 60% moisture',
            'Ensure pot has drainage holes',
            'Remove standing water from saucer',
        ],
        reward: { coins: 50, xp: 100, trophy: '🏆 Root Rot Slayer' },
        educational: 'Root rot kills more houseplants than any other problem. Roots need oxygen just like you do — waterlogged soil suffocates them!',
        timeLimitHours: 24,
    },
    {
        id: 'quest_daily_checkin',
        title: '🌅 Good Morning, Garden!',
        description: 'Start your day by checking on your plants.',
        type: 'daily',
        stepDescriptions: [
            'Tap each plant to say hello',
            'Check one plant\'s health status',
            'Read one zombie lore card',
        ],
        reward: { coins: 15, xp: 30 },
        educational: 'Checking your plants daily helps you catch problems early. It only takes 2 minutes!',
    },
    {
        id: 'quest_first_scan',
        title: '📸 Meet Your First Plant',
        description: 'Scan a real plant to add it to your garden!',
        type: 'photo',
        stepDescriptions: [
            'Tap the + button in the garden',
            'Point your camera at a real plant',
            'Capture the photo',
            'Give your plant a name!',
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
            'Connect the hardware sensor',
            'Gently touch the sensor pad on your plant',
            'Watch your plant react happily!',
        ],
        reward: { coins: 30, xp: 60 },
        educational: 'Plants actually respond to touch! It\'s called thigmomorphogenesis — plants touched regularly grow stronger and shorter. Science is cool!',
    },
    {
        id: 'quest_defeat_thirster',
        title: '⚔️ Defeat Thirster!',
        description: 'Thirster is draining your plant! Water it before it\'s too late.',
        type: 'battle',
        stepDescriptions: [
            'Read about dehydration dangers',
            'Water the plant thoroughly',
            'Set a watering reminder',
        ],
        reward: { coins: 40, xp: 80, trophy: '💪 Hydration Hero' },
        educational: 'Consistent watering is key. Most plants like a "soak and dry" approach — water thoroughly, then wait until the top inch of soil is dry.',
        timeLimitHours: 12,
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
