/* eslint-disable react-hooks/exhaustive-deps */
import {
  ACTION_COMPLETIONS_COLLECTION_ID,
  ACTIONS_COLLECTION_ID,
  client,
  DATABASE_ID,
  db,
  RealtimeResponse,
} from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Action, ActionCompletion } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { Card, Text } from 'react-native-paper';

type StreakData = {
  streak: number;
  longestStreak: number;
  total: number;
};

export default function StreaksScreen() {
  const [actions, setActions] = useState<Action[]>([]);
  const [completedActions, setCompletedActions] = useState<ActionCompletion[]>(
    []
  );

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const actionsChannel = `databases.${DATABASE_ID}.collections.${ACTIONS_COLLECTION_ID}.documents`;

      const actionSubscription = client.subscribe(
        actionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              'databases.*.collections.*.documents.*.create'
            )
          ) {
            fetchActions();
          } else if (
            response.events.includes(
              'databases.*.collections.*.documents.*.update'
            )
          ) {
            fetchActions();
          } else if (
            response.events.includes(
              'databases.*.collections.*.documents.*.delete'
            )
          ) {
            fetchActions();
          }
        }
      );

      const completedActionsChannel = `databases.${DATABASE_ID}.collections.${ACTION_COMPLETIONS_COLLECTION_ID}.documents`;

      const completedActionsSubscription = client.subscribe(
        completedActionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              'databases.*.collections.*.documents.*.create'
            )
          ) {
            fetchCompletedActions();
          }
        }
      );

      fetchActions();
      fetchCompletedActions();

      return () => {
        actionSubscription();
        completedActionsSubscription();
      };
    }
    fetchActions();
    fetchCompletedActions();
  }, [user]);

  async function fetchActions() {
    try {
      const response = await db.listDocuments(
        DATABASE_ID,
        ACTIONS_COLLECTION_ID,
        [Query.equal('user_id', user?.$id ?? '')]
      );

      setActions(response.documents as Action[]);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCompletedActions() {
    try {
      const response = await db.listDocuments(
        DATABASE_ID,
        ACTION_COMPLETIONS_COLLECTION_ID,
        [Query.equal('user_id', user?.$id ?? '')]
      );
      const completedActions = response.documents as ActionCompletion[];
      setCompletedActions(completedActions);
    } catch (error) {
      console.error(error);
    }
  }

  function getStreakData(actionId: string) {
    const actionCompletions = completedActions
      ?.filter((action) => action.action_id === actionId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );

    if (actionCompletions.length === 0) {
      return {
        streak: 0,
        longestStreak: 0,
        total: 0,
      };
    }

    // build streak data
    let streak = 0;
    let longestStreak = 0;
    let total = actionCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    actionCompletions.forEach((actionCompletion) => {
      const actionCompletionDate = new Date(actionCompletion.completed_at);
      if (lastDate) {
        const diff =
          (actionCompletionDate.getTime() - lastDate.getTime()) /
          (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      streak = currentStreak;
      lastDate = actionCompletionDate;
    });

    return { streak, longestStreak, total };
  }

  const actionStreaks = actions.map((action) => {
    const { streak, longestStreak, total } = getStreakData(action.$id);
    return {
      action,
      streak,
      longestStreak,
      total,
    };
  });

  const rankedActions = actionStreaks.sort(
    (a, b) => b.longestStreak - a.longestStreak
  );

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View style={styles.container}>
      {rankedActions.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle} variant='headlineSmall'>
            🥇 Top Streaks
          </Text>
          {rankedActions.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.rankingBadgeContainer}>
              <View style={[styles.rankingBadge, badgeStyles[index]]}>
                <Text style={styles.rankingBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.rankingBadgeDescription}>
                {item.action.title}
              </Text>
              <Text style={styles.rankingStreak}> {item.longestStreak}</Text>
            </View>
          ))}
        </View>
      )}

      {actions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            No ranked actions yet. Start ranking your actions to see them here
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {rankedActions.map(
            ({ action, streak, longestStreak, total }, index) => (
              <Card
                key={index}
                style={[styles.card, index === 0 && styles.cardBest]}
              >
                <Card.Content>
                  <Text variant='titleMedium' style={styles.cardTitle}>
                    {action.title}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {action.description}
                  </Text>
                  <View style={styles.statsContainer}>
                    <View style={styles.statBadgeCurrent}>
                      <Text style={styles.statBadgeText}>🔥 {streak}</Text>
                      <Text style={styles.statLabel}>Current</Text>
                    </View>
                    <View style={styles.statBadgeGold}>
                      <Text style={styles.statBadgeText}>
                        🏆 {longestStreak}
                      </Text>
                      <Text style={styles.statLabel}>Longest</Text>
                    </View>
                    <View style={styles.statBadgeGreen}>
                      <Text style={styles.statBadgeText}>✅ {total}</Text>
                      <Text style={styles.statLabel}>Total</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    padding: 14,
  },
  container: {
    flex: 1,
    padding: 14,
  },

  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    // elevation: 3,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardBest: {
    borderWidth: 2,
    borderColor: '#704229',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    color: '#555555',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#704229',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 10,
    color: '#6c6c80',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  statBadgeCurrent: {
    backgroundColor: '#f9ede7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  statBadgeGold: {
    backgroundColor: '#fbf7ce',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeText: {
    color: '#704229',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statLabel: {
    fontSize: 10,
    marginLeft: 8,
    color: '#704229',
    fontWeight: '500',
  },
  badge1: {
    backgroundColor: '#ffb300',
  },
  badge2: {
    backgroundColor: '#c0c0c0',
  },
  badge3: {
    backgroundColor: '#cd7f32',
  },
  rankingContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#704229',
    letterSpacing: 1,
  },
  rankingBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  rankingBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankingBadgeDescription: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  rankingStreak: {
    fontSize: 14,
    color: '#704229',
    fontWeight: 'bold',
  },
});
