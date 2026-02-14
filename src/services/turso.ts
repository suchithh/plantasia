// Plantasia: Guardians — Turso Database Service
import { createClient } from '@libsql/client/web';

const client = createClient({
    url: import.meta.env.VITE_TURSO_DB_URL,
    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
});

// ─── Schema Init ───

export async function initDatabase(): Promise<void> {
    await client.batch([
        {
            sql: `CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY,
        species TEXT NOT NULL,
        common_name TEXT NOT NULL,
        nickname TEXT NOT NULL,
        personality_json TEXT NOT NULL,
        avatar_color TEXT DEFAULT '#4ADE80',
        health_status TEXT DEFAULT 'healthy',
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        happiness INTEGER DEFAULT 80,
        streak INTEGER DEFAULT 0,
        shield_strength INTEGER DEFAULT 0,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        position_z REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
            args: [],
        },
        {
            sql: `CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        plant_id TEXT,
        zombie_id TEXT,
        active INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        steps_json TEXT NOT NULL,
        reward_json TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
            args: [],
        },
        {
            sql: `CREATE TABLE IF NOT EXISTS trophies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        earned_at TEXT DEFAULT (datetime('now'))
      )`,
            args: [],
        },
        {
            sql: `CREATE TABLE IF NOT EXISTS sensor_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        soil_moisture REAL,
        gsr_value REAL,
        gsr_variance REAL,
        touch_detected INTEGER DEFAULT 0,
        timestamp TEXT DEFAULT (datetime('now'))
      )`,
            args: [],
        },
    ]);
}

// ─── Plant CRUD ───

export async function savePlant(plant: {
    id: string;
    species: string;
    commonName: string;
    nickname: string;
    personality: object;
    avatarColor: string;
    posX: number;
    posY: number;
    posZ: number;
}): Promise<void> {
    await client.execute({
        sql: `INSERT OR REPLACE INTO plants (id, species, common_name, nickname, personality_json, avatar_color, position_x, position_y, position_z)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [plant.id, plant.species, plant.commonName, plant.nickname, JSON.stringify(plant.personality), plant.avatarColor, plant.posX, plant.posY, plant.posZ],
    });
}

export async function loadPlants(): Promise<any[]> {
    const result = await client.execute({ sql: 'SELECT * FROM plants', args: [] });
    return result.rows.map(row => ({
        id: row.id,
        species: row.species,
        commonName: row.common_name,
        nickname: row.nickname,
        personality: JSON.parse(row.personality_json as string),
        avatarColor: row.avatar_color,
        healthStatus: row.health_status,
        xp: row.xp,
        level: row.level,
        happiness: row.happiness,
        streak: row.streak,
        shieldStrength: row.shield_strength,
        position: { x: row.position_x, y: row.position_y, z: row.position_z },
        createdAt: row.created_at,
    }));
}

export async function updatePlantHealth(id: string, status: string, happiness: number): Promise<void> {
    await client.execute({
        sql: 'UPDATE plants SET health_status = ?, happiness = ? WHERE id = ?',
        args: [status, happiness, id],
    });
}

// ─── Trophy CRUD ───

export async function saveTrophy(id: string, name: string, emoji: string): Promise<void> {
    await client.execute({
        sql: 'INSERT OR IGNORE INTO trophies (id, name, emoji) VALUES (?, ?, ?)',
        args: [id, name, emoji],
    });
}

export async function loadTrophies(): Promise<{ id: string; name: string; emoji: string }[]> {
    const result = await client.execute({ sql: 'SELECT * FROM trophies', args: [] });
    return result.rows.map(row => ({
        id: row.id as string,
        name: row.name as string,
        emoji: row.emoji as string,
    }));
}

// ─── Sensor Log ───

export async function logSensorData(data: {
    soilMoisture: number;
    gsrValue: number;
    gsrVariance: number;
    touchDetected: boolean;
}): Promise<void> {
    await client.execute({
        sql: 'INSERT INTO sensor_logs (soil_moisture, gsr_value, gsr_variance, touch_detected) VALUES (?, ?, ?, ?)',
        args: [data.soilMoisture, data.gsrValue, data.gsrVariance, data.touchDetected ? 1 : 0],
    });
}

export { client as tursoClient };
