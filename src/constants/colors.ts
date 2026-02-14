// Plantasia: Guardians — Color Palette
// From idea.md: Bright, colorful, stylized. NOT dark.

export const colors = {
    // Garden environment
    garden: {
        grass: '#90C67C',
        soil: '#8B6F47',
        sky: '#87CEEB',
        skyLight: '#F0F7DA',
        fence: '#A0845C',
    },

    // Plant health
    plant: {
        healthy: '#4ADE80',
        healthyDeep: '#22C55E',
        threatened: '#FBBF24',
        damaged: '#9CA3AF',
        dead: '#6B7280',
    },

    // Zombie types (color-coded by disease)
    zombie: {
        drownface: '#60A5FA',   // blue — overwatering/root rot
        thirster: '#F59E0B',    // orange/amber — dehydration
        sunscorch: '#EF4444',   // red — light burn
        funguPhil: '#A855F7',   // purple — fungal infection
        theSwarm: '#84CC16',    // lime — pest infestation
        neglecto: '#6B7280',    // gray — general neglect (boss)
    },

    // UI elements
    ui: {
        coins: '#FBBF24',
        hearts: '#F87171',
        button: '#3B82F6',
        buttonHover: '#2563EB',
        shield: '#38BDF8',
    },

    // Text
    text: {
        primary: '#1F2937',
        secondary: '#4B5563',
        muted: '#9CA3AF',
        inverse: '#FFFFFF',
        accent: '#059669',
    },

    // Backgrounds & panels
    bg: {
        panel: 'rgba(255, 255, 255, 0.95)',
        panelDark: 'rgba(31, 41, 55, 0.9)',
        overlay: 'rgba(0, 0, 0, 0.4)',
        card: '#FFFFFF',
        cardHover: '#F9FAFB',
    },

    // Danger states ("game-y" not alarming)
    danger: {
        warning: '#FB923C',
        critical: '#EF4444',
        safe: '#4ADE80',
    },

    // Personality accent colors
    personality: {
        dramatic: '#EC4899',
        chill: '#06B6D4',
        anxious: '#F59E0B',
        wise: '#8B5CF6',
        cheerful: '#F97316',
    },

    // Sensor/hardware
    sensor: {
        connected: '#22C55E',
        simulated: '#FBBF24',
        disconnected: '#EF4444',
        moistureHigh: '#60A5FA',
        moistureOk: '#4ADE80',
        moistureLow: '#F59E0B',
    },
} as const;

export type ColorKey = keyof typeof colors;
