import type { ActionItem, DaySummary, Language, Outcome, PauseLog, RankingItem, ReasonItem, StatsPeriod, TrendSummary } from './types';

const LOGS_KEY = 'dopapause.logs.v2';
const LEGACY_RECORDS_KEY = 'dopapause.records.v1';
const LANGUAGE_KEY = 'dopapause.language.v1';
const REASONS_KEY = 'dopapause.reasons.v1';
const ACTIONS_KEY = 'dopapause.actions.v1';
const COUNTDOWN_SECONDS_KEY = 'dopapause.countdownSeconds.v1';

export const defaultReasons: ReasonItem[] = [
  { id: 'reason-bored', defaultKey: 'bored', label: 'Bored' },
  { id: 'reason-tired', defaultKey: 'tired', label: 'Tired' },
  { id: 'reason-want-approval', defaultKey: 'wantApproval', label: 'Want approval' },
  { id: 'reason-comparing', defaultKey: 'comparingMyself', label: 'Checking someone' },
  { id: 'reason-notifications', defaultKey: 'checkingNotifications', label: 'Checking notifications' },
  { id: 'reason-stimulation', defaultKey: 'wantStimulation', label: 'Want stimulation' },
  { id: 'reason-habit', defaultKey: 'justHabit', label: 'Just habit' },
  { id: 'reason-other', defaultKey: 'other', label: 'Other' },
];

export const defaultActions: ActionItem[] = [
  { id: 'action-breaths', defaultKey: 'deepBreaths', label: 'Take 3 deep breaths' },
  { id: 'action-water', defaultKey: 'drinkWater', label: 'Drink water' },
  { id: 'action-squats', defaultKey: 'squats', label: 'Do 10 squats' },
  { id: 'action-kindle', defaultKey: 'kindle', label: 'Read 1 page on Kindle' },
  { id: 'action-vocab', defaultKey: 'vocabulary', label: 'Do 5 vocabulary questions' },
  { id: 'action-memo', defaultKey: 'memo', label: 'Write 1 line in memo' },
  { id: 'action-lie-down', defaultKey: 'lieDown', label: 'Lie down for 3 minutes' },
  { id: 'action-other', defaultKey: 'other', label: 'Other' },
];

export function loadLogs(): PauseLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeLog).filter(isPauseLog) : [];
    }

    const legacyRaw = localStorage.getItem(LEGACY_RECORDS_KEY);
    if (!legacyRaw) return [];
    const legacy = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy)) return [];

    const migrated = legacy.map((record): PauseLog => {
      const reason = typeof record.reason === 'string' ? record.reason : 'Unknown';
      const action = typeof record.alternativeAction === 'string' ? record.alternativeAction : '';
      const outcome: Outcome = record.outcome === 'opened' ? 'openedAnyway' : 'didInstead';
      return {
        id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
        timestamp: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
        selectedReason: reason,
        selectedAction: action,
        outcome,
      };
    });

    saveLogs(migrated);
    return migrated;
  } catch {
    return [];
  }
}

function normalizeLog(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const log = value as { selectedAction?: unknown };
  return {
    ...log,
    selectedAction: typeof log.selectedAction === 'string' ? log.selectedAction : '',
  };
}

export function saveLogs(logs: PauseLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function loadReasons(): ReasonItem[] {
  return loadItems(REASONS_KEY, defaultReasons);
}

export function saveReasons(reasons: ReasonItem[]) {
  saveItems(REASONS_KEY, reasons, defaultReasons);
}

export function loadActions(): ActionItem[] {
  return loadItems(ACTIONS_KEY, defaultActions);
}

export function saveActions(actions: ActionItem[]) {
  saveItems(ACTIONS_KEY, actions, defaultActions);
}

export function loadCountdownSeconds() {
  const saved = Number(localStorage.getItem(COUNTDOWN_SECONDS_KEY));
  return normalizeCountdownSeconds(saved);
}

export function saveCountdownSeconds(seconds: number) {
  localStorage.setItem(COUNTDOWN_SECONDS_KEY, String(normalizeCountdownSeconds(seconds)));
}

export function normalizeCountdownSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) return 10;
  return Math.min(60, Math.max(3, Math.round(seconds)));
}

