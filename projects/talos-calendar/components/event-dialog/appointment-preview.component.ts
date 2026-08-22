import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, isSameDay } from 'date-fns';
import {
  CalendarEvent,
  CalendarEventColor,
} from '../../models/calendar.types';
import { TalosButtonDirective } from '@daedal-dev/talos-ui/button/button';
import { TalosTooltipDirective } from '@daedal-dev/talos-ui/feedback/tooltip';
import {
  LucideCalendar,
  LucideClock,
  LucideMapPin,
  LucideAlignLeft,
  LucideTag,
  LucidePencil,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';

@Component({
  selector: 'talos-appointment-preview',
  imports: [
    CommonModule,
    TalosButtonDirective,
    TalosTooltipDirective,
    LucideCalendar,
    LucideClock,
    LucideMapPin,
    LucideAlignLeft,
    LucideTag,
    LucidePencil,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './appointment-preview.component.html',
  styleUrls: ['./appointment-preview.component.scss'],
  host: {
    class: 'talos-appointment-preview-host',
  },
})
export class TalosAppointmentPreviewComponent {
  readonly event = input.required<CalendarEvent>();
  readonly allowEdit = input<boolean>(true);
  readonly allowDelete = input<boolean>(true);
  readonly showActions = input<boolean>(true);

  readonly edit = output<CalendarEvent>();
  readonly delete = output<string>();
  readonly close = output<void>();

  private readonly colorMap: Record<string, string> = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    purple: '#9333ea',
    pink: '#db2777',
    rose: '#e11d48',
    red: '#dc2626',
    emerald: '#059669',
    teal: '#0d9488',
    amber: '#d97706',
    orange: '#ea580c',
    cyan: '#0891b2',
  };

  readonly eventColorHex = computed<string>(() => {
    const c = this.event().color ?? 'blue';
    return this.colorMap[c] ?? c;
  });

  readonly eventColorLabel = computed<string>(() => {
    const c = this.event().color ?? 'blue';
    return c.charAt(0).toUpperCase() + c.slice(1);
  });

  readonly formattedDateRange = computed<string>(() => {
    const evt = this.event();
    const s = evt.start;
    const e = evt.end;

    if (evt.allDay) {
      if (isSameDay(s, e)) {
        return format(s, 'EEEE, MMMM d, yyyy');
      }
      return `${format(s, 'MMM d, yyyy')} – ${format(e, 'MMM d, yyyy')}`;
    }

    if (isSameDay(s, e)) {
      return format(s, 'EEEE, MMMM d, yyyy');
    }
    return `${format(s, 'MMM d, yyyy HH:mm')} – ${format(e, 'MMM d, yyyy HH:mm')}`;
  });

  readonly formattedTimeRange = computed<string>(() => {
    const evt = this.event();
    if (evt.allDay) return 'All-day event';

    const s = evt.start;
    const e = evt.end;
    if (isSameDay(s, e)) {
      return `${format(s, 'h:mm a')} – ${format(e, 'h:mm a')}`;
    }
    return `${format(s, 'MMM d, h:mm a')} – ${format(e, 'MMM d, h:mm a')}`;
  });

  onEditClick() {
    this.edit.emit(this.event());
  }

  onDeleteClick() {
    this.delete.emit(this.event().id);
  }

  onCloseClick() {
    this.close.emit();
  }
}
