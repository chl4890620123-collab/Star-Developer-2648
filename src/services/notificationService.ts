/**
 * 안전 경보 시스템 - 브라우저 Notification API 및 Web Audio 알림 서비스
 * 지침서 및 사용자 요구사항: DANGER 3개소 이상 또는 풍속 기준치 초과 시 발송
 */

export interface AlarmLog {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  severity: 'CRITICAL' | 'WARNING';
  triggerReason: string;
}

class SafetyNotificationService {
  private lastAlertTimestamp: number = 0;
  private readonly ALERT_COOLDOWN_MS = 15000; // 15초 쿨다운으로 알림 폭풍 방지
  private logs: AlarmLog[] = [];
  private soundEnabled: boolean = true;

  public isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isNotificationSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return 'denied';
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * 브라우저 내장 Web Audio API를 활용한 긴급 경보 비프 사운드
   */
  public playAlarmSound() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 경보 펄스 비프 (880Hz -> 440Hz 사이렌 느낌)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (err) {
      // Audio autoplay policy might restrict without user interaction
      console.warn('Web Audio error:', err);
    }
  }

  /**
   * 안전 경보 알림 발송 (브라우저 시스템 알림 + 사운드 + 인앱 로깅)
   */
  public triggerAlarm(title: string, body: string, triggerReason: string, force: boolean = false): boolean {
    const now = Date.now();
    if (!force && now - this.lastAlertTimestamp < this.ALERT_COOLDOWN_MS) {
      return false; // 쿨다운 중
    }

    this.lastAlertTimestamp = now;

    // 1. Web Audio 사운드
    this.playAlarmSound();

    // 2. 브라우저 Native Notification API 발송
    if (this.isNotificationSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'safestack-hazard-alert',
        });
      } catch (err) {
        console.warn('Native Notification trigger error:', err);
      }
    }

    // 3. 알림 로그 기록
    const newLog: AlarmLog = {
      id: `alarm-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      title,
      body,
      severity: 'CRITICAL',
      triggerReason,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 20) this.logs.pop();

    return true;
  }

  public getLogs(): AlarmLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const notificationService = new SafetyNotificationService();
