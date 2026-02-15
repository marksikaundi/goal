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
            <Text style={styles.welcomeTitle}>Welcome, Salung</Text>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerIcon}>
                <Feather name="settings" size={18} color={GoalTheme.text} />
              </Pressable>
              <Pressable style={styles.headerIcon}>
                <Feather name="power" size={18} color={GoalTheme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.cardPattern}>
              <View style={[styles.cardRing, styles.cardRingTop]} />
              <View style={[styles.cardRing, styles.cardRingBottom]} />
              <View style={[styles.cardGlow, styles.cardGlowLeft]} />
              <View style={[styles.cardGlow, styles.cardGlowRight]} />
            </View>
            <View style={styles.cardTopRow}>
              <View style={styles.cardChip}>
                <MaterialIcons name="credit-card" size={16} color="#0B0C0E" />
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
            <Pressable onPress={() => router.replace('/(tabs)/goals')} style={styles.sectionLinkRow}>
              <Text style={styles.sectionLink}>View all</Text>
              <Feather name="chevron-right" size={14} color={GoalTheme.muted} />
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
    marginTop: 8,
    marginBottom: 18,
  },
  welcomeTitle: {
    color: GoalTheme.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: GoalTheme.darkCard,
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  cardPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  cardRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 120,
  },
  cardRingTop: {
    width: 220,
    height: 220,
    top: -120,
    left: -20,
  },
  cardRingBottom: {
    width: 180,
    height: 180,
    bottom: -90,
    right: -30,
  },
  cardGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardGlowLeft: {
    bottom: -40,
    left: 30,
  },
  cardGlowRight: {
    top: -50,
    right: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardChip: {
    width: 28,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 11,
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
    marginBottom: 18,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#DADADA',
    fontSize: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GoalTheme.text,
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionLink: {
    fontSize: 12,
    color: GoalTheme.muted,
  },
});
