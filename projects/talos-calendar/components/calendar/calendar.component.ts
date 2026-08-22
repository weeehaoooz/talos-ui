import { Component, input, model, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import {
  CalendarEvent,
  CalendarViewMode,
  CalendarDateSelectEvent,
  CalendarSize,
  CalendarEventClickAction,
} from '../../models/calendar.types';
import { CalendarHeaderComponent } from '../header/calendar-header.component';
import { CalendarMonthViewComponent } from '../month-view/month-view.component';
import { CalendarWeekViewComponent } from '../week-view/week-view.component';
import { CalendarDayViewComponent } from '../day-view/day-view.component';
import { CalendarAgendaViewComponent } from '../agenda-view/agenda-view.component';
import { TalosDialogService } from '@daedal-dev/talos-ui/feedback/dialog';
import {
  AppointmentDialogComponent,
  AppointmentDialogData,
  AppointmentDialogResult,
} from '../event-dialog/appointment-dialog.component';

@Component({
  selector: 'talos-calendar',
  imports: [
    CommonModule,
    CalendarHeaderComponent,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarAgendaViewComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  host: {
    class: 'talos-calendar-root',
    '[class.is-fullscreen]': 'fullscreen()',
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
    '[class.size-full]': 'size() === "full"',
    '[style.--talos-cal-custom-height]': 'height()',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class TalosCalendarComponent {
  private readonly dialogService = inject(TalosDialogService);

  readonly events = model<CalendarEvent[]>([]);
  readonly view = model<CalendarViewMode>('month');
  readonly currentDate = model<Date>(new Date());
  readonly selectedDate = model<Date | null>(null);

  readonly size = input<CalendarSize>('md');
  readonly fullscreen = model<boolean>(false);
  readonly allowFullscreen = input<boolean>(true);
  readonly height = input<string | null>(null);

  readonly allowEventCreation = input<boolean>(true);
  readonly eventClickAction = input<CalendarEventClickAction>('preview');
  readonly allowEventEdit = input<boolean>(true);
  readonly allowEventDelete = input<boolean>(true);
  readonly startHour = input<number>(0);
  readonly endHour = input<number>(24);

  readonly eventClick = output<CalendarEvent>();
  readonly eventAdd = output<CalendarEvent>();
  readonly eventUpdate = output<CalendarEvent>();
  readonly eventDelete = output<string>();
  readonly dateSelect = output<CalendarDateSelectEvent>();

  onPrev() {
    const cur = this.currentDate();
    switch (this.view()) {
      case 'month':
      case 'agenda':
        this.currentDate.set(subMonths(cur, 1));
        break;
      case 'week':
        this.currentDate.set(subWeeks(cur, 1));
        break;
      case 'day':
        this.currentDate.set(subDays(cur, 1));
        break;
    }
  }

  onNext() {
    const cur = this.currentDate();
    switch (this.view()) {
      case 'month':
      case 'agenda':
        this.currentDate.set(addMonths(cur, 1));
        break;
      case 'week':
        this.currentDate.set(addWeeks(cur, 1));
        break;
      case 'day':
        this.currentDate.set(addDays(cur, 1));
        break;
    }
  }

  onToday() {
    this.currentDate.set(new Date());
  }

  onViewChange(mode: CalendarViewMode) {
    this.view.set(mode);
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
    const action = this.eventClickAction();
    if (action === 'preview') {
      this.openPreviewDialog(event);
    } else if (action === 'edit') {
      this.openEditDialog(event);
    }
  }

  onDateSelect(selection: CalendarDateSelectEvent) {
    this.selectedDate.set(selection.start);
    this.dateSelect.emit(selection);
    if (this.allowEventCreation()) {
      this.openCreateDialog(selection);
    }
  }

  onNewEventClick() {
    this.openCreateDialog();
  }

  openCreateDialog(dateSelection?: CalendarDateSelectEvent) {
    const dialogData: AppointmentDialogData = {
      mode: 'create',
      dateSelection: dateSelection ?? {
        start: this.currentDate(),
        end: addDays(this.currentDate(), 0),
        allDay: false,
      },
      allowEdit: this.allowEventEdit(),
      allowDelete: this.allowEventDelete(),
    };

    const ref = this.dialogService.open<AppointmentDialogResult, AppointmentDialogData>(
      AppointmentDialogComponent,
      {
        data: dialogData,
        width: '520px',
      }
    );

    ref.closed.subscribe((res) => {
      if (res && res.action === 'create' && res.event) {
        this.events.update((list) => [...list, res.event]);
        this.eventAdd.emit(res.event);
      }
    });
  }

  openPreviewDialog(event: CalendarEvent) {
    const dialogData: AppointmentDialogData = {
      mode: 'preview',
      event,
      allowEdit: this.allowEventEdit(),
      allowDelete: this.allowEventDelete(),
    };

    const ref = this.dialogService.open<AppointmentDialogResult, AppointmentDialogData>(
      AppointmentDialogComponent,
      {
        data: dialogData,
        width: '520px',
      }
    );

    ref.closed.subscribe((res) => {
      if (!res) return;

      if (res.action === 'update' && res.event) {
        this.events.update((list) =>
          list.map((e) => (e.id === res.event.id ? res.event : e))
        );
        this.eventUpdate.emit(res.event);
      } else if (res.action === 'delete' && res.eventId) {
        this.events.update((list) => list.filter((e) => e.id !== res.eventId));
        this.eventDelete.emit(res.eventId);
      }
    });
  }

  openEditDialog(event: CalendarEvent) {
    const dialogData: AppointmentDialogData = {
      mode: 'edit',
      event,
      allowEdit: this.allowEventEdit(),
      allowDelete: this.allowEventDelete(),
    };

    const ref = this.dialogService.open<AppointmentDialogResult, AppointmentDialogData>(
      AppointmentDialogComponent,
      {
        data: dialogData,
        width: '520px',
      }
    );

    ref.closed.subscribe((res) => {
      if (!res) return;

      if (res.action === 'update' && res.event) {
        this.events.update((list) =>
          list.map((e) => (e.id === res.event.id ? res.event : e))
        );
        this.eventUpdate.emit(res.event);
      } else if (res.action === 'delete' && res.eventId) {
        this.events.update((list) => list.filter((e) => e.id !== res.eventId));
        this.eventDelete.emit(res.eventId);
      }
    });
  }

  toggleFullscreen() {
    this.fullscreen.update((curr) => !curr);
  }

  onEscape() {
    if (this.fullscreen()) {
      this.fullscreen.set(false);
    }
  }
}
