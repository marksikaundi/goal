import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoalTheme } from '@/constants/goal-theme';

type NavKey = 'home' | 'goals' | 'add' | 'history' | 'profile';

type NavItem = {
  key: NavKey;
  icon: keyof typeof Feather.glyphMap;
  route?: string;
  isAction?: boolean;
};

const items: NavItem[] = [
  { key: 'home', icon: 'home', route: '/(tabs)' },
  { key: 'goals', icon: 'pie-chart', route: '/(tabs)/goals' },
  { key: 'add', icon: 'plus', isAction: true },
  { key: 'history', icon: 'file-text' },
  { key: 'profile', icon: 'user' },
];

export function BottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(12, insets.bottom),
            paddingTop: 12,
          },
        ]}>
        <View style={styles.bar}>
          {items.map((item) => {
            const isActive = item.key === active || item.isAction;
            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  if (item.route) {
                    router.replace(item.route);
                  }
                }}
                style={[
                  styles.item,
                  isActive ? styles.itemActive : null,
                  item.isAction ? styles.itemAction : null,
                ]}>
                <Feather
                  name={item.icon}
                  size={item.isAction ? 20 : 18}
                  color={isActive ? '#111111' : '#FFFFFF'}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    alignItems: 'center',
  },
  bar: {
    backgroundColor: GoalTheme.pill,
    borderRadius: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  item: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: GoalTheme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  itemAction: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
  },
});
