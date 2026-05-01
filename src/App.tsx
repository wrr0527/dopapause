import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { displayAction, displayReason, displayStoredAction, displayStoredReason, translations, type Copy } from './i18n';
import {
  getDidInsteadRate,
  getPeriodLogs,
  getPeriodTrend,
  getRankings,
  getTodaySummary,
  loadActions,
  loadCountdownSeconds,
  loadLanguage,
  loadLogs,
  loadReasons,
  normalizeCountdownSeconds,
  saveActions,
  saveCountdownSeconds,
  saveLanguage,
  saveLogs,
  saveReasons,
} from './storage';
import type { ActionItem, Language, Outcome, PauseItem, PauseLog, RankingItem, ReasonItem, StatsPeriod, TrendSummary } from './types';

type Screen = 'home' | 'customReason' | 'countdown' | 'actions' | 'stats' | 'settings';
const MAX_INPUT_LENGTH = 56;

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [reasons, setReasons] = useState<ReasonItem[]>(() => loadReasons());
  const [actions, setActions] = useState<ActionItem[]>(() => loadActions());
  const [selectedReason, setSelectedReason] = useState<ReasonItem | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [customReasonDraft, setCustomReasonDraft] = useState('');
  const [customActionDraft, setCustomActionDraft] = useState('');
  const [isCustomActionOpen, setIsCustomActionOpen] = useState(false);
  const [logs, setLogs] = useState<PauseLog[]>(() => loadLogs());
  const [countdownSeconds, setCountdownSeconds] = useState(() => loadCountdownSeconds());
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [messageIndex, setMessageIndex] = useState(0);
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('week');

  const copy = translations[language];
  const today = useMemo(() => getTodaySummary(logs), [logs]);
  const periodLogs = useMemo(() => getPeriodLogs(logs, statsPeriod), [logs, statsPeriod]);
  const trend = useMemo(() => getPeriodTrend(logs, statsPeriod), [logs, statsPeriod]);
  const periodSummary = useMemo(
    () => ({
      didInstead: periodLogs.filter((log) => log.outcome === 'didInstead').length,
      openedAnyway: periodLogs.filter((log) => log.outcome === 'openedAnyway').length,
    }),
    [periodLogs],
  );
  const reasonRanking = useMemo(
    () =>
      getRankings(periodLogs, 'selectedReason').map((item) => ({
        ...item,
        label: displayStoredReason(item.label, reasons, copy),
      })),
    [copy, periodLogs, reasons],
  );
  const actionRanking = useMemo(
    () =>
      getRankings(periodLogs, 'selectedAction').map((item) => ({
        ...item,
        label: displayStoredAction(item.label, actions, copy),
      })),
    [actions, copy, periodLogs],
  );
  const didInsteadRate = useMemo(() => getDidInsteadRate(periodLogs), [periodLogs]);

  useEffect(() => saveLanguage(language), [language]);
  useEffect(() => saveReasons(reasons), [reasons]);
  useEffect(() => saveActions(actions), [actions]);
  useEffect(() => saveLogs(logs), [logs]);
  useEffect(() => saveCountdownSeconds(countdownSeconds), [countdownSeconds]);

  useEffect(() => {
    if (screen !== 'countdown' || secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [screen, secondsLeft]);

  function startPause(reason: ReasonItem) {
    if (isOtherItem(reason)) {
      setCustomReasonDraft('');
      setSelectedReason(null);
      setSelectedAction(null);
      setScreen('customReason');
      return;
    }

    setSelectedReason(reason);
    setSelectedAction(null);
    setIsCustomActionOpen(false);
    setCustomActionDraft('');
    setSecondsLeft(countdownSeconds);
    setMessageIndex(Math.floor(Math.random() * copy.pauseMessages.length));
    setScreen('countdown');
  }

  function startCustomPause() {
    const label = customReasonDraft.trim().slice(0, MAX_INPUT_LENGTH);
    if (!label) return;
    startPause({ id: 'custom-reason-current', label });
  }

  function selectAction(action: ActionItem) {
    if (isOtherItem(action)) {
      setSelectedAction(null);
      setCustomActionDraft('');
      setIsCustomActionOpen(true);
      return;
    }

    setSelectedAction(action);
    setCustomActionDraft('');
    setIsCustomActionOpen(false);
  }

  function useCustomAction() {
    const label = customActionDraft.trim().slice(0, MAX_INPUT_LENGTH);
    if (!label) return;
    setSelectedAction({ id: 'custom-action-current', label });
    setIsCustomActionOpen(false);
  }

  function finish(outcome: Outcome) {
    if (!selectedReason) return;

    const log: PauseLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      version: 3,
      selectedReason: getStoredValue(selectedReason),
      selectedAction: selectedAction ? getStoredValue(selectedAction) : '',
      outcome,
    };

    setLogs((current) => [log, ...current]);
    setSelectedReason(null);
    setSelectedAction(null);
    setScreen('stats');
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="top-bar">
          <div className="status-pill">
            <span className="pulse-dot" />
            DopaPause
          </div>
          <LanguageToggle language={language} copy={copy} onChange={setLanguage} />
        </div>

        {(screen === 'home' || screen === 'stats' || screen === 'settings') && (
          <MainNav
            copy={copy}
            screen={screen}
            onHome={() => setScreen('home')}
            onSettings={() => setScreen('settings')}
            onStats={() => setScreen('stats')}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            actionsDisabled={reasons.length === 0}
            copy={copy}
            reasons={reasons}
            todayDidInstead={today.didInstead}
            onReasonSelect={startPause}
          />
        )}

        {screen === 'customReason' && (
          <CustomReasonScreen
            copy={copy}
            value={customReasonDraft}
            onBack={() => setScreen('home')}
            onChange={setCustomReasonDraft}
            onSubmit={startCustomPause}
          />
        )}

        {screen === 'countdown' && (
          <CountdownScreen
            copy={copy}
            totalSeconds={countdownSeconds}
            secondsLeft={secondsLeft}
            message={copy.pauseMessages[messageIndex]}
            reason={selectedReason}
            onContinue={() => setScreen('actions')}
          />
        )}

        {screen === 'actions' && (
          <ActionScreen
            actions={actions}
            customActionDraft={customActionDraft}
            isCustomActionOpen={isCustomActionOpen}
            copy={copy}
            selectedAction={selectedAction}
            onCustomActionChange={setCustomActionDraft}
            onDidInstead={() => finish('didInstead')}
            onOpenedAnyway={() => finish('openedAnyway')}
            onSelectAction={selectAction}
            onUseCustomAction={useCustomAction}
          />
        )}

        {screen === 'stats' && (
          <StatsScreen
            actionRanking={actionRanking}
            copy={copy}
            didInsteadRate={didInsteadRate}
            period={statsPeriod}
            reasonRanking={reasonRanking}
            trend={trend}
            periodDidInstead={periodSummary.didInstead}
            periodOpenedAnyway={periodSummary.openedAnyway}
            onPeriodChange={setStatsPeriod}
            onOpenSettings={() => setScreen('settings')}
            onStartAgain={() => setScreen('home')}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            actions={actions}
            countdownSeconds={countdownSeconds}
            copy={copy}
            reasons={reasons}
            onActionsChange={setActions}
            onCountdownSecondsChange={(seconds) => setCountdownSeconds(normalizeCountdownSeconds(seconds))}
            onReasonsChange={setReasons}
          />
        )}
      </section>
    </main>
  );
}

