export type Language = 'ja' | 'en';

export type Outcome = 'didInstead' | 'openedAnyway';

export type StatsPeriod = 'week' | 'month' | 'year';

export type DefaultReasonKey =
  | 'bored'
  | 'tired'
  | 'wantApproval'
  | 'comparingMyself'
  | 'checkingNotifications'
  | 'wantStimulation'
  | 'lonely'
  | 'justHabit'
  | 'other';

export type DefaultActionKey =
  | 'deepBreaths'
  | 'drinkWater'
  | 'squats'
  | 'kindle'
  | 'vocabulary'
  | 'memo'
  | 'lieDown'
  | 'other';

export interface PauseItem<DefaultKey extends string = string> {
  id: string;
  label: string;
  defaultKey?: DefaultKey;
}

export type ReasonItem = PauseItem<DefaultReasonKey>;
export type ActionItem = PauseItem<DefaultActionKey>;

export interface PauseLog {
  id: string;
  timestamp: string;
  version: 3;
  selectedReason: string;
  selectedAction: string;
  outcome: Outcome;
}

export interface DaySummary {
  date: string;
  didInstead: number;
  openedAnyway: number;
}

export interface TrendSummary {
  label: string;
  didInstead: number;
  openedAnyway: number;
}

export interface RankingItem {
  label: string;
  count: number;
}
