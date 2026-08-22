import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Component, signal, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TalosTooltipDirective } from './tooltip.directive';

@Component({
  imports: [TalosTooltipDirective],
  template: `
    <button
      #btn
      talosTooltip="Edit Event"
      [tooltipDisabled]="disabled()"
    >
      Action
    </button>
  `
})
class TestHostComponent {
  readonly btnRef = viewChild.required<ElementRef<HTMLButtonElement>>('btn');
  readonly disabled = signal<boolean>(false);
}

describe('TalosTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let buttonEl: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let focusMonitor: FocusMonitor;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalosTooltipDirective, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    focusMonitor = TestBed.inject(FocusMonitor);
    fixture.detectChanges();
    buttonEl = hostComponent.btnRef().nativeElement;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should show tooltip on mouseenter and hide on mouseleave', () => {
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();

    buttonEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tooltipEl = overlayContainerElement.querySelector('.talos-tooltip-panel');
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.textContent?.trim()).toBe('Edit Event');

    buttonEl.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();
  });

  it('should NOT show tooltip when focus is programmatic (e.g. dialog autoFocus)', () => {
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();

    // Simulate programmatic focus (origin: 'program')
    focusMonitor.focusVia(buttonEl, 'program');
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();
  });

  it('should show tooltip when focus origin is keyboard', () => {
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();

    // Simulate keyboard focus (origin: 'keyboard')
    focusMonitor.focusVia(buttonEl, 'keyboard');
    fixture.detectChanges();

    const tooltipEl = overlayContainerElement.querySelector('.talos-tooltip-panel');
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.textContent?.trim()).toBe('Edit Event');

    // Focus out / blur
    buttonEl.blur();
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();
  });

  it('should hide tooltip on click and escape key', () => {
    buttonEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).not.toBeNull();

    buttonEl.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();

    // Reopen and test escape
    buttonEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).not.toBeNull();

    buttonEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();
  });

  it('should not show tooltip when disabled', () => {
    hostComponent.disabled.set(true);
    fixture.detectChanges();

    buttonEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();

    focusMonitor.focusVia(buttonEl, 'keyboard');
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.talos-tooltip-panel')).toBeNull();
  });
});
