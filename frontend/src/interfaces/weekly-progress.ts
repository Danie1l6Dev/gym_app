export interface WeeklyProgressRoutine {
  id: string | number;
  name: string;
}

export interface WeeklyProgressDay {
  date: string;
  slug: string;
  label: string;
  is_today: boolean;
  is_past: boolean;
  is_scheduled: boolean;
  completed: boolean;
  routines: WeeklyProgressRoutine[];
}

export interface WeeklyProgress {
  week_start: string;
  week_end: string;
  target_days: number;
  completed_days: number;
  completed_target_days: number;
  percentage: number;
  status_label: string;
  next_pending_day?: WeeklyProgressDay | null;
  days: WeeklyProgressDay[];
}

export interface WeeklyProgressPayload {
  date: string;
  completed: boolean;
  notes?: string | null;
}
