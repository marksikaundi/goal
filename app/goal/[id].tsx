import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { GoalTheme } from '@/constants/goal-theme';
import { getGoalById, getTransactionsForGoal, type Goal, type Transaction } from '@/lib/db';
import { formatCurrency, formatPercent, formatTime, formatTimeLeft } from '@/lib/format';

const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  vacation: 'flight-takeoff',
  estate: 'home',
  education: 'school',
};

const analyticsData = [30, 44, 38, 52, 76, 60];
const analyticsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function GoalDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const goalId = Number(params.id ?? '');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!Number.isFinite(goalId)) {
        setLoading(false);
        return;
      }
      try {
        const [goalRow, txRows] = await Promise.all([
          getGoalById(goalId),
          getTransactionsForGoal(goalId),
        ]);
        if (!isMounted) {
          return;
        }
        setGoal(goalRow);
        setTransactions(txRows);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load goal detail', error);
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [goalId]);

  const progress = useMemo(() => {
    if (!goal) {
      return 0;
    }
    return Math.min(1, goal.current_amount / goal.target_amount);
  }, [goal]);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={20} color={GoalTheme.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Goal Detail</Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{loading ? 'Loading...' : 'Goal not found.'}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const iconName = iconMap[goal.icon] ?? 'flag';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 160 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={20} color={GoalTheme.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Goals Detail</Text>
            <Pressable style={styles.iconButton}>
              <Feather name="more-vertical" size={18} color={GoalTheme.text} />
            </Pressable>
          </View>

          <View style={styles.increaseRow}>
            <View style={styles.iconBadge}>
              <MaterialIcons name={iconName} size={20} color={goal.color} />
            </View>
            <View style={styles.increaseTag}>
              <Text style={styles.increaseText}>+112.00%</Text>
              <Text style={styles.increaseCaption}>Increased since Apr</Text>
            </View>
          </View>

          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressAmountRow}>
              <Text style={styles.progressCurrent}>{formatCurrency(goal.current_amount)}</Text>
              <Text style={styles.progressTarget}>{formatCurrency(goal.target_amount)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: goal.color },
                ]}
              />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMeta}>{formatTimeLeft(goal.due_date)}</Text>
              <Text style={styles.progressMeta}>{formatPercent(progress)}</Text>
            </View>
          </View>

          <View style={styles.analyticsCard}>
            <View style={styles.analyticsHeader}>
              <Text style={styles.analyticsTitle}>Saving Analytics</Text>
              <Text style={styles.analyticsValue}>Average per month {formatCurrency(1202)}</Text>
            </View>
            <View style={styles.analyticsChart}>
              {analyticsData.map((value, index) => (
                <View key={`${analyticsLabels[index]}-${value}`} style={styles.analyticsItem}>
                  <View style={[styles.analyticsBar, { height: value }]} />
                  <Text style={styles.analyticsLabel}>{analyticsLabels[index]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
          </View>
          <View style={styles.transactionsCard}>
            {transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionRow}>
                <View style={styles.transactionIcon}>
                  <Feather name="arrow-down-left" size={16} color={goal.color} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{tx.title}</Text>
                  <Text style={styles.transactionSubtitle}>{formatTime(tx.created_at)}</Text>
                </View>
                <Text style={styles.transactionAmount}>+{formatCurrency(tx.amount)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={[styles.footer, { bottom: 16 + insets.bottom }]}>
          <Pressable style={styles.topUpButton}>
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.topUpText}>Top up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GoalTheme.background,
  },
  container: {
    flex: 1,
    backgroundColor: GoalTheme.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GoalTheme.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  increaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  increaseTag: {
    backgroundColor: '#EAF8F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  increaseText: {
    color: '#1DA86C',
    fontSize: 12,
    fontWeight: '600',
  },
  increaseCaption: {
    color: '#1DA86C',
    fontSize: 10,
    marginTop: 2,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: GoalTheme.text,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 13,
    color: GoalTheme.muted,
    marginBottom: 18,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  progressAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressCurrent: {
    fontSize: 16,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  progressTarget: {
    fontSize: 14,
    color: GoalTheme.muted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#ECECEC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMeta: {
    fontSize: 12,
    color: GoalTheme.muted,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  analyticsHeader: {
    marginBottom: 12,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GoalTheme.text,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 12,
    color: GoalTheme.muted,
  },
  analyticsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsBar: {
    width: 20,
    borderRadius: 10,
    backgroundColor: '#2A2B2F',
  },
  analyticsLabel: {
    fontSize: 10,
    color: GoalTheme.muted,
    marginTop: 6,
  },
  transactionsHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: GoalTheme.text,
  },
  transactionSubtitle: {
    fontSize: 11,
    color: GoalTheme.muted,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  topUpButton: {
    backgroundColor: GoalTheme.pill,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  topUpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: GoalTheme.muted,
  },
});
