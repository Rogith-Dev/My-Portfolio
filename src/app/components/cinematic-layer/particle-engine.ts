/**
 * particle-engine.ts
 * ---------------------------------------------------------------------------
 * Framework-agnostic Three.js engine that renders a slow, dreamy field of
 * warm-orange / white bokeh particles with additive blending and a subtle
 * mouse-parallax camera. Kept separate from the Angular component so the
 * render loop / dispose logic is easy to unit-test and re-use.
 * ---------------------------------------------------------------------------
 */
import * as THREE from 'three';

export interface ParticleEngineOptions {
  /** Lower particle count on small / low-power screens. */
  particleCount?: number;
  /** Disable mouse parallax (e.g. touch devices). */
  enableParallax?: boolean;
}

export class ParticleEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private points!: THREE.Points;
  private basePositions!: Float32Array;
  private phases!: Float32Array;
  private speeds!: Float32Array;
  private clock = new THREE.Clock();

  private mouse = { x: 0, y: 0 };
  private cameraOffset = { x: 0, y: 0 };

  private paused = false;
  private disposed = false;
  private rafId = 0;

  private readonly onResize = () => this.handleResize();
  private readonly onPointerMove = (e: PointerEvent) => this.handlePointerMove(e);

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: ParticleEngineOptions = {}
  ) {
    this.buildScene();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  // ---------------------------------------------------------------- public
  setPaused(value: boolean): void {
    this.paused = value;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);

    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).map?.dispose();
    (this.points.material as THREE.PointsMaterial).dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // --------------------------------------------------------------- private
  private buildScene(): void {
    const { clientWidth: w, clientHeight: h } = this.canvas.parentElement ?? {
      clientWidth: window.innerWidth,
      clientHeight: window.innerHeight,
    };

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(w, h);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.z = 12;

    const count = this.options.particleCount ?? (window.innerWidth < 720 ? 90 : 190);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    this.phases = new Float32Array(count);
    this.speeds = new Float32Array(count);

    const warm = new THREE.Color('#ffb066');
    const soft = new THREE.Color('#fff3e0');
    const blue = new THREE.Color('#6fd8ff');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26;
      positions[i3 + 1] = (Math.random() - 0.5) * 16;
      positions[i3 + 2] = (Math.random() - 0.5) * 14;

      const mix = Math.random();
      const color =
        mix < 0.62
          ? warm.clone().lerp(soft, Math.random() * 0.6)
          : mix < 0.85
          ? soft.clone()
          : blue.clone().lerp(soft, 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2.2 + 0.4;
      this.phases[i] = Math.random() * Math.PI * 2;
      this.speeds[i] = 0.15 + Math.random() * 0.35;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.basePositions = positions.slice();

    const material = new THREE.PointsMaterial({
      size: 0.62,
      map: this.makeBokehSprite(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  /** Soft radial-gradient sprite so each point renders as a blurred bokeh disc. */
  private makeBokehSprite(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    if (this.options.enableParallax !== false) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    }
  }

  private handleResize(): void {
    const { clientWidth: w, clientHeight: h } = this.canvas.parentElement ?? {
      clientWidth: window.innerWidth,
      clientHeight: window.innerHeight,
    };
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private handlePointerMove(e: PointerEvent): void {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }

  private loop(): void {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.loop);
    if (this.paused) return;

    const t = this.clock.getElapsedTime();
    const positionAttr = this.points.geometry.attributes['position'] as THREE.BufferAttribute;
    const pos = positionAttr.array as Float32Array;

    for (let i = 0; i < this.phases.length; i++) {
      const i3 = i * 3;
      const speed = this.speeds[i];
      const phase = this.phases[i];
      pos[i3] = this.basePositions[i3] + Math.sin(t * speed + phase) * 0.9;
      pos[i3 + 1] =
        this.basePositions[i3 + 1] + Math.sin(t * speed * 0.7 + phase * 1.3) * 0.6 + ((t * speed * 0.05) % 4);
      pos[i3 + 2] = this.basePositions[i3 + 2] + Math.cos(t * speed * 0.5 + phase) * 0.7;
    }
    positionAttr.needsUpdate = true;

    // Slow-follow mouse parallax on the camera — never snaps.
    this.cameraOffset.x += (this.mouse.y * 0.18 - this.cameraOffset.x) * 0.03;
    this.cameraOffset.y += (this.mouse.x * 0.22 - this.cameraOffset.y) * 0.03;
    this.camera.position.x = this.cameraOffset.y * 2;
    this.camera.position.y = -this.cameraOffset.x * 1.4;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
