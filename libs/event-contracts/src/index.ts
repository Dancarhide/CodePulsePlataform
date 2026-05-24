export enum EventType {
  USER_REGISTERED = 'user.registered',
  LAB_COMPLETED = 'lab.completed',
  TOURNAMENT_WON = 'tournament.won',
  LESSON_COMPLETED = 'lesson.completed',
}

export interface BaseEvent {
  eventId: string;
  timestamp: string;
  eventType: EventType;
}

export interface UserRegisteredEvent extends BaseEvent {
  eventType: EventType.USER_REGISTERED;
  data: {
    userId: string;
    email: string;
    name: string;
  };
}

export interface LabCompletedEvent extends BaseEvent {
  eventType: EventType.LAB_COMPLETED;
  data: {
    userId: string;
    labId: string;
    attemptId: string;
    xpReward: number;
    completedAt: string;
  };
}

export interface TournamentWonEvent extends BaseEvent {
  eventType: EventType.TOURNAMENT_WON;
  data: {
    userId: string;
    tournamentId: string;
    tournamentTitle: string;
    xpReward: number;
    position: number; // 1 = Winner, 2 = Runner-up, etc.
    completedAt: string;
  };
}

export interface LessonCompletedEvent extends BaseEvent {
  eventType: EventType.LESSON_COMPLETED;
  data: {
    userId: string;
    courseId: string;
    lessonId: string;
    completedAt: string;
  };
}
