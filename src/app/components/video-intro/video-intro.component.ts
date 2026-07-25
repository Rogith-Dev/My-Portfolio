import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import gsap from 'gsap';
import { CinematicLayerComponent } from '../cinematic-layer/cinematic-layer.component';

/**
 * <app-video-intro>
 * Fullscreen, sticky cinematic hero. Composes:
 *  - a blurred ambient duplicate of the portrait (CSS)
 *  - the sharp foreground portrait (CSS)
 *  - <app-cinematic-layer> — the Three.js bokeh overlay
 *  - a GSAP entrance timeline for the headline / copy
 *  - glassmorphism play/pause + mute controls
 *  - an animated scroll indicator that scrolls to the next section
 */
@Component({
  selector: 'app-video-intro',
  standalone: true,
  imports: [CommonModule, CinematicLayerComponent],
  templateUrl: './video-intro.component.html',
  styleUrl: './video-intro.component.scss',
})
export class VideoIntroComponent implements AfterViewInit, OnDestroy {
  // ---- content inputs (override from the parent route/page) -------------
  @Input() firstName = 'ROGITH';
  @Input() lastName = 'T.';
  @Input() role = 'Full-Stack Engineer';
  @Input() tagline = 'DEVELOPER PORTFOLIO — 2026';
  @Input() subtitleText =
    'Full-Stack Engineer crafting immersive web experiences with Angular, Node.js and Three.js — turning interface into atmosphere, one frame at a time.';
  @Input() mainImage = 'assets/hero-photo.jpg';
  @Input() bgImage = 'assets/hero-photo-blur.jpg';
  @Input() roleChips_data: string[] = ['Angular · NgRx · RxJS', 'Node.js · Express · MongoDB', 'Three.js · WebGL'];
  /** Convenience for the alt text / aria-labels. */
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /** Id (or selector) of the section to scroll to when the indicator is clicked. */
  @Input() nextSectionSelector = '#next-section';

  // ---- view refs -----------------------------------------------------------
  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef<HTMLElement>;
  @ViewChild('nameLine1', { static: true }) nameLine1!: ElementRef<HTMLElement>;
  @ViewChild('nameLine2', { static: true }) nameLine2!: ElementRef<HTMLElement>;
  @ViewChild('eyebrow', { static: true }) eyebrow!: ElementRef<HTMLElement>;
  @ViewChild('subtitle', { static: true }) subtitle!: ElementRef<HTMLElement>;
  @ViewChild('roleChips', { static: true }) roleChips!: ElementRef<HTMLElement>;

  // ---- state -----------------------------------------------------------
  isPlaying = true;
  isMuted = true;
  showSoundHint = true;

  private timeline?: gsap.core.Timeline;
  private soundHintTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    this.playEntranceAnimation();

    // Auto-hide the "click to enable sound" hint after a few seconds.
    this.soundHintTimer = setTimeout(() => (this.showSoundHint = false), 6500);
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
    if (this.soundHintTimer) clearTimeout(this.soundHintTimer);
  }

  // ---- GSAP entrance -----------------------------------------------------
  private playEntranceAnimation(): void {
    // Respect reduced-motion users — CSS handles the static fallback state.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    this.timeline
      .set([this.nameLine1.nativeElement, this.nameLine2.nativeElement], { yPercent: 110 })
      .to(this.nameLine1.nativeElement, { yPercent: 0, duration: 1.1 }, 0.9)
      .to(this.nameLine2.nativeElement, { yPercent: 0, duration: 1.1 }, 1.05);
  }

  // ---- interactions -----------------------------------------------------
  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    // isPlaying is bound to <app-cinematic-layer [playing]>, which pauses
    // the particle render loop; wire real video/audio playback here too
    // if a background video track is added later.
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  scrollToNext(): void {
    const target = document.querySelector(this.nextSectionSelector);
    target?.scrollIntoView({ behavior: 'smooth' });
  }
}
