import {Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import { Platform } from '@ionic/angular';

const LONG_PRESS_DEFAULT_TIMEOUT = 500;
@Directive({
  selector: '[appLongPress]',
})
export class LongPressDirective implements OnInit, OnDestroy {

  @Input() longPressTimeout: number;
  @Output() longPressed: EventEmitter<any> = new EventEmitter();

  private readonly el: HTMLElement;
  private longPressTimeoutRef: NodeJS.Timeout;
  private initialPos: number = 0;
  private moveThreshold: number = 10;

  constructor(public zone: NgZone,
              el: ElementRef,
              platform: Platform) {
    this.el = el.nativeElement;
    if (!platform.is("cordova")) {
      window.oncontextmenu = function() {
        return false;
      }
    }
  }

  ngOnInit(): void {
    if (!this.longPressTimeout) {
      this.longPressTimeout = LONG_PRESS_DEFAULT_TIMEOUT;
    }
    this.el.addEventListener("touchstart", (e: TouchEvent) => { this.start(e.touches[0].clientY);});
    this.el.addEventListener("touchend", (e: TouchEvent) => { this.clear();});
    this.el.addEventListener("touchcancel", (e: TouchEvent) => { this.clear();});
    this.el.addEventListener("touchmove", (e: TouchEvent) => { this.move(e.touches[0].clientY);});
  }

  start(initialPos: number = 0): void {
    this.clear();
    this.initialPos = initialPos;
    this.longPressTimeoutRef = setTimeout(() => {
      this.longPressed.emit();
    }, this.longPressTimeout);
  }

  clear(): void {
    if (this.longPressTimeoutRef !== undefined) {
      clearTimeout(this.longPressTimeoutRef);
      this.longPressTimeoutRef = undefined;
    }
  }

  move(newPos: number = 0): void {
    // check if client moved to much
    if (Math.abs(this.initialPos-newPos) > this.moveThreshold) {
      this.clear();
    }
  }

  ngOnDestroy(): void {}
}
