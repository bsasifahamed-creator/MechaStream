/**
 * Performance governor for environment rendering
 * Automatically disables environments during high-activity periods
 */

export interface ActivityState {
  monacoFocused: boolean;
  terminalActive: boolean;
  grapesjsMounted: boolean;
  fpsLow: boolean;
}

export interface PerformanceGovernor {
  isEnabled: boolean;
  activityState: ActivityState;
  onChange: (listener: (enabled: boolean) => void) => void;
  offChange: (listener: (enabled: boolean) => void) => void;
  destroy: () => void;
}

class PerformanceGovernorImpl implements PerformanceGovernor {
  public isEnabled = true;
  public activityState: ActivityState = {
    monacoFocused: false,
    terminalActive: false,
    grapesjsMounted: false,
    fpsLow: false
  };

  private listeners = new Set<(enabled: boolean) => void>();
  private fpsMonitor: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    // Monitor Monaco focus
    this.monitorMonacoFocus();

    // Monitor terminal activity
    this.monitorTerminalActivity();

    // Monitor GrapesJS mounting
    this.monitorGrapesJSMounting();

    // Monitor FPS
    this.startFPSMonitoring();

    // Monitor motion preference changes
    this.monitorMotionPreference();
  }

  private monitorMonacoFocus(): void {
    const checkMonacoFocus = () => {
      const monacoFocused = document.activeElement?.closest('.monaco-editor') !== null;
      this.updateActivity('monacoFocused', monacoFocused);
    };

    document.addEventListener('focusin', checkMonacoFocus);
    document.addEventListener('focusout', checkMonacoFocus);
    document.addEventListener('click', checkMonacoFocus);
  }

  private monitorTerminalActivity(): void {
    const checkTerminalActivity = () => {
      const terminalActive = document.activeElement?.closest('[data-terminal]') !== null ||
                           document.querySelector('[data-terminal-active]') !== null;
      this.updateActivity('terminalActive', terminalActive);
    };

    document.addEventListener('focusin', checkTerminalActivity);
    document.addEventListener('click', checkTerminalActivity);

    // Also check for terminal output updates
    const observer = new MutationObserver(() => {
      const hasRecentOutput = document.querySelector('[data-terminal-output] .terminal-line:last-child');
      if (hasRecentOutput) {
        this.updateActivity('terminalActive', true);
        setTimeout(() => this.updateActivity('terminalActive', false), 1000);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private monitorGrapesJSMounting(): void {
    const checkGrapesJS = () => {
      const grapesjsMounted = document.querySelector('#gjs-canvas-container, .gjs-editor') !== null;
      this.updateActivity('grapesjsMounted', grapesjsMounted);
    };

    // Check periodically for GrapesJS mounting
    setInterval(checkGrapesJS, 1000);
  }

  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp;
        this.fpsMonitor = requestAnimationFrame(measureFPS);
        return;
      }

      const delta = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      this.frameCount++;

      if (this.frameCount % 60 === 0) { // Check every ~1 second
        const fps = 1000 / (delta / 60);
        this.fpsHistory.push(fps);

        if (this.fpsHistory.length > 5) {
          this.fpsHistory.shift();
        }

        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        const fpsLow = avgFPS < 30; // Consider < 30 FPS as low performance

        this.updateActivity('fpsLow', fpsLow);
        this.frameCount = 0;
      }

      this.fpsMonitor = requestAnimationFrame(measureFPS);
    };

    this.fpsMonitor = requestAnimationFrame(measureFPS);
  }

  private monitorMotionPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        this.disable();
      } else {
        this.enable();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initial check
    if (mediaQuery.matches) {
      this.disable();
    }
  }

  private updateActivity(key: keyof ActivityState, value: boolean): void {
    if (this.activityState[key] === value) return;

    this.activityState[key] = value;
    this.recalculateEnabled();
  }

  private recalculateEnabled(): void {
    const shouldDisable = this.activityState.monacoFocused ||
                         this.activityState.terminalActive ||
                         this.activityState.grapesjsMounted ||
                         this.activityState.fpsLow;

    if (shouldDisable && this.isEnabled) {
      this.disable();
    } else if (!shouldDisable && !this.isEnabled) {
      this.enable();
    }
  }

  private disable(): void {
    this.isEnabled = false;
    this.listeners.forEach(listener => listener(false));
  }

  private enable(): void {
    this.isEnabled = true;
    this.listeners.forEach(listener => listener(true));
  }

  public onChange(listener: (enabled: boolean) => void): void {
    this.listeners.add(listener);
  }

  public offChange(listener: (enabled: boolean) => void): void {
    this.listeners.delete(listener);
  }

  public destroy(): void {
    if (this.fpsMonitor) {
      cancelAnimationFrame(this.fpsMonitor);
    }
    this.listeners.clear();
  }
}

export const performanceGovernor = new PerformanceGovernorImpl();
