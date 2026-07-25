import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
} from '@angular/core';
import gsap from 'gsap';

declare const THREE: any;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private particles: any;
  private playing = true;
  private muted = true;
  private eventListeners: Array<{ element: any; event: string; handler: any }> = [];

  ngAfterViewInit(): void {
    // Give the DOM a moment to fully render
    setTimeout(() => {
      this.initializeAnimations();
    }, 0);
  }

  private initializeAnimations(): void {
    try {
      // GSAP text animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('#line1 span', { y: '0%', duration: 1.1 }, 0.9)
        .to('#line2 span', { y: '0%', duration: 1.1 }, 1.05)
        .to('.eyebrow', { opacity: 1, duration: 0.7 }, 0.7)
        .to('#subtitleText', { opacity: 1, duration: 0.9 }, 1.5)
        .to('#chips', { opacity: 1, duration: 0.9 }, 1.7);

      // auto-hide sound hint
      gsap.to('#soundHint', { opacity: 1, y: 0, duration: 0.6, delay: 2.3 });
      gsap.to('#soundHint', { 
        opacity: 0, 
        duration: 0.6, 
        delay: 5.5, 
        onComplete: () => { 
          const soundHint = document.getElementById('soundHint');
          if (soundHint) soundHint.style.display = 'none'; 
        } 
      });

      // Scroll indicator
      const scrollIndicator = document.getElementById('scrollIndicator');
      if (scrollIndicator) {
        const handler = () => {
          const nextSection = document.querySelector('.next-section') as HTMLElement;
          if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
        };
        scrollIndicator.addEventListener('click', handler);
        this.eventListeners.push({ element: scrollIndicator, event: 'click', handler });
      }

      // Play/Pause button
      const playPauseBtn = document.getElementById('playPauseBtn');
      const playIcon = document.getElementById('playIcon');
      const pauseIcon = document.getElementById('pauseIcon');
      
      if (playPauseBtn && playIcon && pauseIcon) {
        const playPauseHandler = () => {
          this.playing = !this.playing;
          playIcon.style.display = this.playing ? 'none' : 'block';
          pauseIcon.style.display = this.playing ? 'block' : 'none';
          playPauseBtn.setAttribute('aria-label', this.playing ? 'Pause ambient motion' : 'Resume ambient motion');
          if (this.particles) this.particles.setPaused(!this.playing);
        };
        playPauseBtn.addEventListener('click', playPauseHandler);
        this.eventListeners.push({ element: playPauseBtn, event: 'click', handler: playPauseHandler });
      }

      // Mute button
      const muteBtn = document.getElementById('muteBtn');
      const mutedIcon = document.getElementById('mutedIcon');
      const unmutedIcon = document.getElementById('unmutedIcon');
      
      if (muteBtn && mutedIcon && unmutedIcon) {
        const muteHandler = () => {
          this.muted = !this.muted;
          mutedIcon.style.display = this.muted ? 'block' : 'none';
          unmutedIcon.style.display = this.muted ? 'none' : 'block';
          muteBtn.setAttribute('aria-label', this.muted ? 'Unmute' : 'Mute');
        };
        muteBtn.addEventListener('click', muteHandler);
        this.eventListeners.push({ element: muteBtn, event: 'click', handler: muteHandler });
      }

      // Initialize Three.js particle system
      const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
      if (canvas && (window as any).THREE) {
        this.particles = new CinematicParticles(canvas);
      }
    } catch (error) {
      console.error('Error initializing hero animations:', error);
    }
  }

  ngOnDestroy(): void {
    // Cleanup event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners = [];

    // Cleanup Three.js resources
    if (this.particles) {
      this.particles.dispose();
      this.particles = null;
    }
  }
}

// Helper class for Three.js particle animations
class CinematicParticles {
  private canvas: HTMLCanvasElement;
  private paused = false;
  private mouse = { x: 0, y: 0 };
  private targetRot = { x: 0, y: 0 };
  private clock: any;
  private renderer: any;
  private scene: any;
  private camera: any;
  private points: any;
  private basePositions: Float32Array = new Float32Array();
  private phases: Float32Array = new Float32Array();
  private speeds: Float32Array = new Float32Array();
  private resizeHandler: any;
  private mouseMoveHandler: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this._init();
    this._bindEvents();
    this._animate = this._animate.bind(this);
    this._animate();
  }

  private _init(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(w, h);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.z = 12;

    const COUNT = window.innerWidth < 720 ? 90 : 190;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    this.phases = new Float32Array(COUNT);
    this.speeds = new Float32Array(COUNT);

    const warm = new THREE.Color('#ffb066');
    const soft = new THREE.Color('#fff3e0');
    const blue = new THREE.Color('#6fd8ff');

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26;
      positions[i3 + 1] = (Math.random() - 0.5) * 16;
      positions[i3 + 2] = (Math.random() - 0.5) * 14;

      const mix = Math.random();
      const c = mix < 0.62
        ? warm.clone().lerp(soft, Math.random() * 0.6)
        : mix < 0.85
        ? soft.clone()
        : blue.clone().lerp(soft, 0.3);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      sizes[i] = Math.random() * 2.2 + 0.4;
      this.phases[i] = Math.random() * Math.PI * 2;
      this.speeds[i] = 0.15 + Math.random() * 0.35;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.basePositions = positions.slice();

    const sprite = this._makeSprite();
    const mat = new THREE.PointsMaterial({
      size: 0.62,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);
  }

  private _makeSprite(): any {
    const size = 128;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = size;
    const ctx = cvs.getContext('2d')!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(cvs);
    tex.needsUpdate = true;
    return tex;
  }

  private _bindEvents(): void {
    this.resizeHandler = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
  }

  public setPaused(val: boolean): void {
    this.paused = val;
  }

  private _animate = (): void => {
    requestAnimationFrame(this._animate);
    if (this.paused) return;

    const t = this.clock.getElapsedTime();
    const pos = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.phases.length; i++) {
      const i3 = i * 3;
      const speed = this.speeds[i];
      const phase = this.phases[i];
      pos[i3] = this.basePositions[i3] + Math.sin(t * speed + phase) * 0.9;
      pos[i3 + 1] =
        this.basePositions[i3 + 1] +
        Math.sin(t * speed * 0.7 + phase * 1.3) * 0.6 +
        ((t * speed * 0.05) % 4);
      pos[i3 + 2] = this.basePositions[i3 + 2] + Math.cos(t * speed * 0.5 + phase) * 0.7;
    }
    this.points.geometry.attributes.position.needsUpdate = true;

    // mouse parallax on camera
    this.targetRot.x += (this.mouse.y * 0.18 - this.targetRot.x) * 0.03;
    this.targetRot.y += (this.mouse.x * 0.22 - this.targetRot.y) * 0.03;
    this.camera.position.x = this.targetRot.y * 2;
    this.camera.position.y = -this.targetRot.x * 1.4;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);

    // Dispose Three.js resources
    this.points.geometry.dispose();
    if (this.points.material.map) {
      this.points.material.map.dispose();
    }
    this.points.material.dispose();
    this.renderer.dispose();
  }
}

