import React, { useState } from 'react';
import { Film, Play, Download, X, Monitor, Smartphone, CheckCircle2 } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'web' | 'mobile'>('web');
  const isKo = lang === 'ko';

  if (!isOpen) return null;

  const currentVideoSrc =
    activeTab === 'web'
      ? '/SafeStack_Web_Command_Center_Demo.mp4'
      : '/SafeStack_Mobile_Patrol_Demo.mp4';

  const currentFilename =
    activeTab === 'web'
      ? 'SafeStack_Web_Command_Center_Demo.mp4'
      : 'SafeStack_Mobile_Patrol_Demo.mp4';

  const handleDownload = async () => {
    try {
      const res = await fetch(currentVideoSrc);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.open(currentVideoSrc, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {isKo ? 'SafeStack 공식 데모 시연 영상' : 'SafeStack Official Demo Videos'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Full HD 1080p
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isKo
                  ? '심사 및 공모전 규격에 맞춰 제작된 웹 관제 및 모바일 순찰 영상 2종입니다.'
                  : 'Official demo videos formatted for review and competition guidelines.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'web'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{isKo ? '1. 웹 관제 센터 데모 (3분 규격)' : '1. Web Command Demo'}</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'mobile'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isKo ? '2. 모바일 현장 순찰 데모 (2.5분 규격)' : '2. Mobile Patrol Demo'}</span>
          </button>
        </div>

        {/* 메인 영상 플레이어 및 설명 */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* HTML5 비디오 플레이어 */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl relative flex items-center justify-center">
            <video
              key={activeTab}
              controls
              autoPlay
              className="w-full h-full object-contain"
              src={currentVideoSrc}
            >
              브라우저가 동영상 재생을 지원하지 않습니다.
            </video>
          </div>

          {/* 비디오 상세 정보 & 다운로드 바 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>
                  {activeTab === 'web'
                    ? isKo
                      ? '웹 종합 관제 센터: KMA 실시간 기상 & 3D CFD & What-If 시뮬레이션'
                      : 'Desktop Command Center: KMA Live Weather, 3D CFD & What-If Simulation'
                    : isKo
                      ? '모바일 현장 순찰: 1손 카드, 0.2초 카메라 QR 스캔 & Gemini AI 비서'
                      : 'Mobile Field Patrol: 1-Handed Cards, 0.2s QR Scan & Gemini AI Assistant'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'web'
                  ? isKo
                    ? '해상도: 1920x1080 Full HD · 코덱: H.264/AAC · 주요 내용: 기상청 API, 5대 물리 위험 모드, 래칫 벨트 조치 전후'
                    : '1920x1080 Full HD · H.264 / AAC Audio · Covers KMA API, 5 failure modes, What-If simulation.'
                  : isKo
                    ? '해상도: 1920x1080 Full HD · 코덱: H.264/AAC · 주요 내용: jsQR 실시간 스캔, Gemini 3.8 Flash 대화, 1초 토글'
                    : '1920x1080 Full HD · H.264 / AAC Audio · Covers jsQR camera stream, Gemini AI, instant toggle.'}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-2 text-xs border border-slate-700 shadow shrink-0 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isKo ? 'MP4 파일 저장' : 'Save MP4'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
