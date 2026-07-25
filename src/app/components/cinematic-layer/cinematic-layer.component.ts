import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ParticleEngine } from './particle-engine';

/**
 * <app-cinematic-layer>
 * A transparent, pointer-events-none Three.js canvas that renders a slow
 * field of warm bokeh particles with mouse parallax. Designed to sit as an
 * absolutely-positioned overlay above a hero photo (see VideoIntroComponent).
 */
@Component({
  selector: 'app-cinematic-layer',
  standalone: true,
  encapsulation: ViewEncapsulation.None, // canvas needs to fill its host, no scoping needed
  template: `<canvas #canvas class="cinematic-layer__canvas"></canvas>`,
  styleUrl: './cinematic-layer.component.scss',
})
export class CinematicLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Pass false to pause the engine (wired to the hero's play/pause control). */
  @Input() set playing(value: boolean) {
    this.engine?.setPaused(!value);
  }

  private engine?: ParticleEngine;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Respect users who've asked for reduced motion — skip the WebGL layer entirely.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    this.engine = new ParticleEngine(this.canvasRef.nativeElement, {
      particleCount: window.innerWidth < 720 ? 90 : 190,
      enableParallax: !('ontouchstart' in window),
    });
  }

  ngOnDestroy(): void {
    this.engine?.dispose();
  }
}
