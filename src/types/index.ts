// Plantasia: Guardians — All TypeScript Types

// ─── Personality System ───

export type PersonalityType = 'dramatic' | 'chill' | 'anxious' | 'wise' | 'cheerful';

export interface Personality {
    type: PersonalityType;
    quirks: string[];
    speakingStyle: string;
}

// ─── Plant Characters ───

export type PlantHealthStatus = 'healthy' | 'threatened' | 'in_battle' | 'damaged' | 'dead';

export interface PlantCharacter {
    id: string;
    species: string;
    commonName: string;
    nickname: string;
    personality: Personality;
    avatarColor: string; // for procedural avatar
    healthStatus: PlantHealthStatus;
    position: { x: number; y: number; z: number }; // garden grid position
    xp: number;
    level: number;
    happiness: number; // 0-100
    streak: number;
    shieldStrength: number; // 0-100, builds when soil is healthy
    lastCheckIn?: string; // ISO date of last daily check-in
    createdAt: string;
}

// ─── Zombie Enemies ───

export type ZombieType = 'drownface' | 'thirster' | 'sunscorch' | 'fungus_phil' | 'the_swarm' | 'neglecto';
export type ZombieState = 'approaching' | 'arrived' | 'defeated';

export interface ZombieLore {
    backstory: string;
    whatIsIt: string;
    whyItHappens: string;
    earlyWarnings: string[];
    science: string;
    weakness: string;
    plantsAffected: string;
}

export interface ZombieEnemy {
    id: string;
    type: ZombieType;
    name: string;
    disease: string;
    subtitle: string;
    state: ZombieState;
    targetPlantId: string;
    threatLevel: 1 | 2 | 3 | 4 | 5;
    lore: ZombieLore;
    color: string;
    emoji: string;
    defeatSteps: string[];
    position: { x: number; y: number; z: number };
    progress: number; // 0-1, how close to plant
}

// ─── Quest System ───

export type QuestType = 'care' | 'battle' | 'daily' | 'photo' | 'touch';

export interface QuestStep {
    id: string;
    description: string;
    completed: boolean;
}

export interface QuestReward {
    coins: number;
    xp: number;
    trophy?: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    steps: QuestStep[];
    reward: QuestReward;
    zombieId?: string; // linked zombie-specific quest
    plantId?: string;
    timeLimit?: number; // hours
    active: boolean;
    completed: boolean;
    educational: string; // tie-in to learning
}

// ─── Sensor / Hardware ───

export interface SensorData {
    soilMoisture: number; // 0-100 percentage
    gsrValue: number;
    gsrVariance: number;
    touchDetected: boolean;
    timestamp: number;
}

export type SensorConnectionState = 'disconnected' | 'connecting' | 'connected_real' | 'connected_simulated';
export type EmotionalState = 'sleepy' | 'content' | 'curious' | 'excited' | 'startled';

// ─── UI State ───

export type ActivePanel =
    | 'none' | 'plant_detail' | 'plant_chat' | 'zombie_info' | 'quest_list'
    | 'scan' | 'health_check' | 'diagnosis'
    | 'sensor_pair' | 'daily_checkin' | 'checkin_result' | 'shop';

export interface ChatMessage {
    id: string;
    sender: 'plant' | 'user';
    text: string;
    timestamp: number;
}

// ─── Shop & Garden ───

export type GardenSize = 'small' | 'medium' | 'large';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'garden_upgrade' | 'cosmetic';
    icon: string;        // lucide icon name
    owned: boolean;
    gardenSize?: GardenSize; // for garden upgrades
}

// ─── Daily Check-In ───

export interface CheckInRecord {
    id: string;
    plantId: string;
    date: string; // ISO date
    healthy: boolean;
    coins: number;
    zombieType?: ZombieType;
    tips?: string[];
}

export interface CheckInAnalysis {
    healthy: boolean;
    confidence: number;
    tips: string[];
    coins: number;
    // unhealthy path
    zombieType?: ZombieType;
    disease?: string;
    severity?: 'minor' | 'moderate' | 'severe' | 'critical';
    explanation?: string;
    defeatSteps?: string[];
}

// ─── Care Tasks ───

export interface CareTask {
    id: string;
    plantId: string;
    title: string;
    description: string;
    coins: number;
    completed: boolean;
    zombieType: ZombieType; // zombie that spawns if neglected
    sensorDriven: boolean;  // true = from sensor data
}

// ─── Gemini AI Responses ───

export interface IdentificationResult {
    species: string;
    commonName: string;
    confidence: number;
    careLevel: 'easy' | 'moderate' | 'difficult';
}

export interface PersonalityResult {
    suggestedName: string;
    personality: Personality;
}

export interface DiagnosisResult {
    zombieType: ZombieType;
    disease: string;
    confidence: number;
    severity: 'minor' | 'moderate' | 'severe' | 'critical';
    explanation: string;
    defeatSteps: string[];
}

// ─── Game Events ───

export type GameEvent =
    | { type: 'zombie_spawned'; zombieId: string; zombieType: ZombieType; targetPlantId: string }
    | { type: 'zombie_defeated'; zombieId: string }
    | { type: 'quest_completed'; questId: string; reward: QuestReward }
    | { type: 'plant_touched'; plantId: string; coins: number }
    | { type: 'shield_built'; plantId: string; strength: number }
    | { type: 'plant_added'; plantId: string }
    | { type: 'coins_earned'; amount: number; reason: string }
    | { type: 'daily_checkin'; plantId: string; healthy: boolean; coins: number }
    | { type: 'shop_purchase'; itemId: string; cost: number };
