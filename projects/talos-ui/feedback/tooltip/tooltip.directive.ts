import {
  Component,
  Directive,
  ElementRef,
  DestroyRef,
  inject,
  input,
  Injector,
  OnInit
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

export type TooltipPosition = 'top' | 'left' | 'right' | 'bottom' | 'auto';

@Component({
  selector: 'talos-tooltip-content',
  template: `<div class="talos-tooltip-inner">{{ text() }}</div>`,
  host: {
    'class': 'talos-tooltip-panel',
    'role': 'tooltip'
  }
})
export class TalosTooltipComponent {
  readonly text = input<string>('');
}

@Directive({
  selector: '[talosTooltip], [tooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(click)': 'hide()',
    '(keydown.escape)': 'hide()'
  }
})
export class TalosTooltipDirective implements OnInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly focusMonitor = inject(FocusMonitor);

  readonly tooltip = input<string>('', { alias: 'talosTooltip' });
  readonly tooltipContent = input<string>('', { alias: 'tooltip' });
  readonly position = input<TooltipPosition>('top', { alias: 'tooltipPosition' });
  readonly disabled = input<boolean>(false, { alias: 'tooltipDisabled' });

  private overlayRef: OverlayRef | null = null;

  ngOnInit(): void {
    this.focusMonitor.monitor(this.elementRef).subscribe((origin: FocusOrigin) => {
      if (origin === 'keyboard') {
        this.show();
      } else if (!origin) {
        this.hide();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.elementRef);
      this.hide();
    });
  }

  get tooltipText(): string {
    return this.tooltip() || this.tooltipContent() || '';
  }

  show(): void {
    if (this.disabled() || !this.tooltipText || this.overlayRef?.hasAttached()) {
      return;
    }

    const positionStrategy = this.createPositionStrategy();
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false
    });

    const portal = new ComponentPortal(TalosTooltipComponent, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.setInput('text', this.tooltipText);
  }

  hide(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private createPositionStrategy(): PositionStrategy {
    const pos = this.position();
    const strategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPush(false);

    const positions = {
      top: {
        originX: 'center' as const,
        originY: 'top' as const,
        overlayX: 'center' as const,
        overlayY: 'bottom' as const,
        offsetY: -8
      },
      bottom: {
        originX: 'center' as const,
        originY: 'bottom' as const,
        overlayX: 'center' as const,
        overlayY: 'top' as const,
        offsetY: 8
      },
      left: {
        originX: 'start' as const,
        originY: 'center' as const,
        overlayX: 'end' as const,
        overlayY: 'center' as const,
        offsetX: -8
      },
      right: {
        originX: 'end' as const,
        originY: 'center' as const,
        overlayX: 'start' as const,
        overlayY: 'center' as const,
        offsetX: 8
      }
    };

    if (pos === 'top') {
      strategy.withPositions([positions.top, positions.bottom, positions.left, positions.right]);
    } else if (pos === 'bottom') {
      strategy.withPositions([positions.bottom, positions.top, positions.left, positions.right]);
    } else if (pos === 'left') {
      strategy.withPositions([positions.left, positions.right, positions.top, positions.bottom]);
    } else if (pos === 'right') {
      strategy.withPositions([positions.right, positions.left, positions.top, positions.bottom]);
    } else {
      strategy.withPositions([positions.top, positions.bottom, positions.right, positions.left]);
    }

    return strategy;
  }
}
