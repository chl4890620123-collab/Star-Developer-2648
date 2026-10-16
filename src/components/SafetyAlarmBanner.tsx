import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  AlertOctagon,
  Volume2,
  VolumeX,
  History,
  X,
  ShieldAlert,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { notificationService, AlarmLog } from '../services/notificationService';
import { Language } from '../services/i18n';

interface SafetyAlarmBannerProps {
  isAlarmActive: boolean;
  alarmReason: string;
  dangerCount: number;
  currentWindSpeed: number;
  currentGustSpeed: number;
  windThreshold: number;
  lang: Language;
  onDismiss: () => void;
  onTestNotification: () => void;
}

export const SafetyAlarmBanner: React.FC<SafetyAlarmBannerProps> = ({
  isAlarmActive,
  alarmReason,
  dangerCount,
  currentWindSpeed,
  currentGustSpeed,
  windThreshold,
  lang,
  onDismiss,
  onTestNotification,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [soundEnabled, setSoundEnabled] = useState(notificationService.isSoundEnabled());
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState<AlarmLog[]>([]);

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      notificationService.triggerAlarm(
        lang === 'ko' ? 'SafeStack 안전 경보 알림 연동 완료' : 'SafeStack Browser Alerts Linked',
        lang === 'ko'
          ? 'DANGER 위험 구역 3개소 이상 또는 강풍 초과 시 브라우저 알림이 즉시 수신됩니다.'
          : 'Browser alerts will trigger when ≥3 DANGER zones appear or wind exceeds threshold.',
        lang === 'ko' ? '권한 승인 완료' : 'Permission Granted',
        true
      );
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    notificationService.setSoundEnabled(next);
  };

  const openLogs = () => {
    setLogs(notificationService.getLogs());
    setShowLogsModal(true);
  };

  return (
    <>
      {/* 1. 상단 글로벌 안전 경보 제어 바 */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-200">
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ko' ? '자동 안전 경보 시스템:' : 'Automated Safety Alarm:'}</span>
          </div>
          <span className="text-slate-400">
            {lang === 'ko'
              ? `(발동 조건: DANGER 3개소 이상 또는 풍속 ≥ ${windThreshold}m/s)`
              : `(Trigger: ≥3 DANGER zones or Wind ≥ ${windThreshold}m/s)`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 브라우저 알림 권한 상태 버튼 */}
          {permission === 'granted' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3" />
              {lang === 'ko' ? '브라우저 알림 연동됨' : 'Browser Alerts Linked'}
            </span>
          ) : permission === 'denied' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <BellOff className="w-3 h-3" />
              {lang === 'ko' ? '브라우저 알림 차단됨' : 'Browser Alerts Blocked'}
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-colors animate-pulse"
            >
              <BellRing className="w-3 h-3" />
              {lang === 'ko' ? '브라우저 알림 권한 허용' : 'Enable Browser Alerts'}
            </button>
          )}

          {/* 사운드 경보 토글 */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? (lang === 'ko' ? '경보음 켜짐' : 'Alarm Sound On') : (lang === 'ko' ? '경보음 음소거' : 'Alarm Muted')}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* 테스트 발송 버튼 */}
          <button
            onClick={onTestNotification}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] border border-slate-700"
          >
            {lang === 'ko' ? '경보 시험 발송' : 'Test Alarm'}
          </button>

          {/* 알림 이력 버튼 */}
          <button
            onClick={openLogs}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
            title={lang === 'ko' ? '경보 발송 이력' : 'Alarm Logs'}
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. DANGER 임계치 초과 시 활성화되는 긴급 비상 사이렌 배너 */}
      {isAlarmActive && (
        <div className="bg-rose-600 text-white px-4 py-3 shadow-xl border-b-2 border-rose-800 animate-pulse transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <AlertOctagon className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>
                    {lang === 'ko' ? '🚨 [긴급 공사안전 비상경보 발령]' : '🚨 [CRITICAL SITE SAFETY ALARM TRIGGERED]'}
                  </span>
                  <span className="text-xs bg-black/30 px-2 py-0.5 rounded font-mono font-bold">
                    {lang === 'ko' ? '현장 비상 조치 요망' : 'Action Required'}
                  </span>
                </div>
                <div className="text-xs text-rose-100 mt-0.5 font-medium">
                  <strong>{lang === 'ko' ? '발령 사유' : 'Reason'}:</strong> {alarmReason}.{' '}
                  <span className="opacity-90">
                    {lang === 'ko'
                      ? '권고사항: 타워크레인 양중 작업 중지 및 옥상·외곽 슬래브 래칫 밴딩 전원 투입'
                      : 'Recommendation: Halt crane lifts and deploy tie-down crews to rooftop and slab edges immediately.'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="px-3 py-1 bg-black/30 hover:bg-black/50 text-white rounded text-xs font-semibold shrink-0 transition-colors border border-white/20"
            >
              {lang === 'ko' ? '경보 닫기' : 'Dismiss Alert'}
            </button>
          </div>
        </div>
      )}

      {/* 알림 이력 모달 */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-4 text-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <History className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ko' ? '안전 경보 발령 이력 로그' : 'Safety Alarm Event History'}</span>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-500 py-6 text-center">
                  {lang === 'ko' ? '기록된 경보 내역이 없습니다.' : 'No alarm events recorded.'}
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-rose-300">{log.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{log.body}</div>
                      <div className="text-[10px] text-amber-400/80 mt-1 font-mono">
                        {lang === 'ko' ? '사유' : 'Reason'}: {log.triggerReason}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
