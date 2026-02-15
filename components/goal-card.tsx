import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GoalTheme } from '@/constants/goal-theme';
import { formatCurrency, formatPercent, formatTimeLeft } from '@/lib/format';
import type { Goal } from '@/lib/db';

const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  vacation: 'flight-takeoff',
  estate: 'home',
  education: 'school',
};

export function GoalCard({ goal, onPress }: { goal: Goal; onPress?: () => void }) {
  const progress = Math.min(1, goal.current_amount / goal.target_amount);
  const percent = formatPercent(progress);
  const timeLeft = formatTimeLeft(goal.due_date);
  const iconName = iconMap[goal.icon] ?? 'flag';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: `${goal.color}22` }]}>
            <MaterialIcons name={iconName} size={18} color={goal.color} />
          </View>
          <Text style={styles.title}>{goal.title}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={GoalTheme.muted} />
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountCurrent}>{formatCurrency(goal.current_amount)}</Text>
        <Text style={styles.amountTarget}>{formatCurrency(goal.target_amount)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: goal.color }]} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{timeLeft}</Text>
        <Text style={styles.metaText}>{percent}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GoalTheme.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: GoalTheme.text,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountCurrent: {
    fontSize: 14,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  amountTarget: {
    fontSize: 12,
    color: GoalTheme.muted,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#ECECEC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: GoalTheme.muted,
  },
});
