import {
  ACTION_COMPLETIONS_COLLECTION_ID,
  ACTIONS_COLLECTION_ID,
  DATABASE_ID,
  db,
} from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Action, ActionCompletion } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Query } from 'react-native-appwrite';

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
      return;
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
    let total = actionCompletions?.length;

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
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        streak = currentStreak;
        lastDate = actionCompletionDate;
      }
    });

    return { streak, longestStreak, total };
  }

  return (
    <View>
      <Text>Action Streaks</Text>
    </View>
  );
}
