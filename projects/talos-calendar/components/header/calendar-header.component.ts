import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  format,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import { CalendarViewMode } from '../../models/calendar.types';
import { TalosButtonDirective } from '@daedal-dev/talos-ui/button/button';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucidePlus,
  LucideCalendar,
  LucideMaximize2,
  LucideMinimize2,
} from '@lucide/angular';

@Component({
  selector: 'talos-calendar-header',
  imports: [
    CommonModule,
    TalosButtonDirective,
    LucideChevronLeft,
    LucideChevronRight,
    LucidePlus,
    LucideCalendar,
    LucideMaximize2,
    LucideMinimize2,
  ],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
  host: {
    class: 'talos-calendar-header',
  },
})
export class CalendarHeaderComponent {
  readonly currentDate = input.required<Date>();
  readonly view = input.required<CalendarViewMode>();
  readonly showNewEventButton = input<boolean>(true);
  readonly fullscreen = input<boolean>(false);
  readonly showFullscreenToggle = input<boolean>(true);

  readonly prev = output<void>();
  readonly next = output<void>();
  readonly today = output<void>();
  readonly viewChange = output<CalendarViewMode>();
  readonly newEvent = output<void>();
  readonly fullscreenToggle = output<void>();

  readonly views: { id: CalendarViewMode; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  readonly formattedTitle = computed(() => {
    const date = this.currentDate();
    const mode = this.view();

    switch (mode) {
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'week': {
        const start = startOfWeek(date, { weekStartsOn: 0 });
        const end = endOfWeek(date, { weekStartsOn: 0 });
        if (isSameMonth(start, end)) {
          return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
        }
        if (isSameYear(start, end)) {
          return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
        }
        return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
      }
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'agenda':
        return `${format(date, 'MMMM yyyy')} Schedule`;
      default:
        return format(date, 'MMMM yyyy');
    }
  });

  onPrev() {
    this.prev.emit();
  }

  onNext() {
    this.next.emit();
  }

  onToday() {
    this.today.emit();
  }

  onSelectView(mode: CalendarViewMode) {
    this.viewChange.emit(mode);
  }

  onNewEvent() {
    this.newEvent.emit();
  }

  onFullscreenToggle() {
    this.fullscreenToggle.emit();
  }
}
