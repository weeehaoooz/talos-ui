import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  addDays,
  subDays,
  setHours,
  setMinutes,
} from 'date-fns';
import {
  TalosCalendarComponent,
  CalendarEvent,
  CalendarViewMode,
  CalendarDateSelectEvent,
  CalendarSize,
  CalendarEventClickAction,
} from '@daedal-dev/talos-calendar';
import { TalosButtonDirective } from '@daedal-dev/talos-ui/button/button';
import {
  LucideCalendar,
  LucideClock,
  LucideFilter,
  LucideSparkles,
  LucideMaximize2,
  LucideMinimize2,
  LucideEye,
  LucidePencil,
  LucideSettings,
} from '@lucide/angular';

@Component({
  selector: 'app-calendar-page',
  imports: [
    CommonModule,
    FormsModule,
    TalosCalendarComponent,
    TalosButtonDirective,
    LucideCalendar,
    LucideClock,
    LucideFilter,
    LucideSparkles,
    LucideMaximize2,
    LucideMinimize2,
    LucideEye,
    LucidePencil,
    LucideSettings,
  ],
  templateUrl: './calendar-page.html',
  styleUrls: ['./calendar-page.scss'],
})
export class CalendarPageComponent {
  readonly currentView = signal<CalendarViewMode>('month');
  readonly activeDate = signal<Date>(new Date());
  readonly selectedCategory = signal<string>('all');
  readonly calendarSize = signal<CalendarSize>('md');
  readonly isFullscreen = signal<boolean>(false);

  readonly eventClickAction = signal<CalendarEventClickAction>('preview');
  readonly allowEventEdit = signal<boolean>(true);

  readonly eventClickActionOptions: { id: CalendarEventClickAction; label: string; desc: string }[] = [
    { id: 'preview', label: 'Preview Mode', desc: 'Opens details preview with extensible ng-content & edit button' },
    { id: 'edit', label: 'Direct Edit', desc: 'Opens full form directly in edit mode' },
    { id: 'none', label: 'None (Event only)', desc: 'Emits eventClick output without dialog' },
  ];

  readonly sizeOptions: { id: CalendarSize; label: string; desc: string }[] = [
    { id: 'sm', label: 'Compact (SM)', desc: 'Dashboard & widgets' },
    { id: 'md', label: 'Default (MD)', desc: 'Standard layout' },
    { id: 'lg', label: 'Spacious (LG)', desc: 'Large screens' },
  ];

  // Sample initial events spanning multiple days and timed slots
  readonly allEvents = signal<CalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'Global Tech Summit 2026',
      description: 'Annual cross-functional developer & product summit with keynotes.',
      start: subDays(new Date(), 2),
      end: addDays(new Date(), 1),
      allDay: true,
      color: 'blue',
      category: 'Conference',
      location: 'Convention Center & Virtual',
    },
    {
      id: 'evt-2',
      title: 'Design System Sprint',
      description: 'Refining tokens, components, and layout utilities with UX team.',
      start: new Date(),
      end: addDays(new Date(), 2),
      allDay: true,
      color: 'purple',
      category: 'Project',
      location: 'Design Studio B',
    },
    {
      id: 'evt-3',
      title: 'Product Architecture Review',
      description: 'Deep-dive into zoneless change detection and signal micro-stores.',
      start: setMinutes(setHours(new Date(), 10), 0),
      end: setMinutes(setHours(new Date(), 11), 30),
      allDay: false,
      color: 'indigo',
      category: 'Meeting',
      location: 'Room 402 / Meet',
    },
    {
      id: 'evt-4',
      title: 'Client Demo & Feedback',
      description: 'Walkthrough of talos-calendar multi-day scheduling components.',
      start: setMinutes(setHours(new Date(), 14), 0),
      end: setMinutes(setHours(new Date(), 15), 0),
      allDay: false,
      color: 'emerald',
      category: 'Client',
      location: 'Executive Boardroom',
    },
    {
      id: 'evt-5',
      title: 'Engineering Team 1:1s',
      description: 'Bi-weekly performance and career growth check-ins.',
      start: setMinutes(setHours(addDays(new Date(), 1), 11), 0),
      end: setMinutes(setHours(addDays(new Date(), 1), 12), 0),
      allDay: false,
      color: 'amber',
      category: 'Work',
      location: 'Office 3B',
    },
    {
      id: 'evt-6',
      title: 'Marketing Campaign Launch',
      description: 'Cross-channel Q3 marketing push and social campaigns.',
      start: addDays(new Date(), 3),
      end: addDays(new Date(), 6),
      allDay: true,
      color: 'rose',
      category: 'Project',
      location: 'HQ Floor 5',
    },
  ]);

  readonly filteredEvents = computed(() => {
    const cat = this.selectedCategory();
    const list = this.allEvents();
    if (cat === 'all') return list;
    return list.filter((e) => e.category?.toLowerCase() === cat.toLowerCase());
  });

  readonly categories = ['all', 'Conference', 'Project', 'Meeting', 'Client', 'Work'];

  readonly totalEventsCount = computed(() => this.allEvents().length);
  readonly multiDayEventsCount = computed(
    () => this.allEvents().filter((e) => e.allDay || e.end.getDate() !== e.start.getDate()).length
  );

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
  }

  onEventClick(event: CalendarEvent) {
    console.log('Event clicked:', event);
  }

  onDateSelect(selection: CalendarDateSelectEvent) {
    console.log('Date slot selected:', selection);
  }

  onEventAdded(event: CalendarEvent) {
    this.allEvents.update((list) => [...list, event]);
  }

  onEventUpdated(event: CalendarEvent) {
    this.allEvents.update((list) =>
      list.map((item) => (item.id === event.id ? event : item))
    );
  }

  onEventDeleted(id: string) {
    this.allEvents.update((list) => list.filter((item) => item.id !== id));
  }

  onSizeChange(size: CalendarSize) {
    this.calendarSize.set(size);
  }

  toggleFullscreen() {
    this.isFullscreen.update((f) => !f);
  }
}
