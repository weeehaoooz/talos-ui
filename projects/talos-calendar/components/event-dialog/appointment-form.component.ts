import {
  Component,
  inject,
  signal,
  computed,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { format, parse, isValid, addHours } from 'date-fns';
import {
  CalendarEvent,
  CalendarEventColor,
  CalendarDateSelectEvent,
} from '../../models/calendar.types';
import { TalosButtonDirective } from '@daedal-dev/talos-ui/button/button';
import { TalosFormFieldComponent } from '@daedal-dev/talos-ui/form/form-field';
import { TalosInputDirective } from '@daedal-dev/talos-ui/form/input';
import { TalosSlideToggleComponent } from '@daedal-dev/talos-ui/form/slide-toggle';
import {
  SelectInputComponent,
  OptionComponent,
} from '@daedal-dev/talos-ui/form/select-input';
import { DatePickerComponent } from '@daedal-dev/talos-ui/form/date-picker';
import { DateTimePickerComponent } from '@daedal-dev/talos-ui/form/date-time-picker';
import { LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'talos-appointment-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TalosButtonDirective,
    TalosFormFieldComponent,
    TalosInputDirective,
    TalosSlideToggleComponent,
    SelectInputComponent,
    OptionComponent,
    DatePickerComponent,
    DateTimePickerComponent,
    LucideTrash2,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  host: {
    class: 'talos-appointment-form-host',
  },
})
export class TalosAppointmentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly event = input<CalendarEvent | undefined>(undefined);
  readonly dateSelection = input<CalendarDateSelectEvent | undefined>(undefined);
  readonly mode = input<'create' | 'edit'>('create');
  readonly allowDelete = input<boolean>(true);
  readonly showActions = input<boolean>(true);

  readonly save = output<CalendarEvent>();
  readonly delete = output<string>();
  readonly cancel = output<void>();

  readonly isEdit = computed(() => this.mode() === 'edit');

  readonly colorOptions: { id: CalendarEventColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Blue', hex: '#2563eb' },
    { id: 'indigo', label: 'Indigo', hex: '#4f46e5' },
    { id: 'purple', label: 'Purple', hex: '#9333ea' },
    { id: 'pink', label: 'Pink', hex: '#db2777' },
    { id: 'rose', label: 'Rose', hex: '#e11d48' },
    { id: 'emerald', label: 'Emerald', hex: '#059669' },
    { id: 'teal', label: 'Teal', hex: '#0d9488' },
    { id: 'amber', label: 'Amber', hex: '#d97706' },
    { id: 'orange', label: 'Orange', hex: '#ea580c' },
    { id: 'cyan', label: 'Cyan', hex: '#0891b2' },
  ];

  readonly categories: string[] = [
    'Work',
    'Meeting',
    'Conference',
    'Personal',
    'Client',
    'Project',
    'Review',
  ];

  selectedColor = signal<CalendarEventColor>('blue');

  form = this.fb.group({
    title: ['', [Validators.required]],
    startDate: [format(new Date(), 'yyyy-MM-dd'), [Validators.required]],
    endDate: [format(new Date(), 'yyyy-MM-dd'), [Validators.required]],
    startDateTime: [format(new Date(), 'yyyy-MM-dd HH:mm'), [Validators.required]],
    endDateTime: [format(addHours(new Date(), 1), 'yyyy-MM-dd HH:mm'), [Validators.required]],
    allDay: [false],
    category: ['Work'],
    location: [''],
    description: [''],
  });

  constructor() {
    this.form.get('allDay')?.valueChanges.subscribe((isAllDay) => {
      const val = this.form.getRawValue();
      if (isAllDay) {
        if (val.startDateTime) {
          const datePart = val.startDateTime.substring(0, 10);
          this.form.patchValue({ startDate: datePart }, { emitEvent: false });
        }
        if (val.endDateTime) {
          const datePart = val.endDateTime.substring(0, 10);
          this.form.patchValue({ endDate: datePart }, { emitEvent: false });
        }
      } else {
        if (val.startDate) {
          const timePart =
            val.startDateTime && val.startDateTime.length >= 16
              ? val.startDateTime.substring(11)
              : '09:00';
          this.form.patchValue(
            { startDateTime: `${val.startDate} ${timePart || '09:00'}` },
            { emitEvent: false }
          );
        }
        if (val.endDate) {
          const timePart =
            val.endDateTime && val.endDateTime.length >= 16
              ? val.endDateTime.substring(11)
              : '10:00';
          this.form.patchValue(
            { endDateTime: `${val.endDate} ${timePart || '10:00'}` },
            { emitEvent: false }
          );
        }
      }
    });

    effect(() => {
      const evt = this.event();
      const selection = this.dateSelection();
      const initialStart = evt?.start ?? selection?.start ?? new Date();
      const initialEnd = evt?.end ?? selection?.end ?? addHours(initialStart, 1);
      const initialAllDay = evt?.allDay ?? selection?.allDay ?? false;

      this.selectedColor.set(evt?.color ?? 'blue');
      this.form.patchValue(
        {
          title: evt?.title ?? '',
          startDate: format(initialStart, 'yyyy-MM-dd'),
          endDate: format(initialEnd, 'yyyy-MM-dd'),
          startDateTime: format(initialStart, 'yyyy-MM-dd HH:mm'),
          endDateTime: format(initialEnd, 'yyyy-MM-dd HH:mm'),
          allDay: initialAllDay,
          category: evt?.category ?? 'Work',
          location: evt?.location ?? '',
          description: evt?.description ?? '',
        },
        { emitEvent: false }
      );
    });
  }

  onSelectColor(color: CalendarEventColor) {
    this.selectedColor.set(color);
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const isAllDay = !!val.allDay;

    let start: Date;
    let end: Date;

    if (isAllDay) {
      const sVal = val.startDate;
      const eVal = val.endDate || sVal;
      start = sVal ? parse(sVal, 'yyyy-MM-dd', new Date()) : new Date();
      end = eVal ? parse(eVal, 'yyyy-MM-dd', new Date()) : new Date();
    } else {
      const sVal = val.startDateTime;
      const eVal = val.endDateTime || sVal;
      start = sVal ? parse(sVal, 'yyyy-MM-dd HH:mm', new Date()) : new Date();
      end = eVal ? parse(eVal, 'yyyy-MM-dd HH:mm', new Date()) : addHours(start, 1);
    }

    if (!isValid(start)) start = new Date();
    if (!isValid(end)) end = addHours(start, 1);

    const savedEvent: CalendarEvent = {
      id:
        this.event()?.id ??
        `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: val.title!.trim(),
      description: val.description?.trim() || undefined,
      start,
      end,
      allDay: isAllDay,
      color: this.selectedColor(),
      category: val.category || undefined,
      location: val.location?.trim() || undefined,
    };

    this.save.emit(savedEvent);
  }

  onDelete() {
    const evt = this.event();
    if (evt) {
      this.delete.emit(evt.id);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