interface LanguageToggleProps {
  language: Language;
  copy: Copy;
  onChange: (language: Language) => void;
}

function LanguageToggle({ language, copy, onChange }: LanguageToggleProps) {
  return (
    <div className="language-toggle" aria-label={copy.langLabel}>
      <button className={language === 'ja' ? 'active' : ''} type="button" onClick={() => onChange('ja')}>
        {translations.ja.languageName}
      </button>
      <button className={language === 'en' ? 'active' : ''} type="button" onClick={() => onChange('en')}>
        {translations.en.languageName}
      </button>
    </div>
  );
}

interface MainNavProps {
  copy: Copy;
  screen: Screen;
  onHome: () => void;
  onSettings: () => void;
  onStats: () => void;
}

function MainNav({ copy, screen, onHome, onSettings, onStats }: MainNavProps) {
  return (
    <nav className="main-nav" aria-label="Primary">
      <button className={screen === 'home' ? 'active' : ''} type="button" onClick={onHome}>
        {copy.pause}
      </button>
      <button className={screen === 'stats' ? 'active' : ''} type="button" onClick={onStats}>
        {copy.records}
      </button>
      <button className={screen === 'settings' ? 'active' : ''} type="button" onClick={onSettings}>
        {copy.settings}
      </button>
    </nav>
  );
}

