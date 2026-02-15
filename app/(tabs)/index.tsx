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

export default function HomeScreen() {
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

  const featuredGoals = useMemo(() => goals.slice(0, 3), [goals]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcomeLabel}>Welcome,</Text>
              <Text style={styles.welcomeName}>Salung</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerIcon}>
                <Feather name="settings" size={18} color={GoalTheme.text} />
              </Pressable>
              <Pressable style={styles.headerIcon}>
                <Feather name="bell" size={18} color={GoalTheme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardChip}>
                <MaterialIcons name="credit-card" size={18} color="#0B0C0E" />
              </View>
              <Text style={styles.cardNumber}>**** 6780</Text>
            </View>
            <Text style={styles.cardLabel}>My Balance</Text>
            <Text style={styles.cardAmount}>{formatCurrency(balance)}</Text>
            <View style={styles.cardActions}>
              <ActionButton icon="plus" label="Top up" />
              <ActionButton icon="arrow-up-right" label="Send" />
              <ActionButton icon="arrow-down-left" label="Withdraw" />
              <ActionButton icon="file-text" label="History" />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Your goals</Text>
            <Pressable onPress={() => router.replace('/(tabs)/goals')}>
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>

          {featuredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/goal/${goal.id}`)} />
          ))}
        </ScrollView>
        <BottomNav active="home" />
      </View>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.actionIcon}>
        <Feather name={icon} size={18} color={GoalTheme.text} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
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
    marginBottom: 20,
  },
  welcomeLabel: {
    color: GoalTheme.muted,
    fontSize: 14,
  },
  welcomeName: {
    color: GoalTheme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: GoalTheme.darkCard,
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardChip: {
    width: 32,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 2,
  },
  cardLabel: {
    color: '#9B9B9B',
    fontSize: 12,
    marginBottom: 6,
  },
  cardAmount: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#E5E5E5',
    fontSize: 11,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  sectionLink: {
    fontSize: 13,
    color: GoalTheme.muted,
  },
});
