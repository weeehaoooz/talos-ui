export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export type CalendarSize = 'sm' | 'md' | 'lg' | 'full';

export type CalendarEventClickAction = 'preview' | 'edit' | 'none';

export type CalendarEventColor =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'rose'
  | 'red'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | (string & {});

export interface CalendarEvent<T = unknown> {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: CalendarEventColor;
  category?: string;
  location?: string;
  attendees?: string[];
  data?: T;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface SpanningEventSegment {
  event: CalendarEvent;
  startCol: number; // 0 to 6
  span: number;     // 1 to 7
  isStart: boolean; // True if event starts on or before this day in this row
  isEnd: boolean;   // True if event ends on or after this day in this row
  trackIndex: number;
}

export interface CalendarMonthCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  dayNumber: number;
  singleDayEvents: CalendarEvent[];
}

export interface CalendarWeekRow {
  days: CalendarMonthCell[];
  spanningSegments: SpanningEventSegment[];
  maxTrackCount: number;
}

export interface CalendarTimeSlotEvent {
  event: CalendarEvent;
  topPercent: number;
  heightPercent: number;
  leftPercent: number;
  widthPercent: number;
}

export interface CalendarDateSelectEvent {
  start: Date;
  end: Date;
  allDay?: boolean;
}
