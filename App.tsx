import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type TabKey = 'dashboard' | 'habits' | 'journal' | 'focus';

type Habit = {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  streak: number;
  done: boolean;
  target: string;
};

type JournalEntry = {
  id: string;
  date: string;
  mood: string;
  text: string;
  highlight: string;
};

type Reminder = {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
};

type FocusBlock = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date());

const categoryPalette: Record<string, string> = {
  Health: '#4FC7A6',
  Focus: '#6688FF',
  Growth: '#F7AE5F',
  Mindset: '#FC7BA7',
  Wellness: '#62B9FF',
  Habit: '#8A7AFB',
};

const inspirations = [
  'Consistency compounds faster than motivation ever will.',
  'You are not behind. You are building a better system.',
  'Every small win is a vote for the life you want.',
  'The most powerful thing you can do today is reward your effort.',
  'A calmer mind creates a stronger life.',
  'Focus on the next right move, not the whole mountain.',
];

const challengeList = [
  'Drink water before screens',
  'Complete one deep-work block',
  'Take a 10-minute walk',
  'Write one honest reflection',
  'Do one thing that creates momentum',
];

const initialHabits: Habit[] = [
  { id: '1', name: 'Morning walk', icon: '🏃', category: 'Health', color: '#55D3A5', streak: 14, done: true, target: '30 min' },
  { id: '2', name: 'Deep work', icon: '🧠', category: 'Focus', color: '#6D8DFF', streak: 9, done: false, target: '2 sessions' },
  { id: '3', name: 'Hydration', icon: '💧', category: 'Wellness', color: '#5BBCFF', streak: 21, done: true, target: '2L' },
  { id: '4', name: 'Read 20 pages', icon: '📚', category: 'Growth', color: '#F7B865', streak: 7, done: false, target: '20 pages' },
  { id: '5', name: 'Gratitude', icon: '🌞', category: 'Mindset', color: '#FF8FB2', streak: 12, done: true, target: '3 notes' },
];

const initialJournal: JournalEntry[] = [
  {
    id: 'j1',
    date: '2026-10-23',
    mood: '😊',
    highlight: 'Strong focus block',
    text: 'I stayed on task for longer than usual and felt calmer after the afternoon session.',
  },
  {
    id: 'j2',
    date: '2026-10-20',
    mood: '😌',
    highlight: 'Rested well',
    text: 'A proper night of sleep helped me feel more patient and clear-headed today.',
  },
  {
    id: 'j3',
    date: '2026-10-18',
    mood: '😄',
    highlight: 'Momentum shift',
    text: 'I tackled the hard task before noon and felt better for the rest of the day.',
  },
];

const initialReminders: Reminder[] = [
  { id: 'r1', label: 'Morning reset', time: '07:30', enabled: true },
  { id: 'r2', label: 'Workout check-in', time: '18:15', enabled: true },
  { id: 'r3', label: 'Night reflection', time: '21:45', enabled: false },
];

const defaultFocusBlocks: FocusBlock[] = [
  { id: 'f1', title: 'Deep project work', minutes: 45, done: true },
  { id: 'f2', title: 'Inbox cleanup', minutes: 20, done: false },
  { id: 'f3', title: 'Recovery time', minutes: 15, done: false },
];

