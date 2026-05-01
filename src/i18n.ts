import type { ActionItem, DefaultActionKey, DefaultReasonKey, Language, ReasonItem } from './types';

export const translations = {
  en: {
    languageName: 'EN',
    status: '10-second intent check',
    tagline: 'Pause. Choose.',
    question: 'Why do you want to open it now?',
    records: 'Stats',
    settings: 'Settings',
    pause: 'Pause',
    pausesWonToday: 'did instead today',
    reason: 'Reason',
    waiting: 'Waiting...',
    chooseNextAction: 'Choose next action',
    beforeScrolling: 'Before scrolling',
    chooseOne: 'Choose one before scrolling',
    didInstead: 'Do this instead',
    openAnyway: 'Open it anyway',
    pauseTrail: 'Your pause trail',
    didInsteadToday: 'Did instead today',
    openedAnywayToday: 'Opened anyway today',
    lastSevenDays: 'Last 7 days',
    thisMonth: 'This month',
    thisYear: 'This year',
    week: '7 days',
    month: 'Month',
    year: 'Year',
    reasonRanking: 'Reason ranking',
    actionRanking: 'Action ranking',
    didInsteadRate: 'Did instead rate',
    noData: 'No records yet',
    times: 'times',
    pauseAnother: 'Pause another urge',
    langLabel: 'Language',
    settingsTitle: 'Customize',
    countdownSeconds: 'Pause seconds',
    reasonsTitle: 'Reasons',
    actionsTitle: 'Actions',
    customReasonPlaceholder: 'Type a reason',
    customActionPlaceholder: 'Type an action',
    useThis: 'Use this',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    fixed: 'Fixed',
    back: 'Back',
    emptyList: 'Keep at least one item.',
    pauseMessages: [
      'Choose, don’t react.',
      'Still want it?',
      'Is this helping future you?',
      'One pause can change the loop.',
    ],
    reasonLabels: {
      bored: 'Bored',
      tired: 'Tired',
      wantApproval: 'Want approval',
      comparingMyself: 'Checking someone',
      checkingNotifications: 'Checking notifications',
      wantStimulation: 'Want stimulation',
      lonely: 'Lonely',
      justHabit: 'Just habit',
      other: 'Other',
    },
    actionLabels: {
      deepBreaths: 'Take 3 deep breaths',
      drinkWater: 'Drink water',
      squats: 'Do 10 squats',
      kindle: 'Read 1 page on Kindle',
      vocabulary: 'Do 5 vocabulary questions',
      memo: 'Write 1 line in memo',
      lieDown: 'Lie down for 3 minutes',
      other: 'Other',
    },
  },
  ja: {
    languageName: '日本語',
    status: '10秒の衝動チェック',
    tagline: 'いったん止まる',
    question: '今、開きたくなった理由は？',
    records: '集計',
    settings: '設定',
    pause: 'チェック',
    pausesWonToday: '今日立ち止まった回数',
    reason: '理由',
    waiting: '待機中...',
    chooseNextAction: '次の行動を選ぶ',
    beforeScrolling: 'スクロールの前に',
    chooseOne: 'スクロールする前に1つ選ぼう',
    didInstead: '代わりにこれをやる',
    openAnyway: 'それでも開く',
    pauseTrail: '自分の傾向',
    didInsteadToday: '立ち止まった',
    openedAnywayToday: '開いた',
    lastSevenDays: '直近7日間',
    thisMonth: '今月',
    thisYear: '今年',
    week: '7日',
    month: '月',
    year: '年',
    reasonRanking: '理由ランキング',
    actionRanking: '代替行動ランキング',
    didInsteadRate: '代わりにできた率',
    noData: 'まだ記録がありません',
    times: '回',
    pauseAnother: 'もう一度止まる',
    langLabel: '言語',
    settingsTitle: 'カスタマイズ',
    countdownSeconds: '待つ秒数',
    reasonsTitle: '理由',
    actionsTitle: '代替行動',
    customReasonPlaceholder: '理由を入力',
    customActionPlaceholder: '行動を入力',
    useThis: 'これにする',
    save: '保存',
    cancel: 'キャンセル',
    edit: '編集',
    fixed: '固定',
    back: '戻る',
    emptyList: '最低1つは残してください。',
    pauseMessages: [
      '反射じゃなくて、選ぼう',
      '本当に今やる？',
      '未来の自分にプラス？',
      '一度止まるだけで変わる',
    ],
    reasonLabels: {
      bored: '暇だから',
      tired: '疲れている',
      wantApproval: '誰かに反応してほしい',
      comparingMyself: '誰かが気になる',
      checkingNotifications: '通知が気になる',
      wantStimulation: '刺激が欲しい',
      lonely: 'なんとなく寂しい',
      justHabit: 'ただの癖',
      other: 'その他',
    },
    actionLabels: {
      deepBreaths: '深呼吸を3回する',
      drinkWater: '水を飲む',
      squats: 'スクワットを10回',
      kindle: 'Kindleを1ページ読む',
      vocabulary: '単語を5問やる',
      memo: 'メモを1行書く',
      lieDown: '3分だけ横になる',
      other: 'その他',
    },
  },
} satisfies Record<
  Language,
  {
    languageName: string;
    status: string;
    tagline: string;
    question: string;
    records: string;
    settings: string;
    pause: string;
    pausesWonToday: string;
    reason: string;
    waiting: string;
    chooseNextAction: string;
    beforeScrolling: string;
    chooseOne: string;
    didInstead: string;
    openAnyway: string;
    pauseTrail: string;
    didInsteadToday: string;
    openedAnywayToday: string;
    lastSevenDays: string;
    thisMonth: string;
    thisYear: string;
    week: string;
    month: string;
    year: string;
    reasonRanking: string;
    actionRanking: string;
    didInsteadRate: string;
    noData: string;
    times: string;
    pauseAnother: string;
    langLabel: string;
    settingsTitle: string;
    countdownSeconds: string;
    reasonsTitle: string;
    actionsTitle: string;
    customReasonPlaceholder: string;
    customActionPlaceholder: string;
    useThis: string;
    save: string;
    cancel: string;
    edit: string;
    fixed: string;
    back: string;
    emptyList: string;
    pauseMessages: string[];
    reasonLabels: Record<DefaultReasonKey, string>;
    actionLabels: Record<DefaultActionKey, string>;
  }
