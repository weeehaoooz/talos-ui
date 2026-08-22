import {
  Component,
  inject,
  signal,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TalosDialogRef,
  TALOS_DIALOG_DATA,
  TalosDialogModule,
} from '@daedal-dev/talos-ui/feedback/dialog';
import { TalosButtonDirective } from '@daedal-dev/talos-ui/button/button';
import { TalosTooltipDirective } from '@daedal-dev/talos-ui/feedback/tooltip';
import {
  CalendarEvent,
  CalendarDateSelectEvent,
} from '../../models/calendar.types';
import { TalosAppointmentPreviewComponent } from './appointment-preview.component';
import { TalosAppointmentFormComponent } from './appointment-form.component';
import { LucideTrash2, LucidePencil } from '@lucide/angular';

export type AppointmentDialogMode = 'create' | 'edit' | 'preview';

export interface AppointmentDialogData {
  event?: CalendarEvent;
  dateSelection?: CalendarDateSelectEvent;
  mode?: AppointmentDialogMode;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export type AppointmentDialogResult =
  | { action: 'create'; event: CalendarEvent }
  | { action: 'update'; event: CalendarEvent }
  | { action: 'delete'; eventId: string };

@Component({
  selector: 'talos-appointment-dialog',
  imports: [
    CommonModule,
    TalosDialogModule,
    TalosButtonDirective,
    TalosTooltipDirective,
    TalosAppointmentPreviewComponent,
    TalosAppointmentFormComponent,
    LucideTrash2,
    LucidePencil,
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  host: {
    class: 'talos-appointment-dialog-host',
    '[class.is-preview]': 'currentMode() === "preview"',
    '[class.is-edit]': 'currentMode() === "edit"',
    '[class.is-create]': 'currentMode() === "create"',
  },
})
export class AppointmentDialogComponent {
  private readonly dialogRef = inject<
    TalosDialogRef<AppointmentDialogResult, AppointmentDialogData>
  >(TalosDialogRef, { optional: true });
  readonly data = inject<AppointmentDialogData>(TALOS_DIALOG_DATA, { optional: true });

  // Optional ViewChild to trigger form submission from dialog footer
  readonly formComponent = viewChild<TalosAppointmentFormComponent>(TalosAppointmentFormComponent);

  // Component inputs (for standalone embedded usage)
  readonly eventInput = input<CalendarEvent | undefined>(undefined, { alias: 'event' });
  readonly modeInput = input<AppointmentDialogMode | undefined>(undefined, { alias: 'mode' });
  readonly allowEditInput = input<boolean>(true, { alias: 'allowEdit' });
  readonly allowDeleteInput = input<boolean>(true, { alias: 'allowDelete' });

  // Component outputs
  readonly editClick = output<CalendarEvent>();
  readonly save = output<CalendarEvent>();
  readonly delete = output<string>();
  readonly cancel = output<void>();

  // Determine initial mode
  private readonly initialMode: AppointmentDialogMode =
    this.modeInput() ??
    this.data?.mode ??
    (this.data?.event || this.eventInput() ? 'preview' : 'create');

  readonly currentMode = signal<AppointmentDialogMode>(this.initialMode);
  readonly wasInitiallyPreview = signal<boolean>(this.initialMode === 'preview');

  readonly activeEvent = computed<CalendarEvent | undefined>(
    () => this.eventInput() ?? this.data?.event
  );

  readonly canEdit = computed<boolean>(() => {
    if (this.data?.allowEdit !== undefined) {
      return this.data.allowEdit;
    }
    return this.allowEditInput();
  });

  readonly canDelete = computed<boolean>(() => {
    const isAllowed =
      this.data?.allowDelete !== undefined ? this.data.allowDelete : this.allowDeleteInput();
    return isAllowed && !!this.activeEvent();
  });

  readonly isCreate = computed(() => this.currentMode() === 'create');
  readonly isEdit = computed(() => this.currentMode() === 'edit');
  readonly isPreview = computed(() => this.currentMode() === 'preview');

  switchToEdit() {
    this.currentMode.set('edit');
    const evt = this.activeEvent();
    if (evt) {
      this.editClick.emit(evt);
    }
  }

  switchToPreview() {
    this.currentMode.set('preview');
  }

  onSave(event: CalendarEvent) {
    this.save.emit(event);
    if (this.dialogRef) {
      this.dialogRef.close({
        action: this.isCreate() ? 'create' : 'update',
        event,
      });
    }
  }

  onDelete(eventId: string) {
    this.delete.emit(eventId);
    if (this.dialogRef) {
      this.dialogRef.close({ action: 'delete', eventId });
    }
  }

  onCancel() {
    if (this.isEdit() && this.wasInitiallyPreview()) {
      this.switchToPreview();
      return;
    }

    this.cancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  submitForm() {
    this.formComponent()?.onSave();
  }

  triggerDelete() {
    const evt = this.activeEvent();
    if (evt) {
      this.onDelete(evt.id);
    }
  }
}