export function loadLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  return saved === 'en' || saved === 'ja' ? saved : 'ja';
}

export function saveLanguage(language: Language) {
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodaySummary(logs: PauseLog[]): DaySummary {
  return summarizeDay(logs, dateKey(new Date()));
}

export function getLastSevenDays(logs: PauseLog[]): DaySummary[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return summarizeDay(logs, dateKey(date));
  });
}

export function getPeriodLogs(logs: PauseLog[], period: StatsPeriod): PauseLog[] {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'week') {
    start.setDate(start.getDate() - 6);
  }

  if (period === 'month') {
    start.setDate(1);
  }

  if (period === 'year') {
    start.setMonth(0, 1);
  }

  return logs.filter((log) => new Date(log.timestamp) >= start);
}

export function getPeriodTrend(logs: PauseLog[], period: StatsPeriod): TrendSummary[] {
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const summary = summarizeDay(logs, dateKey(date));
      return {
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        didInstead: summary.didInstead,
        openedAnyway: summary.openedAnyway,
      };
    });
  }

  if (period === 'month') {
    const now = new Date();
    return Array.from({ length: now.getDate() }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
      const summary = summarizeDay(logs, dateKey(date));
      return {
        label: String(index + 1),
        didInstead: summary.didInstead,
        openedAnyway: summary.openedAnyway,
      };
    });
  }

  const now = new Date();
  return Array.from({ length: now.getMonth() + 1 }, (_, index) => {
    const monthLogs = logs.filter((log) => {
      const date = new Date(log.timestamp);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === index;
    });
    return {
      label: String(index + 1),
      didInstead: monthLogs.filter((log) => log.outcome === 'didInstead').length,
      openedAnyway: monthLogs.filter((log) => log.outcome === 'openedAnyway').length,
    };
  });
}

export function getRankings(logs: PauseLog[], field: 'selectedReason' | 'selectedAction'): RankingItem[] {
  const counts = logs.reduce<Record<string, number>>((acc, log) => {
    const label = log[field];
    if (!label) return acc;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getDidInsteadRate(logs: PauseLog[]) {
  if (logs.length === 0) return 0;
  const didInstead = logs.filter((log) => log.outcome === 'didInstead').length;
  return Math.round((didInstead / logs.length) * 100);
}

function summarizeDay(logs: PauseLog[], day: string): DaySummary {
  const dayLogs = logs.filter((log) => dateKey(new Date(log.timestamp)) === day);
  return {
    date: day,
    didInstead: dayLogs.filter((log) => log.outcome === 'didInstead').length,
    openedAnyway: dayLogs.filter((log) => log.outcome === 'openedAnyway').length,
  };
}

function loadItems<T extends ReasonItem | ActionItem>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    const valid = parsed.filter(isPauseItem) as T[];
    if (valid.length === 0) return defaults;

    return defaults.map((defaultItem) => {
      const savedItem = valid.find((item) => item.defaultKey === defaultItem.defaultKey || item.id === defaultItem.id);
      if (!savedItem || defaultItem.defaultKey === 'other') return defaultItem;
      return { ...defaultItem, label: savedItem.label };
    });
  } catch {
    return defaults;
  }
}

function saveItems<T extends ReasonItem | ActionItem>(key: string, items: T[], defaults: T[]) {
  localStorage.setItem(key, JSON.stringify(items.length > 0 ? items : defaults));
}

function isPauseItem(value: unknown): value is ReasonItem | ActionItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as { id?: unknown; label?: unknown };
  return typeof item.id === 'string' && typeof item.label === 'string';
}

function isPauseLog(value: unknown): value is PauseLog {
  if (!value || typeof value !== 'object') return false;
  const log = value as {
    id?: unknown;
    timestamp?: unknown;
    selectedReason?: unknown;
    selectedAction?: unknown;
    outcome?: unknown;
  };
  return (
    typeof log.id === 'string' &&
    typeof log.timestamp === 'string' &&
    typeof log.selectedReason === 'string' &&
    typeof log.selectedAction === 'string' &&
    (log.outcome === 'didInstead' || log.outcome === 'openedAnyway')
  );
}
