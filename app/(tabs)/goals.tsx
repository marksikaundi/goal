import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BottomNav } from '@/components/bottom-nav';
import { GoalCard } from '@/components/goal-card';
import { GoalTheme } from '@/constants/goal-theme';
import { getAccountBalance, getGoals, type Goal } from '@/lib/db';
import { formatCurrency } from '@/lib/format';

const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  vacation: 'flight-takeoff',
  estate: 'home',
  education: 'school',
};

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [balance, setBalance] = useState<number>(23400);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [goalRows, accountBalance] = await Promise.all([getGoals(), getAccountBalance()]);
        if (!isMounted) {
          return;
        }
        setGoals(goalRows);
        setBalance(accountBalance);
      } catch (error) {
        console.error('Failed to load goals', error);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartBars = useMemo(() => {
    const maxHeight = 150;
    const minHeight = 70;
    const goalBars = goals.map((goal) => {
      const progress = Math.min(1, goal.current_amount / goal.target_amount);
      const height = minHeight + (maxHeight - minHeight) * progress;
      return {
        id: goal.id,
        color: goal.color,
        icon: iconMap[goal.icon] ?? 'flag',
        height,
        isBalance: false,
      };
    });
    return [
      { id: 'balance', color: '#101214', height: maxHeight, icon: 'account-balance-wallet', isBalance: true },
      ...goalBars,
    ];
  }, [goals]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Goals</Text>
            <Pressable style={styles.addButton}>
              <Feather name="plus" size={14} color={GoalTheme.text} />
              <Text style={styles.addButtonText}>Add Goal</Text>
            </Pressable>
          </View>

          <View style={styles.balancePanel}>
            <View style={styles.balanceChip}>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <View style={styles.dashedLine} />
            <View style={styles.chartRow}>
              <View style={styles.chartBaseline} />
              {chartBars.map((bar) => (
                <View key={bar.id} style={styles.chartItem}>
                  {bar.icon ? (
                    <View style={[styles.chartIcon, bar.isBalance ? styles.balanceIcon : null]}>
                      <MaterialIcons
                        name={bar.icon}
                        size={14}
                        color={bar.isBalance ? '#101214' : bar.color}
                      />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.chartBar,
                      bar.isBalance ? styles.balanceBar : styles.goalBar,
                      { height: bar.height, backgroundColor: bar.color },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>All My Goals</Text>

          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/goal/${goal.id}`)} />
          ))}
        </ScrollView>
        <BottomNav active="goals" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: GoalTheme.text,
  },
  balancePanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 22,
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  balanceChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1B1C20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceLabel: {
    color: GoalTheme.muted,
    fontSize: 11,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DADADA',
    marginVertical: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    height: 190,
    position: 'relative',
  },
  chartBaseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 54,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DADADA',
  },
  chartItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  chartBar: {
    borderRadius: 14,
  },
  balanceBar: {
    width: 26,
  },
  goalBar: {
    width: 22,
  },
  chartIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceIcon: {
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GoalTheme.text,
    marginBottom: 14,
  },
});
