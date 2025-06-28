import * as SQLite from 'expo-sqlite';

// Database instance
let db: SQLite.SQLiteDatabase;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('quibly.db');
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create tables
const createTables = async (): Promise<void> => {
  try {
    // Create routines table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        routine_type TEXT NOT NULL,
        repeat_type TEXT NOT NULL,
        time_of_day TEXT NOT NULL,
        day_of_week TEXT,
        day_of_month INTEGER,
        is_active BOOLEAN DEFAULT 1
      );
    `);

    // Create notes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        parsed_time DATETIME,
        is_completed BOOLEAN DEFAULT 0,
        routine_id INTEGER,
        FOREIGN KEY (routine_id) REFERENCES routines(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('sender', 'answer')),
        timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const messageOperations = {
  insert: async (message: Omit<any, 'id'>) => {
    const result = await db.runAsync(
      'INSERT INTO messages (message, type, timestamp) VALUES (?, ?, ?)',
      [message.message, message.type, message.timestamp]
    );
    return result.lastInsertRowId;
  },

  getAll: async () => {
    return await db.getAllAsync('SELECT * FROM messages ORDER BY created_at ASC');
  },

  delete: async (id: number) => {
    return await db.runAsync('DELETE FROM messages WHERE id = ?', [id]);
  },

  deleteAll: async () => {
    return await db.runAsync('DELETE FROM messages');
  }
};

// Get database instance
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Database operations for routines
export const routineOperations = {
  insert: async (routine: Omit<any, 'id'>) => {
    const result = await db.runAsync(
      'INSERT INTO routines (title, routine_type, repeat_type, time_of_day, day_of_week, day_of_month, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [routine.title, routine.routine_type, routine.repeat_type, routine.time_of_day, routine.day_of_week, routine.day_of_month, routine.is_active ?? 1]
    );
    return result.lastInsertRowId;
  },

  getAll: async () => {
    return await db.getAllAsync('SELECT * FROM routines ORDER BY id DESC');
  },

  getById: async (id: number) => {
    return await db.getFirstAsync('SELECT * FROM routines WHERE id = ?', [id]);
  },

  update: async (id: number, routine: Partial<any>) => {
    const fields = Object.keys(routine).map(key => `${key} = ?`).join(', ');
    const values = Object.values(routine);
    return await db.runAsync(`UPDATE routines SET ${fields} WHERE id = ?`, [...values, id]);
  },

  delete: async (id: number) => {
    return await db.runAsync('DELETE FROM routines WHERE id = ?', [id]);
  }
};

// Database operations for notes
export const noteOperations = {
  insert: async (note: Omit<any, 'id'>) => {
    const result = await db.runAsync(
      'INSERT INTO notes (content, category, parsed_time, is_completed, routine_id) VALUES (?, ?, ?, ?, ?)',
      [note.content, note.category, note.parsed_time, note.is_completed ?? 0, note.routine_id]
    );
    return result.lastInsertRowId;
  },

  getAll: async () => {
    return await db.getAllAsync('SELECT * FROM notes ORDER BY created_at DESC');
  },

  getById: async (id: number) => {
    return await db.getFirstAsync('SELECT * FROM notes WHERE id = ?', [id]);
  },

  getByRoutineId: async (routineId: number) => {
    return await db.getAllAsync('SELECT * FROM notes WHERE routine_id = ? ORDER BY created_at DESC', [routineId]);
  },

  update: async (id: number, note: Partial<any>) => {
    const fields = Object.keys(note).map(key => `${key} = ?`).join(', ');
    const values = Object.values(note);
    return await db.runAsync(`UPDATE notes SET ${fields} WHERE id = ?`, [...values, id]);
  },

  delete: async (id: number) => {
    return await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  }
};
