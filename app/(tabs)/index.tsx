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
import { Action } from '@/types/database.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ID, Query } from 'react-native-appwrite';
import Swipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Button, Surface, Text } from 'react-native-paper';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);

  const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>({});

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

  useEffect(() => {
    if (!user) {
      return;
    }
    const channel = `databases.${DATABASE_ID}.collections.${ACTIONS_COLLECTION_ID}.documents`;

    const actionSubscription = client.subscribe(
      channel,
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

    fetchActions();

    return () => {
      actionSubscription();
    };
  }, [user]);

  async function handleDeleteAction(id: string) {
    try {
      await db.deleteDocument(DATABASE_ID, ACTIONS_COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCompleteAction(id: string) {
    if (!user) return;
    try {
      const currentDate = new Date().toISOString();
      await db.createDocument(
        DATABASE_ID,
        ACTION_COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          action_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );

      const action = actions.find((action) => action.$id === id);
      if (!action) return;

      await db.updateDocument(DATABASE_ID, ACTIONS_COLLECTION_ID, action.$id, {
        streak_count: action.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function renderRightActions() {
    return (
      <View style={styles.swipeActionRight}>
        <MaterialCommunityIcons
          name='check-circle-outline'
          size={32}
          color='white'
        />
      </View>
    );
  }

  function renderLeftActions() {
    return (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons
          name='trash-can-outline'
          size={32}
          color='white'
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/habit-2.png')}
          style={styles.headerLogo}
          resizeMode='contain'
        />
        <Button mode='text' onPress={signOut} icon='logout' textColor='#704229'>
          Sign Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {actions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No actions yet. Add your first slight edge action
            </Text>
          </View>
        ) : (
          actions?.map((action) => (
            <Swipeable
              key={action.$id}
              overshootLeft={false}
              overshootRight={false}
              ref={(ref: SwipeableMethods | null) => {
                swipeableRefs.current[action.$id] = ref;
              }}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                  handleDeleteAction(action.$id);
                } else if (direction === 'left') {
                  handleCompleteAction(action.$id);
                }
                swipeableRefs.current[action.$id]?.close();
              }}
            >
              <Surface style={styles.card} elevation={0}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{action.title}</Text>
                  <Text style={styles.cardDescription}>
                    {action.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name='fire'
                        size={20}
                        color='#704229'
                      />
                      <Text style={styles.streakCount}>
                        {action.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {action.frequency}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
      {/* <Text style={styles.title}>Daily Edge</Text> */}
      {/* <Text style={{ marginBottom: 10 }}>
        Plant small habits, grow a better life.
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  headerLogo: {
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    color: '#555555',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#704229',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 10,
    color: '#555555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf1e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakCount: {
    marginLeft: 8,
    color: '#704229',
    fontWeight: 'bold',
    fontSize: 12,
  },
  frequencyBadge: {
    backgroundColor: '#704229',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },

  nav: {
    marginVertical: 10,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'black',
    padding: 10,
    textAlign: 'center',
    width: '25%',
    borderRadius: 5,
  },
  swipeActionLeft: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