const STORAGE_KEYS = {
  habits: 'caletivity.habits',
  journal: 'caletivity.journal',
  reminders: 'caletivity.reminders',
  focusBlocks: 'caletivity.focusBlocks',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournal);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>(defaultFocusBlocks);
  const [mood, setMood] = useState('😊');
  const [journalText, setJournalText] = useState('');
  const [highlight, setHighlight] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [habitTarget, setHabitTarget] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedHabits, savedJournal, savedReminders, savedFocus] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.habits),
          AsyncStorage.getItem(STORAGE_KEYS.journal),
          AsyncStorage.getItem(STORAGE_KEYS.reminders),
          AsyncStorage.getItem(STORAGE_KEYS.focusBlocks),
        ]);

        if (savedHabits) setHabits(JSON.parse(savedHabits));
        if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
        if (savedReminders) setReminders(JSON.parse(savedReminders));
        if (savedFocus) setFocusBlocks(JSON.parse(savedFocus));
      } catch (error) {
        console.log('Storage load failed', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.focusBlocks, JSON.stringify(focusBlocks));
  }, [focusBlocks]);

  const quote = useMemo(() => {
    const index = Math.floor((new Date().getDate() * 3) % inspirations.length);
    return inspirations[index];
  }, []);

  const completedCount = habits.filter((habit) => habit.done).length;
  const completionRate = Math.round((completedCount / habits.length) * 100);
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const bestHabit = habits.reduce((best, current) => (current.streak > best.streak ? current : best), habits[0]);
  const totalFocusMinutes = focusBlocks.reduce((sum, block) => sum + block.minutes, 0);
  const dailyChallenge = challengeList[new Date().getDate() % challengeList.length];

  const toggleHabit = (habitId: string) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              done: !habit.done,
              streak: !habit.done ? habit.streak + 1 : Math.max(1, habit.streak - 1),
            }
          : habit,
      ),
    );
  };

  const addHabit = () => {
    const trimmedName = habitName.trim();
    if (!trimmedName) return;

    const newHabit: Habit = {
      id: String(Date.now()),
      name: trimmedName,
      icon: '✨',
      category: habitCategory,
      color: categoryPalette[habitCategory] || '#7EA5FF',
      streak: 1,
      done: false,
      target: habitTarget.trim() || 'Daily',
    };

    setHabits((current) => [newHabit, ...current]);
    setHabitName('');
    setHabitTarget('');
    setHabitCategory('Health');
  };

  const addJournalEntry = () => {
    if (!journalText.trim() && !highlight.trim()) return;

    const newEntry: JournalEntry = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      mood,
      highlight: highlight.trim() || 'Daily reflection',
      text: journalText.trim() || 'I showed up for myself today.',
    };

    setJournalEntries((current) => [newEntry, ...current]);
    setJournalText('');
    setHighlight('');
    setMood('😊');
  };

  const toggleReminder = (reminderId: string) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, enabled: !reminder.enabled } : reminder,
      ),
    );
  };

  const toggleFocusBlock = (blockId: string) => {
    setFocusBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? { ...block, done: !block.done } : block,
      ),
    );
  };

  const renderDashboard = () => (
    <View style={styles.sectionStack}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Personal progress</Text>
        <Text style={styles.heroTitle}>Build a life that feels aligned.</Text>
        <View style={styles.heroRow}>
          <View style={styles.progressRingWrap}>
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{completionRate}%</Text>
            </View>
          </View>
          <View style={styles.heroMeta}>
            <Text style={styles.miniLabel}>Today</Text>
            <Text style={styles.heroValue}>{completedCount}/{habits.length} habits complete</Text>
            <Text style={styles.subtleText}>{dailyChallenge}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>“{quote}”</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly momentum</Text>
        <View style={styles.chartRow}>
          {[60, 72, 88, 45, 76, 90, 82].map((value, index) => (
            <View key={`${value}-${index}`} style={styles.chartColumnWrap}>
              <View style={[styles.chartColumn, { height: value }]} />
              <Text style={styles.chartDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key stats</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Streak total</Text>
            <Text style={styles.metricValue}>{totalStreaks}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Best habit</Text>
            <Text style={styles.metricValue}>{bestHabit.icon}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Focus</Text>
            <Text style={styles.metricValue}>{totalFocusMinutes}m</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Mood</Text>
            <Text style={styles.metricValue}>😊</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Today’s wins</Text>
          <Text style={styles.linkText}>View all</Text>
        </View>
        {habits.slice(0, 3).map((habit) => (
          <View key={habit.id} style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Text style={styles.listIcon}>{habit.icon}</Text>
              <View>
                <Text style={styles.listTitle}>{habit.name}</Text>
                <Text style={styles.listSub}>{habit.target}</Text>
              </View>
            </View>
            <View style={[styles.statusDot, habit.done ? styles.statusDotActive : styles.statusDotIdle]} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderHabits = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add a habit</Text>
        <TextInput
          value={habitName}
          onChangeText={setHabitName}
          placeholder="Habit name"
          style={styles.input}
        />
        <TextInput
          value={habitTarget}
          onChangeText={setHabitTarget}
          placeholder="Target, e.g. 30 min or 2L"
          style={styles.input}
        />
        <View style={styles.categoryRow}>
          {['Health', 'Focus', 'Growth', 'Mindset', 'Wellness'].map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setHabitCategory(category)}
              style={[styles.categoryPill, habitCategory === category && styles.categoryPillActive]}
            >
              <Text style={[styles.categoryPillText, habitCategory === category && styles.categoryPillTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={addHabit}>
          <Text style={styles.primaryButtonText}>Add habit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your habits</Text>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => toggleHabit(habit.id)}
            style={[
              styles.habitRow,
              { borderColor: habit.done ? '#5ED0A8' : '#E8ECF6' },
              habit.done && styles.habitRowDone,
            ]}
          >
            <View style={styles.listRowLeft}>
              <View style={[styles.habitIconWrap, { backgroundColor: habit.color }]}>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
              </View>
              <View>
                <Text style={styles.listTitle}>{habit.name}</Text>
                <Text style={styles.listSub}>{habit.category} • {habit.target}</Text>
              </View>
            </View>
            <View style={styles.habitMeta}>
              <Text style={styles.streakValue}>{habit.streak}d</Text>
              <View style={[styles.checkBox, habit.done && styles.checkBoxActive]}>
                {habit.done ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderJournal = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood check-in</Text>
        <View style={styles.moodRow}>
          {['😄', '😊', '😌', '😐', '😕', '😴'].map((face) => (
            <TouchableOpacity
              key={face}
              onPress={() => setMood(face)}
              style={[styles.moodButton, mood === face && styles.moodButtonActive]}
            >
              <Text style={styles.moodText}>{face}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          placeholder="Quick highlight"
          value={highlight}
          onChangeText={setHighlight}
          style={styles.input}
        />
        <TextInput
          placeholder="How are you feeling today?"
          value={journalText}
          onChangeText={setJournalText}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={addJournalEntry}>
          <Text style={styles.primaryButtonText}>Save reflection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent reflections</Text>
        {journalEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryMood}>{entry.mood}</Text>
              <Text style={styles.entryDate}>{entry.date}</Text>
            </View>
            <Text style={styles.entryHighlight}>{entry.highlight}</Text>
            <Text style={styles.entryText}>{entry.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFocus = () => (
    <View style={styles.sectionStack}>
      <View style={styles.focusCard}>
        <Text style={styles.cardTitle}>Current focus plan</Text>
        <Text style={styles.focusMinutes}>{totalFocusMinutes} mins</Text>
        <Text style={styles.subtleText}>A healthy system is built on deliberate attention.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Priority blocks</Text>
        {focusBlocks.map((block) => (
          <TouchableOpacity
            key={block.id}
            onPress={() => toggleFocusBlock(block.id)}
            style={[styles.priorityRow, block.done && styles.priorityRowDone]}
          >
            <View>
              <Text style={styles.priorityTitle}>{block.title}</Text>
              <Text style={styles.priorityMeta}>{block.minutes} minutes</Text>
            </View>
            <View style={[styles.checkBox, block.done && styles.checkBoxActive]}>
              {block.done ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reminders</Text>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderRow}>
            <View>
              <Text style={styles.reminderLabel}>{reminder.label}</Text>
              <Text style={styles.reminderTime}>{reminder.time}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleReminder(reminder.id)}
              style={[styles.reminderToggle, reminder.enabled && styles.reminderToggleActive]}
            >
              <View style={[styles.reminderSwitchKnob, reminder.enabled && styles.reminderSwitchKnobActive]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Caletivity</Text>
            <Text style={styles.dateText}>{todayLabel}</Text>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileText}>C</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'habits', label: 'Habits' },
            { key: 'journal', label: 'Journal' },
            { key: 'focus', label: 'Focus' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key as TabKey)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'habits' && renderHabits()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'focus' && renderFocus()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  container: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 18,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#17233F',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 13,
    color: '#6D7A90',
    marginTop: 2,
  },
  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DBE6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3054B5',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EAF0FF',
    borderRadius: 18,
    padding: 6,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#9EB6EC',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#697D9A',
  },
  tabTextActive: {
    color: '#142749',
  },
  sectionStack: {
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE8FF',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4C6ADA',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#15233F',
    lineHeight: 34,
    marginTop: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  progressRingWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D9E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F9FF',
    borderWidth: 8,
    borderColor: '#7CA3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#13254B',
  },
  heroMeta: {
    flex: 1,
    marginLeft: 18,
  },
  miniLabel: {
    fontSize: 11,
    color: '#7383A2',
    textTransform: 'uppercase',
  },
  heroValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#152841',
    marginTop: 4,
  },
  subtleText: {
    fontSize: 12,
    color: '#5D6A87',
    marginTop: 6,
    lineHeight: 18,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDEFF7',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#212D41',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF1F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172644',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    height: 90,
  },
  chartColumnWrap: {
    alignItems: 'center',
    flex: 1,
  },
  chartColumn: {
    width: 14,
    borderRadius: 10,
    backgroundColor: '#7AA3FF',
    marginBottom: 8,
  },
  chartDay: {
    fontSize: 11,
    color: '#7E8EA8',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  metricBox: {
    width: '47%',
    backgroundColor: '#F4F8FF',
    borderRadius: 18,
    padding: 14,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7787A3',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15284B',
    marginTop: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 12,
    color: '#5B74C5',
    fontWeight: '700',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  listTitle: {
    fontSize: 15,
    color: '#1A2747',
    fontWeight: '700',
  },
  listSub: {
    fontSize: 12,
    color: '#7A889D',
    marginTop: 2,
  },
  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 50,
  },
  statusDotActive: {
    backgroundColor: '#59D3A0',
  },
  statusDotIdle: {
    backgroundColor: '#D8E1F4',
  },
  input: {
    backgroundColor: '#F7F9FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E3EAFD',
    marginTop: 12,
    color: '#172747',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: '#E5ECFF',
  },
  categoryPillActive: {
    backgroundColor: '#E1EBFF',
    borderColor: '#B9CCFF',
  },
  categoryPillText: {
    fontSize: 11,
    color: '#667B99',
    fontWeight: '700',
  },
  categoryPillTextActive: {
    color: '#17315B',
  },
  primaryButton: {
    backgroundColor: '#182A47',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: '#FAFBFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  habitRowDone: {
    backgroundColor: '#F2FFF8',
  },
  habitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitIcon: {
    fontSize: 20,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5970A6',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E7EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#54D29E',
  },
  checkMark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodButtonActive: {
    backgroundColor: '#D9E7FF',
    borderWidth: 1,
    borderColor: '#B3CCFF',
  },
  moodText: {
    fontSize: 24,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  entryCard: {
    backgroundColor: '#F9FAFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6EBF7',
    marginTop: 12,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMood: {
    fontSize: 22,
  },
  entryDate: {
    fontSize: 11,
    color: '#7A8AA2',
  },
  entryHighlight: {
    fontSize: 15,
    color: '#162744',
    fontWeight: '700',
    marginTop: 10,
  },
  entryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5F6F88',
    marginTop: 6,
  },
  focusCard: {
    backgroundColor: '#EEF3FF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCE8FF',
  },
  focusMinutes: {
    fontSize: 34,
    fontWeight: '800',
    color: '#162745',
    marginTop: 12,
    letterSpacing: -1,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  priorityRowDone: {
    opacity: 0.7,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2944',
  },
  priorityMeta: {
    fontSize: 12,
    color: '#7787A2',
    marginTop: 3,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  reminderLabel: {
    fontSize: 14,
    color: '#1B2744',
    fontWeight: '700',
  },
  reminderTime: {
    fontSize: 12,
    color: '#7584A0',
    marginTop: 3,
  },
  reminderToggle: {
    width: 48,
    height: 28,
    borderRadius: 15,
    backgroundColor: '#DCE2F2',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  reminderToggleActive: {
    backgroundColor: '#4BC892',
  },
  reminderSwitchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  reminderSwitchKnobActive: {
    alignSelf: 'flex-end',
  },
});
