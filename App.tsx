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

type TabKey = 'overview' | 'habits' | 'journal' | 'focus';

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

const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date());

const quoteBank = [
  {
    text: 'Discipline is choosing between what you want most and what you want now.',
    author: 'Abraham Lincoln',
  },
  {
    text: 'Small steps every day create a life you can be proud of.',
    author: 'Caletivity',
  },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
];

const initialHabits: Habit[] = [
  { id: '1', name: 'Morning walk', icon: '🏃', category: 'Health', color: '#5ED0A8', streak: 12, done: true, target: '30 min' },
  { id: '2', name: 'Deep work', icon: '🧠', category: 'Focus', color: '#7C9CFF', streak: 7, done: false, target: '2 sessions' },
  { id: '3', name: 'Hydration', icon: '💧', category: 'Wellness', color: '#60B9FF', streak: 18, done: true, target: '2L' },
  { id: '4', name: 'Read 20 pages', icon: '📚', category: 'Growth', color: '#F7B267', streak: 9, done: false, target: '20 pages' },
  { id: '5', name: 'Gratitude', icon: '🌞', category: 'Mindset', color: '#FF8AAE', streak: 15, done: true, target: '3 notes' },
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
];

const initialReminders: Reminder[] = [
  { id: 'r1', label: 'Morning reset', time: '07:30', enabled: true },
  { id: 'r2', label: 'Workout check-in', time: '18:15', enabled: true },
  { id: 'r3', label: 'Night reflection', time: '21:45', enabled: false },
];

