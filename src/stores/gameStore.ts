// Plantasia: Guardians — Game Store (Zustand)
import { create } from 'zustand';
import type {
    PlantCharacter, ZombieEnemy, Quest, SensorData,
    SensorConnectionState, ActivePanel, ChatMessage, GameEvent
} from '../types';
import { mockPlants, mockZombies, mockQuests } from '../services/mockData';

interface GameState {
    // ─── Entities ───
    plants: PlantCharacter[];
    zombies: ZombieEnemy[];
    quests: Quest[];

    // ─── Resources ───
    coins: number;
    trophies: string[];

    // ─── Sensor ───
    sensorData: SensorData | null;
    sensorConnection: SensorConnectionState;

    // ─── UI State ───
    activePanel: ActivePanel;
    selectedPlantId: string | null;
    selectedZombieId: string | null;
    chatMessages: Record<string, ChatMessage[]>; // plantId -> messages
    isChatLoading: boolean;
    gameEvents: GameEvent[];

    // ─── Actions: Plants ───
    addPlant: (plant: PlantCharacter) => void;
    updatePlantHealth: (id: string, status: PlantCharacter['healthStatus'], happiness: number) => void;
    updatePlantShield: (id: string, strength: number) => void;

    // ─── Actions: Zombies ───
    spawnZombie: (zombie: ZombieEnemy) => void;
    updateZombieProgress: (id: string, progress: number) => void;
    defeatZombie: (id: string) => void;

    // ─── Actions: Quests ───
    activateQuest: (id: string) => void;
    completeQuestStep: (questId: string, stepId: string) => void;
    completeQuest: (id: string) => void;

    // ─── Actions: Sensor ───
    updateSensorData: (data: SensorData) => void;
    setSensorConnection: (state: SensorConnectionState) => void;

    // ─── Actions: UI ───
    setActivePanel: (panel: ActivePanel) => void;
    selectPlant: (id: string | null) => void;
    selectZombie: (id: string | null) => void;
    addChatMessage: (plantId: string, message: ChatMessage) => void;
    setChatLoading: (loading: boolean) => void;
    addCoins: (amount: number) => void;
    addTrophy: (trophy: string) => void;
    pushGameEvent: (event: GameEvent) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // ─── Initial State (loaded from mock data) ───
    plants: mockPlants,
    zombies: mockZombies,
    quests: mockQuests,
    coins: 150,
    trophies: [],
    sensorData: null,
    sensorConnection: 'disconnected',
    activePanel: 'none',
    selectedPlantId: null,
    selectedZombieId: null,
    chatMessages: {},
    isChatLoading: false,
    gameEvents: [],

    // ─── Plant Actions ───
    addPlant: (plant) => set(s => ({ plants: [...s.plants, plant] })),
    updatePlantHealth: (id, status, happiness) => set(s => ({
        plants: s.plants.map(p => p.id === id ? { ...p, healthStatus: status, happiness } : p),
    })),
    updatePlantShield: (id, strength) => set(s => ({
        plants: s.plants.map(p => p.id === id ? { ...p, shieldStrength: Math.min(100, strength) } : p),
    })),

    // ─── Zombie Actions ───
    spawnZombie: (zombie) => set(s => ({ zombies: [...s.zombies, zombie] })),
    updateZombieProgress: (id, progress) => set(s => ({
        zombies: s.zombies.map(z => z.id === id ? { ...z, progress: Math.min(1, progress) } : z),
    })),
    defeatZombie: (id) => set(s => ({
        zombies: s.zombies.map(z => z.id === id ? { ...z, state: 'defeated' as const } : z),
    })),

    // ─── Quest Actions ───
    activateQuest: (id) => set(s => ({
        quests: s.quests.map(q => q.id === id ? { ...q, active: true } : q),
    })),
    completeQuestStep: (questId, stepId) => set(s => ({
        quests: s.quests.map(q =>
            q.id === questId
                ? { ...q, steps: q.steps.map(step => step.id === stepId ? { ...step, completed: true } : step) }
                : q
        ),
    })),
    completeQuest: (id) => {
        const quest = get().quests.find(q => q.id === id);
        if (!quest) return;
        set(s => ({
            quests: s.quests.map(q => q.id === id ? { ...q, completed: true, active: false } : q),
            coins: s.coins + quest.reward.coins,
        }));
        if (quest.reward.trophy) {
            get().addTrophy(quest.reward.trophy);
        }
    },

    // ─── Sensor Actions ───
    updateSensorData: (data) => set({ sensorData: data }),
    setSensorConnection: (state) => set({ sensorConnection: state }),

    // ─── UI Actions ───
    setActivePanel: (panel) => set({ activePanel: panel }),
    selectPlant: (id) => set({ selectedPlantId: id, activePanel: id ? 'plant_detail' : 'none' }),
    selectZombie: (id) => set({ selectedZombieId: id, activePanel: id ? 'zombie_info' : 'none' }),
    addChatMessage: (plantId, message) => set(s => ({
        chatMessages: {
            ...s.chatMessages,
            [plantId]: [...(s.chatMessages[plantId] || []), message],
        },
    })),
    setChatLoading: (loading) => set({ isChatLoading: loading }),
    addCoins: (amount) => set(s => ({ coins: s.coins + amount })),
    addTrophy: (trophy) => set(s => ({ trophies: [...s.trophies, trophy] })),
    pushGameEvent: (event) => set(s => ({
        gameEvents: [...s.gameEvents.slice(-20), event],
    })),
}));
