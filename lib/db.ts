import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export type Goal = {
  id: number;
  title: string;
  subtitle: string;
  current_amount: number;
  target_amount: number;
  due_date: string;
  color: string;
  icon: string;
};

export type Transaction = {
  id: number;
  goal_id: number;
  title: string;
  amount: number;
  created_at: string;
};

let dbInstance: Promise<SQLiteDatabase> | null = null;
let initialized = false;
let initializing: Promise<void> | null = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = openDatabaseAsync('goals.db');
  }
  return dbInstance;
}

async function execAsync(sql: string) {
  const db = await getDb();
  await db.execAsync(sql);
}

async function runAsync(sql: string, params: Array<string | number | null> = []) {
  const db = await getDb();
  return db.runAsync(sql, params);
}

async function getFirstAsync<T>(sql: string, params: Array<string | number | null> = []) {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
}

async function getAllAsync<T>(sql: string, params: Array<string | number | null> = []) {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
}

async function ensureReady() {
  if (initialized) {
    return;
  }
  if (!initializing) {
    initializing = (async () => {
      await execAsync('PRAGMA foreign_keys = ON;');
      await execAsync(
        `CREATE TABLE IF NOT EXISTS account (
          id INTEGER PRIMARY KEY NOT NULL,
          balance REAL NOT NULL
        );`
      );
      await execAsync(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          current_amount REAL NOT NULL,
          target_amount REAL NOT NULL,
          due_date TEXT NOT NULL,
          color TEXT NOT NULL,
          icon TEXT NOT NULL
        );`
      );
      await execAsync(
        `CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
        );`
      );

      const accountCount = await getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM account'
      );
      if (!accountCount || accountCount.count === 0) {
        await runAsync('INSERT INTO account (id, balance) VALUES (?, ?)', [1, 23400]);
      }

      const goalCount = await getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM goals');
      if (!goalCount || goalCount.count === 0) {
        await runAsync(
          'INSERT INTO goals (title, subtitle, current_amount, target_amount, due_date, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            'Summer vacation',
            'Lets focus so we can have fun',
            15000,
            50000,
            '2026-03-07',
            '#24C67A',
            'vacation',
          ]
        );
        await runAsync(
          'INSERT INTO goals (title, subtitle, current_amount, target_amount, due_date, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            'Real estate',
            'Down payment for a home',
            60500,
            230000,
            '2028-02-15',
            '#F59E0B',
            'estate',
          ]
        );
        await runAsync(
          'INSERT INTO goals (title, subtitle, current_amount, target_amount, due_date, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            'Magister education',
            'Plan for tuition',
            2000,
            20000,
            '2026-03-07',
            '#4F7CF5',
            'education',
          ]
        );

        await runAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Goal top up', 320, '2026-02-12T12:00:00Z']
        );
        await runAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Card transfer', 120, '2026-02-10T09:30:00Z']
        );
        await runAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Cash deposit', 80, '2026-02-07T08:15:00Z']
        );
      }

      const sampleTransactions = [
        [1, 'Goal top up', 320, '2026-02-12T12:00:00Z'],
        [1, 'Card transfer', 120, '2026-02-10T09:30:00Z'],
        [1, 'Cash deposit', 80, '2026-02-07T08:15:00Z'],
        [1, 'Auto save', 210, '2026-01-14T10:00:00Z'],
        [1, 'Bonus', 180, '2026-03-18T11:20:00Z'],
        [1, 'Side income', 260, '2026-04-22T15:45:00Z'],
        [1, 'Refund', 140, '2026-05-06T09:10:00Z'],
        [1, 'Cash deposit', 220, '2026-06-12T13:05:00Z'],
      ] as const;

      for (const [goalId, title, amount, createdAt] of sampleTransactions) {
        const existing = await getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM transactions WHERE goal_id = ? AND created_at = ?',
          [goalId, createdAt]
        );
        if (!existing || existing.count === 0) {
          await runAsync(
            'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
            [goalId, title, amount, createdAt]
          );
        }
      }

      initialized = true;
    })();
  }
  await initializing;
}

export async function getAccountBalance() {
  await ensureReady();
  const result = await getFirstAsync<{ balance: number }>('SELECT balance FROM account WHERE id = 1');
  return result?.balance ?? 0;
}

export async function getGoals() {
  await ensureReady();
  const result = await getAllAsync<Goal>('SELECT * FROM goals ORDER BY id ASC');
  return result;
}

export async function getGoalById(id: number) {
  await ensureReady();
  const result = await getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?', [id]);
  return result ?? null;
}

export async function getTransactionsForGoal(goalId: number) {
  await ensureReady();
  const result = await getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE goal_id = ? ORDER BY created_at DESC',
    [goalId]
  );
  return result;
}