interface HomeScreenProps {
  actionsDisabled: boolean;
  copy: Copy;
  reasons: ReasonItem[];
  todayDidInstead: number;
  onReasonSelect: (reason: ReasonItem) => void;
}

function HomeScreen({
  actionsDisabled,
  copy,
  reasons,
  todayDidInstead,
  onReasonSelect,
}: HomeScreenProps) {
  return (
    <div className="screen">
      <header className="hero">
        <h1>{copy.tagline}</h1>
      </header>

      <section className="card">
        <div className="section-heading">
          <h2>{copy.question}</h2>
        </div>

        {actionsDisabled ? (
          <p className="empty-note">{copy.emptyList}</p>
        ) : (
          <div className="button-grid">
            {reasons.map((reason) => (
              <button className="choice-button" key={reason.id} type="button" onClick={() => onReasonSelect(reason)}>
                {displayReason(reason, copy)}
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="mini-stat">
        <span>{todayDidInstead}</span>
        <p>{copy.pausesWonToday}</p>
      </footer>
    </div>
  );
}

interface CountdownScreenProps {
  copy: Copy;
  totalSeconds: number;
  secondsLeft: number;
  message: string;
  reason: ReasonItem | null;
  onContinue: () => void;
}

interface CustomReasonScreenProps {
  copy: Copy;
  value: string;
  onBack: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function CustomReasonScreen({ copy, value, onBack, onChange, onSubmit }: CustomReasonScreenProps) {
  return (
    <div className="screen">
      <header className="compact-header">
        <p className="eyebrow">{copy.reason}</p>
        <h1>{copy.reasonLabels.other}</h1>
      </header>

      <section className="card custom-card">
        <input
          aria-label={copy.customReasonPlaceholder}
          autoFocus
          maxLength={MAX_INPUT_LENGTH}
          placeholder={copy.customReasonPlaceholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSubmit();
            if (event.key === 'Escape') onBack();
          }}
        />
      </section>

      <div className="bottom-actions">
        <button className="primary-button" type="button" disabled={!value.trim()} onClick={onSubmit}>
          {copy.useThis}
        </button>
        <button className="secondary-button" type="button" onClick={onBack}>
          {copy.back}
        </button>
      </div>
    </div>
  );
}

function CountdownScreen({ copy, totalSeconds, secondsLeft, message, reason, onContinue }: CountdownScreenProps) {
  const progress = 100 - (secondsLeft / totalSeconds) * 100;

  return (
    <div className="screen countdown-screen">
      <header className="compact-header">
        <p className="eyebrow">{copy.reason}</p>
        <h1>{reason ? displayReason(reason, copy) : ''}</h1>
      </header>

      <section className="countdown-card">
        <div className="count-ring" style={{ '--progress': `${progress}%` } as CSSProperties}>
          <span>{secondsLeft}</span>
        </div>
        <h2>{message}</h2>
      </section>

      <button className="primary-button" type="button" disabled={secondsLeft > 0} onClick={onContinue}>
        {secondsLeft > 0 ? copy.waiting : copy.chooseNextAction}
      </button>
    </div>
  );
}

interface ActionScreenProps {
  actions: ActionItem[];
  customActionDraft: string;
  isCustomActionOpen: boolean;
  copy: Copy;
  selectedAction: ActionItem | null;
  onCustomActionChange: (value: string) => void;
  onSelectAction: (action: ActionItem) => void;
  onDidInstead: () => void;
  onOpenedAnyway: () => void;
  onUseCustomAction: () => void;
}

function ActionScreen({
  actions,
  customActionDraft,
  isCustomActionOpen,
  copy,
  selectedAction,
  onCustomActionChange,
  onSelectAction,
  onDidInstead,
  onOpenedAnyway,
  onUseCustomAction,
}: ActionScreenProps) {
  return (
    <div className="screen">
      <header className="compact-header">
        <p className="eyebrow">{copy.beforeScrolling}</p>
        <h1>{copy.chooseOne}</h1>
      </header>

      <section className="card">
        <div className="button-stack">
          {actions.map((action) => (
            <button
              className={`choice-button ${selectedAction?.id === action.id ? 'selected' : ''}`}
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action)}
            >
              {displayAction(action, copy)}
            </button>
          ))}
        </div>

        {isCustomActionOpen && (
          <div className="custom-inline">
            <input
              aria-label={copy.customActionPlaceholder}
              autoFocus
              placeholder={copy.customActionPlaceholder}
              maxLength={MAX_INPUT_LENGTH}
              value={customActionDraft}
              onChange={(event) => onCustomActionChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onUseCustomAction();
              }}
            />
            <button className="small-button" type="button" disabled={!customActionDraft.trim()} onClick={onUseCustomAction}>
              {copy.useThis}
            </button>
          </div>
        )}
      </section>

      <div className="bottom-actions">
        <button className="primary-button" type="button" disabled={isCustomActionOpen && !selectedAction} onClick={onDidInstead}>
          {copy.didInstead}
        </button>
        <button className="secondary-button" type="button" onClick={onOpenedAnyway}>
          {copy.openAnyway}
        </button>
      </div>
    </div>
  );
}

interface StatsScreenProps {
  actionRanking: RankingItem[];
  copy: Copy;
  didInsteadRate: number;
  period: StatsPeriod;
  reasonRanking: RankingItem[];
  trend: TrendSummary[];
  periodDidInstead: number;
  periodOpenedAnyway: number;
  onPeriodChange: (period: StatsPeriod) => void;
  onOpenSettings: () => void;
  onStartAgain: () => void;
}

function StatsScreen({
  actionRanking,
  copy,
  didInsteadRate,
  period,
  reasonRanking,
  trend,
  periodDidInstead,
  periodOpenedAnyway,
  onPeriodChange,
  onOpenSettings,
  onStartAgain,
}: StatsScreenProps) {
  const maxTrendValue = Math.max(1, ...trend.map((item) => item.didInstead + item.openedAnyway));
  const trendTitle = period === 'week' ? copy.lastSevenDays : period === 'month' ? copy.thisMonth : copy.thisYear;

  return (
    <div className="screen records-screen">
      <header className="compact-header row-header">
        <div>
          <h1>{copy.pauseTrail}</h1>
        </div>
      </header>

      <div className="period-toggle" aria-label={copy.records}>
        <button className={period === 'week' ? 'active' : ''} type="button" onClick={() => onPeriodChange('week')}>
          {copy.week}
        </button>
        <button className={period === 'month' ? 'active' : ''} type="button" onClick={() => onPeriodChange('month')}>
          {copy.month}
        </button>
        <button className={period === 'year' ? 'active' : ''} type="button" onClick={() => onPeriodChange('year')}>
          {copy.year}
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>{periodDidInstead}</span>
          <p>{copy.didInsteadToday}</p>
        </div>
        <div className="stat-card">
          <span>{periodOpenedAnyway}</span>
          <p>{copy.openedAnywayToday}</p>
        </div>
      </section>

      <section className="rate-card">
        <div>
          <p>{copy.didInsteadRate}</p>
          <strong>{didInsteadRate}%</strong>
        </div>
        <div className="rate-track">
          <span style={{ width: `${didInsteadRate}%` }} />
        </div>
      </section>

      <section className="card">
        <h2>{trendTitle}</h2>
        <div className="history-list">
          {trend.map((item) => {
            const total = item.didInstead + item.openedAnyway;
            return (
              <div className="history-row" key={item.label}>
                <span>{item.label}</span>
                <div
                  className="bar-track"
                  aria-label={`${item.label}: ${item.didInstead} didInstead, ${item.openedAnyway} openedAnyway`}
                >
                  <div className="bar paused" style={{ width: `${(item.didInstead / maxTrendValue) * 100}%` }} />
                  <div className="bar opened" style={{ width: `${(item.openedAnyway / maxTrendValue) * 100}%` }} />
                </div>
                <strong>{total}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <RankingCard title={copy.reasonRanking} items={reasonRanking} copy={copy} />
      <RankingCard title={copy.actionRanking} items={actionRanking} copy={copy} />

      <button className="primary-button" type="button" onClick={onStartAgain}>
        {copy.pauseAnother}
      </button>
    </div>
  );
}

interface RankingCardProps {
  title: string;
  items: RankingItem[];
  copy: Copy;
}

function RankingCard({ title, items, copy }: RankingCardProps) {
  const maxValue = Math.max(1, ...items.map((item) => item.count));

  return (
    <section className="card">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="empty-note">{copy.noData}</p>
      ) : (
        <div className="reason-list">
          {items.map((item) => (
            <div className="reason-row" key={item.label}>
              <div>
                <span>{item.label}</span>
                <small>
                  {item.count} {copy.times}
                </small>
              </div>
              <div className="reason-track">
                <div style={{ width: `${(item.count / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface SettingsScreenProps {
  actions: ActionItem[];
  countdownSeconds: number;
  copy: Copy;
  reasons: ReasonItem[];
  onActionsChange: (actions: ActionItem[]) => void;
  onCountdownSecondsChange: (seconds: number) => void;
  onReasonsChange: (reasons: ReasonItem[]) => void;
}

function SettingsScreen({
  actions,
  countdownSeconds,
  copy,
  reasons,
  onActionsChange,
  onCountdownSecondsChange,
  onReasonsChange,
}: SettingsScreenProps) {
  return (
    <div className="screen settings-screen">
      <header className="compact-header">
        <div>
          <h1>{copy.settingsTitle}</h1>
        </div>
      </header>

      <section className="card setting-card">
        <h2>{copy.countdownSeconds}</h2>
        <input
          aria-label={copy.countdownSeconds}
          inputMode="numeric"
          min={3}
          max={60}
          type="number"
          value={countdownSeconds}
          onChange={(event) => onCountdownSecondsChange(Number(event.target.value))}
        />
      </section>

      <EditableList
        copy={copy}
        getDisplayLabel={(item) => displayReason(item, copy)}
        items={reasons}
        title={copy.reasonsTitle}
        onChange={onReasonsChange}
      />
      <EditableList
        copy={copy}
        getDisplayLabel={(item) => displayAction(item, copy)}
        items={actions}
        title={copy.actionsTitle}
        onChange={onActionsChange}
      />
    </div>
  );
}

interface EditableListProps<T extends PauseItem> {
  copy: Copy;
  getDisplayLabel: (item: T) => string;
  items: T[];
  title: string;
  onChange: (items: T[]) => void;
}

function EditableList<T extends PauseItem>({ copy, getDisplayLabel, items, title, onChange }: EditableListProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  function startEdit(item: T, displayLabel: string) {
    setEditingId(item.id);
    setEditingValue(displayLabel);
  }

  function saveEdit(id: string) {
    const label = editingValue.trim().slice(0, MAX_INPUT_LENGTH);
    if (!label) return;
    onChange(items.map((item) => (item.id === id ? ({ ...item, label } as T) : item)));
    setEditingId(null);
    setEditingValue('');
  }

  return (
    <section className="card editable-card">
      <h2>{title}</h2>

      <div className="editable-list">
        {items.map((item) => {
          const displayLabel = getDisplayLabel(item);
          const isOther = isOtherItem(item);

          return (
            <div className={`editable-row ${isOther ? 'locked' : ''}`} key={item.id}>
              {editingId === item.id ? (
                <>
                  <input
                    aria-label={copy.edit}
                    maxLength={MAX_INPUT_LENGTH}
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveEdit(item.id);
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button className="small-button" type="button" onClick={() => saveEdit(item.id)}>
                    {copy.save}
                  </button>
                  <button className="text-button" type="button" onClick={() => setEditingId(null)}>
                    {copy.cancel}
                  </button>
                </>
              ) : (
                <>
                  <span>{displayLabel}</span>
                  {isOther ? (
                    <small>{copy.fixed}</small>
                  ) : (
                    <button className="text-button" type="button" onClick={() => startEdit(item, displayLabel)}>
                      {copy.edit}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function isOtherItem(item: PauseItem) {
  return item.defaultKey === 'other';
}

function getStoredValue(item: PauseItem) {
  return item.defaultKey && item.defaultKey !== 'other' ? `key:${item.defaultKey}` : `label:${item.label}`;
}

export default App;
