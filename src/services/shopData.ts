// Plantasia: Guardians — Shop Data
import type { ShopItem } from '../types';

export const defaultShopItems: ShopItem[] = [
    // ─── Garden Upgrades ───
    {
        id: 'garden_medium',
        name: 'Cozy Garden',
        description: 'Expand to a 4×4 garden — room for 16 plants!',
        price: 500,
        category: 'garden_upgrade',
        icon: 'TreePine',
        owned: false,
        gardenSize: 'medium',
    },
    {
        id: 'garden_large',
        name: 'Grand Garden',
        description: 'The ultimate 5×5 garden — 25 plants!',
        price: 1500,
        category: 'garden_upgrade',
        icon: 'Castle',
        owned: false,
        gardenSize: 'large',
    },
    // ─── Cosmetics ───
    {
        id: 'cosmetic_gnome',
        name: 'Garden Gnome',
        description: 'A wise gnome to watch over your plants.',
        price: 150,
        category: 'cosmetic',
        icon: 'PersonStanding',
        owned: false,
    },
    {
        id: 'cosmetic_fairy_lights',
        name: 'Fairy Lights',
        description: 'Magical lights that twinkle at dusk.',
        price: 200,
        category: 'cosmetic',
        icon: 'Sparkles',
        owned: false,
    },
    {
        id: 'cosmetic_rainbow_fence',
        name: 'Rainbow Fence',
        description: 'Turn your fence into a colorful masterpiece.',
        price: 300,
        category: 'cosmetic',
        icon: 'Rainbow',
        owned: false,
    },
    {
        id: 'cosmetic_golden_pot',
        name: 'Golden Pot',
        description: 'A shiny golden pot for your favorite plant.',
        price: 250,
        category: 'cosmetic',
        icon: 'Crown',
        owned: false,
    },
    {
        id: 'cosmetic_butterflies',
        name: 'Extra Butterflies',
        description: 'More butterflies flutter through your garden.',
        price: 100,
        category: 'cosmetic',
        icon: 'Bug',
        owned: false,
    },
    {
        id: 'cosmetic_fountain',
        name: 'Garden Fountain',
        description: 'A tranquil fountain that soothes your plants.',
        price: 400,
        category: 'cosmetic',
        icon: 'Waves',
        owned: false,
    },
];

// Garden slot layouts by size
export const gardenLayouts = {
    small: [
        { x: -2, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: -2, y: 0, z: 2 },
        { x: 0, y: 0, z: 2 },
        { x: 2, y: 0, z: 2 },
        { x: -2, y: 0, z: -2 },
        { x: 0, y: 0, z: -2 },
        { x: 2, y: 0, z: -2 },
    ],
    medium: [
        { x: -3, y: 0, z: -3 }, { x: -1, y: 0, z: -3 }, { x: 1, y: 0, z: -3 }, { x: 3, y: 0, z: -3 },
        { x: -3, y: 0, z: -1 }, { x: -1, y: 0, z: -1 }, { x: 1, y: 0, z: -1 }, { x: 3, y: 0, z: -1 },
        { x: -3, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 3, y: 0, z: 1 },
        { x: -3, y: 0, z: 3 }, { x: -1, y: 0, z: 3 }, { x: 1, y: 0, z: 3 }, { x: 3, y: 0, z: 3 },
    ],
    large: [
        { x: -4, y: 0, z: -4 }, { x: -2, y: 0, z: -4 }, { x: 0, y: 0, z: -4 }, { x: 2, y: 0, z: -4 }, { x: 4, y: 0, z: -4 },
        { x: -4, y: 0, z: -2 }, { x: -2, y: 0, z: -2 }, { x: 0, y: 0, z: -2 }, { x: 2, y: 0, z: -2 }, { x: 4, y: 0, z: -2 },
        { x: -4, y: 0, z: 0 }, { x: -2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 4, y: 0, z: 0 },
        { x: -4, y: 0, z: 2 }, { x: -2, y: 0, z: 2 }, { x: 0, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 4, y: 0, z: 2 },
        { x: -4, y: 0, z: 4 }, { x: -2, y: 0, z: 4 }, { x: 0, y: 0, z: 4 }, { x: 2, y: 0, z: 4 }, { x: 4, y: 0, z: 4 },
    ],
};
