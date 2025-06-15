import { Models } from 'react-native-appwrite';

export type Action = Models.Document & {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  created_at: string;
};

export type ActionCompletion = Models.Document & {
  action_id: string;
  user_id: string;
  completed_at: string;
};
