// Plantasia: Guardians — Zombie Lore & Data
// From idea.md: Goofy educational mascots, NOT scary monsters

import { ZombieType, ZombieLore } from '../types';
import { colors } from './colors';

export interface ZombieTemplate {
    type: ZombieType;
    name: string;
    disease: string;
    subtitle: string;
    color: string;
    emoji: string;
    threatLevel: 1 | 2 | 3 | 4 | 5;
    lore: ZombieLore;
    defeatSteps: string[];
    spawnCondition: string;
}

export const zombieTemplates: Record<ZombieType, ZombieTemplate> = {
    drownface: {
        type: 'drownface',
        name: 'Drownface',
        disease: 'Root Rot / Overwatering',
        subtitle: 'The Root Rot Zombie',
        color: colors.zombie.drownface,
        emoji: '💧',
        threatLevel: 3,
        lore: {
            backstory: 'Born in waterlogged soil, Drownface turns healthy roots into mush. He loves saucers full of standing water and pots without drainage holes. His favorite hobby? Turning oxygen-loving roots into soggy noodles.',
            whatIsIt: 'Root rot is a condition where plant roots decay due to prolonged exposure to excess moisture. Fungal organisms thrive in waterlogged soil, attacking weakened roots.',
            whyItHappens: 'Overwatering, poor drainage, or pots without drainage holes keep soil too wet. Roots need oxygen — when soil stays saturated, roots suffocate and fungi move in.',
            earlyWarnings: ['Yellowing lower leaves', 'Mushy stem base', 'Soil stays wet for days', 'Foul smell from soil', 'Leaves dropping despite wet soil'],
            science: 'Healthy roots require oxygen for cellular respiration. Waterlogged soil becomes anaerobic, allowing opportunistic fungi (Pythium, Phytophthora) to colonize weakened root tissue.',
            weakness: 'Dry soil and good drainage',
            plantsAffected: 'All plants, especially succulents and tropical plants',
        },
        defeatSteps: ['Let soil dry out completely below 60% moisture', 'Check that drainage holes are clear', 'Learn about root rot (tap to read)', 'Remove any standing water from saucers'],
        spawnCondition: 'Soil moisture > 80% for extended time',
    },

    thirster: {
        type: 'thirster',
        name: 'Thirster',
        disease: 'Dehydration / Underwatering',
        subtitle: 'The Drought Zombie',
        color: colors.zombie.thirster,
        emoji: '🏜️',
        threatLevel: 2,
        lore: {
            backstory: 'Thirster rises from cracked, bone-dry soil. She wanders the garden looking for plants too weak to resist, draining what little moisture remains. She looks perpetually parched and a bit dramatic about it.',
            whatIsIt: 'Underwatering is when a plant doesn\'t receive enough water to maintain normal cellular functions. Unlike overwatering, it\'s usually easier to fix.',
            whyItHappens: 'Forgetting to water, irregular watering schedule, soil that repels water (hydrophobic), or placing plants in very hot/dry locations.',
            earlyWarnings: ['Soil pulling away from pot edges', 'Leaves feeling thin or papery', 'Pot feels unusually light', 'Slight leaf curl before wilting', 'Crispy brown leaf edges'],
            science: 'Without water, plants close their stomata (leaf pores) to prevent water loss. This also stops CO₂ intake, halting photosynthesis. Prolonged drought causes cellular damage as turgor pressure drops.',
            weakness: 'Regular watering and consistent schedule',
            plantsAffected: 'Tropical plants, ferns, calatheas — anything that loves humidity',
        },
        defeatSteps: ['Water thoroughly until water drains from bottom', 'Set a consistent watering schedule', 'Check soil moisture before watering', 'Consider a self-watering pot or pebble tray'],
        spawnCondition: 'Soil moisture < 20%',
    },

    sunscorch: {
        type: 'sunscorch',
        name: 'Sunscorch',
        disease: 'Light Burn / Sun Damage',
        subtitle: 'The Scorching Zombie',
        color: colors.zombie.sunscorch,
        emoji: '☀️',
        threatLevel: 3,
        lore: {
            backstory: 'Sunscorch blazes in from the sunniest window, leaving burn marks wherever he goes. He\'s basically a tiny walking sunburn, and he thinks he\'s really cool (he\'s actually really hot).',
            whatIsIt: 'Light burn occurs when a plant receives more intense light than it can handle, causing bleaching or browning of leaves.',
            whyItHappens: 'Moving a shade-loving plant to direct sun, sudden exposure changes, or placing plants too close to south-facing windows without acclimation.',
            earlyWarnings: ['White or bleached patches on leaves', 'Brown, crispy spots (not edges)', 'Leaves curling away from light', 'Fading leaf color'],
            science: 'Excess photons damage chloroplasts through photooxidation. The plant produces reactive oxygen species faster than it can neutralize them, leading to cellular damage visible as bleached or brown tissue.',
            weakness: 'Indirect light and gradual acclimation',
            plantsAffected: 'Shade-loving plants, newly purchased plants, seedlings',
        },
        defeatSteps: ['Move plant away from direct sunlight', 'Provide filtered or indirect light', 'Gradually acclimate to brighter spots over weeks', 'Trim severely burned leaves'],
        spawnCondition: 'Light sensing threshold exceeded (simulated)',
    },

    fungus_phil: {
        type: 'fungus_phil',
        name: 'Fungus Phil',
        disease: 'Fungal Infection',
        subtitle: 'The Spore Zombie',
        color: colors.zombie.funguPhil,
        emoji: '🍄',
        threatLevel: 4,
        lore: {
            backstory: 'Fungus Phil is basically a walking mushroom with attitude. He thrives in dark, humid corners and spreads his spores with reckless abandon. He considers himself an "influencer" (of disease).',
            whatIsIt: 'Fungal infections manifest as powdery mildew, leaf spots, or fuzzy growth on plant surfaces. They spread through spores in the air.',
            whyItHappens: 'High humidity without air circulation, overcrowding plants, wet leaves (especially overnight), or contaminated soil.',
            earlyWarnings: ['White powdery coating on leaves', 'Black or brown spots with yellow halos', 'Fuzzy gray mold on soil surface', 'Leaves becoming sticky or slimy'],
            science: 'Fungal pathogens reproduce via spores that germinate in moist conditions. Once established, hyphae penetrate plant tissue, extracting nutrients and disrupting cellular function.',
            weakness: 'Good air circulation and reduced humidity',
            plantsAffected: 'All plants, especially in humid environments',
        },
        defeatSteps: ['Improve air circulation around plants', 'Reduce humidity and avoid misting', 'Remove affected leaves immediately', 'Apply neem oil or fungicide if severe'],
        spawnCondition: 'High humidity + poor air flow (simulated)',
    },

    the_swarm: {
        type: 'the_swarm',
        name: 'The Swarm',
        disease: 'Pest Infestation',
        subtitle: 'The Bug Zombie',
        color: colors.zombie.theSwarm,
        emoji: '🐛',
        threatLevel: 4,
        lore: {
            backstory: 'The Swarm isn\'t one zombie — it\'s thousands of tiny ones working together. Think of them as a really annoying flash mob that eats your plants. They\'re small but VERY persistent.',
            whatIsIt: 'Common houseplant pests include spider mites, mealybugs, aphids, scale insects, and fungus gnats. They feed on plant sap or roots.',
            whyItHappens: 'New plants brought home without quarantine, open windows, contaminated soil, or weakened plants that can\'t resist infestation.',
            earlyWarnings: ['Tiny webs between leaves (spider mites)', 'White cottony masses (mealybugs)', 'Sticky residue on leaves (honeydew)', 'Tiny flies around soil (fungus gnats)', 'Yellow stippling on leaves'],
            science: 'Sap-sucking insects pierce plant cells with stylet mouthparts, extracting phloem sap rich in sugars. This weakens plants and can transmit viral diseases between hosts.',
            weakness: 'Neem oil, insecticidal soap, and quarantine',
            plantsAffected: 'All plants — especially stressed ones',
        },
        defeatSteps: ['Isolate affected plant immediately', 'Wipe leaves with soapy water or neem oil', 'Check all nearby plants for spread', 'Treat weekly until pests are gone'],
        spawnCondition: 'Neglected plant health check (simulated)',
    },

    neglecto: {
        type: 'neglecto',
        name: 'Neglecto',
        disease: 'General Neglect',
        subtitle: 'The Boss Zombie',
        color: colors.zombie.neglecto,
        emoji: '👻',
        threatLevel: 5,
        lore: {
            backstory: 'Neglecto is the final boss. He doesn\'t cause any specific disease — he IS the disease. He represents every forgotten watering, every ignored drooping leaf, every "I\'ll check on it tomorrow" that became next month.',
            whatIsIt: 'General neglect is the combination of inconsistent care: irregular watering, ignoring light needs, never checking for pests, and forgetting your plant exists.',
            whyItHappens: 'Busy life, lack of knowledge, no routine, or simply forgetting. It happens to everyone — the key is building habits.',
            earlyWarnings: ['You can\'t remember the last time you watered', 'Dust accumulating on leaves', 'Plant hasn\'t been checked in weeks', 'Multiple symptoms appearing at once'],
            science: 'Plants are resilient organisms, but they require consistent environmental conditions. Chronic neglect leads to cumulative stress that compromises immune function, making plants vulnerable to opportunistic diseases.',
            weakness: 'Building a consistent care routine',
            plantsAffected: 'Every plant ever. Literally all of them.',
        },
        defeatSteps: ['Set up a daily check-in reminder', 'Create a watering schedule', 'Learn your plant\'s specific needs', 'Start with just 2 minutes of plant time per day'],
        spawnCondition: 'No app interaction for 7+ days',
    },
};

export const zombieTypeList: ZombieType[] = ['drownface', 'thirster', 'sunscorch', 'fungus_phil', 'the_swarm', 'neglecto'];