>;

export type Copy = (typeof translations)[Language];

export function displayReason(reason: ReasonItem, copy: Copy) {
  if (!reason.defaultKey || hasCustomReasonLabel(reason)) return reason.label;
  return copy.reasonLabels[reason.defaultKey];
}

export function displayAction(action: ActionItem, copy: Copy) {
  if (!action.defaultKey || hasCustomActionLabel(action)) return action.label;
  return copy.actionLabels[action.defaultKey];
}

export function displayStoredReason(value: string, reasons: ReasonItem[], copy: Copy) {
  const key = readStoredKey(value);
  const reason = key ? reasons.find((item) => item.defaultKey === key) : null;
  if (reason) return displayReason(reason, copy);
  return readStoredLabel(value);
}

export function displayStoredAction(value: string, actions: ActionItem[], copy: Copy) {
  const key = readStoredKey(value);
  const action = key ? actions.find((item) => item.defaultKey === key) : null;
  if (action) return displayAction(action, copy);
  return readStoredLabel(value);
}

function readStoredKey(value: string) {
  return value.startsWith('key:') ? value.slice(4) : '';
}

function readStoredLabel(value: string) {
  return value.startsWith('label:') ? value.slice(6) : value;
}

function hasCustomReasonLabel(reason: ReasonItem) {
  return Boolean(
    reason.defaultKey &&
      reason.defaultKey !== 'other' &&
      reason.label !== translations.en.reasonLabels[reason.defaultKey] &&
      reason.label !== translations.ja.reasonLabels[reason.defaultKey],
  );
}

function hasCustomActionLabel(action: ActionItem) {
  return Boolean(
    action.defaultKey &&
      action.defaultKey !== 'other' &&
      action.label !== translations.en.actionLabels[action.defaultKey] &&
      action.label !== translations.ja.actionLabels[action.defaultKey],
  );
}
