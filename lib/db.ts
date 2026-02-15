import * as SQLite from 'expo-sqlite';

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

const db = SQLite.openDatabase('goals.db');
let initialized = false;
let initializing: Promise<void> | null = null;

function executeAsync(sql: string, params: Array<string | number | null> = []) {
  return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function ensureReady() {
  if (initialized) {
    return;
  }
  if (!initializing) {
    initializing = (async () => {
      await executeAsync('PRAGMA foreign_keys = ON');
      await executeAsync(
        `CREATE TABLE IF NOT EXISTS account (
          id INTEGER PRIMARY KEY NOT NULL,
          balance REAL NOT NULL
        );`
      );
      await executeAsync(
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
      await executeAsync(
        `CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
        );`
      );

      const accountCount = await executeAsync('SELECT COUNT(*) as count FROM account');
      if (accountCount.rows.item(0).count === 0) {
        await executeAsync('INSERT INTO account (id, balance) VALUES (?, ?)', [1, 23400]);
      }

      const goalCount = await executeAsync('SELECT COUNT(*) as count FROM goals');
      if (goalCount.rows.item(0).count === 0) {
        await executeAsync(
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
        await executeAsync(
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
        await executeAsync(
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

        await executeAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Goal top up', 320, '2026-02-12T12:00:00Z']
        );
        await executeAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Card transfer', 120, '2026-02-10T09:30:00Z']
        );
        await executeAsync(
          'INSERT INTO transactions (goal_id, title, amount, created_at) VALUES (?, ?, ?, ?)',
          [1, 'Cash deposit', 80, '2026-02-07T08:15:00Z']
        );
      }

      initialized = true;
    })();
  }
  await initializing;
}

export async function getAccountBalance() {
  await ensureReady();
  const result = await executeAsync('SELECT balance FROM account WHERE id = 1');
  return result.rows.length ? (result.rows.item(0).balance as number) : 0;
}

export async function getGoals() {
  await ensureReady();
  const result = await executeAsync('SELECT * FROM goals ORDER BY id ASC');
  return result.rows._array as Goal[];
}

export async function getGoalById(id: number) {
  await ensureReady();
  const result = await executeAsync('SELECT * FROM goals WHERE id = ?', [id]);
  return result.rows.length ? (result.rows.item(0) as Goal) : null;
}

export async function getTransactionsForGoal(goalId: number) {
  await ensureReady();
  const result = await executeAsync(
    'SELECT * FROM transactions WHERE goal_id = ? ORDER BY created_at DESC',
    [goalId]
  );
  return result.rows._array as Transaction[];
}
