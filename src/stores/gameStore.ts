// Plantasia: Guardians — Game Store (Zustand)
import { create } from 'zustand';
import type {
    PlantCharacter, ZombieEnemy, Quest, SensorData,
    SensorConnectionState, ActivePanel, ChatMessage, GameEvent,
    GardenSize, ShopItem, CheckInRecord, CareTask, CheckInAnalysis
} from '../types';
import { mockPlants, mockZombies, mockQuests } from '../services/mockData';
import { defaultShopItems } from '../services/shopData';

interface GameState {
    // ─── Entities ───
    plants: PlantCharacter[];
    zombies: ZombieEnemy[];
    quests: Quest[];

    // ─── Resources ───
    coins: number;
    trophies: string[];

    // ─── Garden ───
    gardenSize: GardenSize;

    // ─── Shop ───
    shopItems: ShopItem[];

    // ─── Check-In ───
    checkInHistory: CheckInRecord[];
    selectedCheckInPlantId: string | null;
    lastCheckInResult: CheckInAnalysis | null;

    // ─── Care Tasks ───
    careTasks: CareTask[];

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
    addQuest: (quest: Quest) => void;

    // ─── Actions: Sensor ───
    updateSensorData: (data: SensorData) => void;
    setSensorConnection: (state: SensorConnectionState) => void;

    // ─── Actions: Shop & Garden ───
    purchaseItem: (itemId: string) => boolean;
    expandGarden: (size: GardenSize) => void;

    // ─── Actions: Check-In ───
    recordCheckIn: (record: CheckInRecord) => void;
    setSelectedCheckInPlant: (id: string | null) => void;
    setLastCheckInResult: (result: CheckInAnalysis | null) => void;

    // ─── Actions: Care Tasks ───
    setCareTasks: (tasks: CareTask[]) => void;
    completeCareTask: (taskId: string) => void;

    // ─── Actions: UI ───
    setActivePanel: (panel: ActivePanel) => void;
    selectPlant: (id: string | null) => void;
    selectZombie: (id: string | null) => void;
    addChatMessage: (plantId: string, message: ChatMessage) => void;
    setChatLoading: (loading: boolean) => void;
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => boolean;
    addTrophy: (trophy: string) => void;
    pushGameEvent: (event: GameEvent) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // ─── Initial State ───
    plants: mockPlants,
    zombies: mockZombies,
    quests: mockQuests,
    coins: 150,
    trophies: [],
    gardenSize: 'small',
    shopItems: defaultShopItems,
    checkInHistory: [],
    selectedCheckInPlantId: null,
    lastCheckInResult: null,
    careTasks: [],
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
    addQuest: (quest) => set(s => ({ quests: [...s.quests, quest] })),

    // ─── Sensor Actions ───
    updateSensorData: (data) => set({ sensorData: data }),
    setSensorConnection: (state) => set({ sensorConnection: state }),

    // ─── Shop & Garden Actions ───
    purchaseItem: (itemId) => {
        const item = get().shopItems.find(i => i.id === itemId);
        if (!item || item.owned || get().coins < item.price) return false;
        set(s => ({
            coins: s.coins - item.price,
            shopItems: s.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i),
        }));
        get().pushGameEvent({ type: 'shop_purchase', itemId, cost: item.price });
        // If it's a garden upgrade, expand
        if (item.gardenSize) {
            get().expandGarden(item.gardenSize);
        }
        return true;
    },
    expandGarden: (size) => set({ gardenSize: size }),

    // ─── Check-In Actions ───
    recordCheckIn: (record) => set(s => ({
        checkInHistory: [...s.checkInHistory, record],
        plants: s.plants.map(p =>
            p.id === record.plantId
                ? { ...p, lastCheckIn: record.date, streak: record.healthy ? p.streak + 1 : 0 }
                : p
        ),
    })),
    setSelectedCheckInPlant: (id) => set({ selectedCheckInPlantId: id }),
    setLastCheckInResult: (result) => set({ lastCheckInResult: result }),

    // ─── Care Task Actions ───
    setCareTasks: (tasks) => set({ careTasks: tasks }),
    completeCareTask: (taskId) => {
        const task = get().careTasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        set(s => ({
            careTasks: s.careTasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
            coins: s.coins + task.coins,
        }));
        get().pushGameEvent({ type: 'coins_earned', amount: task.coins, reason: `Care task: ${task.title}` });
    },

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
    spendCoins: (amount) => {
        if (get().coins < amount) return false;
        set(s => ({ coins: s.coins - amount }));
        return true;
    },
    addTrophy: (trophy) => set(s => ({ trophies: [...s.trophies, trophy] })),
    pushGameEvent: (event) => set(s => ({
        gameEvents: [...s.gameEvents.slice(-20), event],
    })),
}));