const STORAGE_KEYS = {
  habits: 'caletivity.habits',
  journal: 'caletivity.journal',
  reminders: 'caletivity.reminders',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournal);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [mood, setMood] = useState('😊');
  const [journalText, setJournalText] = useState('');
  const [highlight, setHighlight] = useState('');
  const [focusMinutes, setFocusMinutes] = useState(25);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHabits = await AsyncStorage.getItem(STORAGE_KEYS.habits);
        const savedJournal = await AsyncStorage.getItem(STORAGE_KEYS.journal);
        const savedReminders = await AsyncStorage.getItem(STORAGE_KEYS.reminders);

        if (savedHabits) setHabits(JSON.parse(savedHabits));
        if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
        if (savedReminders) setReminders(JSON.parse(savedReminders));
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

  const quote = useMemo(() => {
    return quoteBank[Math.floor((new Date().getDate() * 7) % quoteBank.length)];
  }, []);

  const completedCount = habits.filter((habit) => habit.done).length;
  const progress = Math.round((completedCount / habits.length) * 100);
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);

  const toggleHabit = (habitId: string) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === habitId
          ? { ...habit, done: !habit.done, streak: !habit.done ? habit.streak + 1 : Math.max(1, habit.streak - 1) }
          : habit,
      ),
    );
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

  const renderOverview = () => (
    <View style={styles.sectionStack}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Daily momentum</Text>
        <Text style={styles.heroTitle}>Build a life that feels good to live.</Text>
        <View style={styles.heroProgressRow}>
          <View style={styles.progressRing}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          <View style={styles.heroSummaryBlock}>
            <Text style={styles.summaryLabel}>Progress today</Text>
            <Text style={styles.summaryValue}>{completedCount}/{habits.length} habits complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>“{quote.text}”</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Focus summary</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Streak total</Text>
            <Text style={styles.metricValue}>{totalStreaks}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Mood</Text>
            <Text style={styles.metricValue}>😊</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Best habit</Text>
            <Text style={styles.metricValue}>💧</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Today’s wins</Text>
          <Text style={styles.linkText}>See all</Text>
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
            <View style={[styles.dot, { backgroundColor: habit.done ? '#5ED0A8' : '#D9E0F0' }]} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderHabits = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Habits</Text>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => toggleHabit(habit.id)}
            style={[
              styles.habitRow,
              { borderColor: habit.done ? '#5ED0A8' : '#E7ECF5' },
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
              <Text style={styles.streakNumber}>{habit.streak}d</Text>
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
          placeholder="Write a quick highlight..."
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
        {journalEntries.slice(0, 3).map((entry) => (
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
        <Text style={styles.cardTitle}>Focus session</Text>
        <Text style={styles.focusMinutes}>{focusMinutes} mins</Text>
        <View style={styles.focusControls}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setFocusMinutes((current) => Math.max(15, current - 5))}
          >
            <Text style={styles.secondaryButtonText}>-5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setFocusMinutes((current) => current + 5)}
          >
            <Text style={styles.primaryButtonText}>+5</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top priorities</Text>
        {['Finish proposal', 'Email mentor', 'Workout and recovery'].map((task, index) => (
          <View key={task} style={styles.priorityRow}>
            <View style={styles.priorityBullet} />
            <Text style={styles.priorityText}>{index + 1}. {task}</Text>
          </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFF" />
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
            { key: 'overview', label: 'Overview' },
            { key: 'habits', label: 'Habits' },
            { key: 'journal', label: 'Journal' },
            { key: 'focus', label: 'Focus' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabKey)}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && renderOverview()}
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
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 18,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A2340',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 13,
    color: '#697693',
    marginTop: 4,
  },
  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#D7E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D4D9A',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EAF0FF',
    padding: 6,
    borderRadius: 18,
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
    shadowColor: '#A2B4DA',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#687791',
  },
  tabTextActive: {
    color: '#11224A',
  },
  sectionStack: {
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCE8FF',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4967B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#182746',
    lineHeight: 34,
    marginTop: 8,
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  progressRing: {
    width: 86,
    height: 86,
    borderRadius: 100,
    backgroundColor: '#DCE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#7DA2FF',
  },
  progressText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1B2D4F',
  },
  heroSummaryBlock: {
    marginLeft: 18,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#627297',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2340',
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDEFF8',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#212C3E',
    fontWeight: '600',
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#6D7A92',
    marginTop: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF1F7',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142441',
  },
  linkText: {
    fontSize: 12,
    color: '#5C74C2',
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7383A0',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172747',
    marginTop: 8,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
    color: '#7B88A0',
    marginTop: 2,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 50,
    marginLeft: 12,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    backgroundColor: '#FAFBFF',
  },
  habitRowDone: {
    backgroundColor: '#F2FFF7',
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
  streakNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#556A9B',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E9EEF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#5ED0A8',
  },
  checkMark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
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
    backgroundColor: '#DCE7FF',
    borderWidth: 1,
    borderColor: '#B9CFFF',
  },
  moodText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: '#F6F8FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2EAFD',
    marginBottom: 12,
    color: '#1A2340',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#1A2340',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#E9F0FF',
    paddingVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1E2D4F',
    fontWeight: '700',
  },
  entryCard: {
    backgroundColor: '#F9FAFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7ECF7',
  },
  entryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryMood: {
    fontSize: 22,
  },
  entryDate: {
    fontSize: 11,
    color: '#7A89A1',
  },
  entryHighlight: {
    fontSize: 15,
    color: '#182746',
    fontWeight: '700',
    marginTop: 10,
  },
  entryText: {
    fontSize: 13,
    color: '#5D6A86',
    lineHeight: 20,
    marginTop: 6,
  },
  focusCard: {
    backgroundColor: '#EEF3FF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  focusMinutes: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A2340',
    marginTop: 10,
    letterSpacing: -1,
  },
  focusControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priorityBullet: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: '#6E8BFF',
    marginRight: 10,
  },
  priorityText: {
    fontSize: 14,
    color: '#1D2F4F',
    fontWeight: '600',
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
    color: '#1B2745',
    fontWeight: '700',
  },
  reminderTime: {
    fontSize: 12,
    color: '#7483A0',
    marginTop: 3,
  },
  reminderToggle: {
    width: 48,
    height: 28,
    borderRadius: 15,
    backgroundColor: '#D9E1F2',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  reminderToggleActive: {
    backgroundColor: '#4EC89A',
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
