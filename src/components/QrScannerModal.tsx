import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Location, Material, Stock } from '../types';
import { Language, translations, getLocalizedLocationName, getLocalizedMaterialName, getLocalizedFloor } from '../services/i18n';
import {
  Camera,
  X,
  QrCode,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Box,
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  materials: Record<string, Material>;
  stocks: Record<string, Stock>;
  lang: Language;
  onSelectScannedLocation: (location: Location) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  locations,
  materials,
  stocks,
  lang,
  onSelectScannedLocation,
}) => {
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedResult, setScannedResult] = useState<{ loc: Location; text: string } | null>(null);

  // 사운드 피드백
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const handleMatchedCode = useCallback((codeText: string) => {
    // 텍스트에서 location ID 파싱
    // 가능한 패턴: "loc-roof-01", "SAFESTACK:loc-roof-01", JSON {"id":"loc-roof-01"}, 등
    let matchedId = '';
    const cleanText = codeText.trim();

    for (const loc of locations) {
      if (
        cleanText === loc.id ||
        cleanText.includes(loc.id) ||
        cleanText.toLowerCase().includes(loc.name.toLowerCase()) ||
        cleanText.toLowerCase().includes(loc.floor.toLowerCase())
      ) {
        matchedId = loc.id;
        break;
      }
    }

    // 만약 직접 ID 매칭 실패 시 JSON 파싱 시도
    if (!matchedId) {
      try {
        const parsed = JSON.parse(cleanText);
        if (parsed.id || parsed.locationId) {
          const targetId = parsed.id || parsed.locationId;
          const found = locations.find((l) => l.id === targetId);
          if (found) matchedId = found.id;
        }
      } catch {
        // Not JSON
      }
    }

    if (matchedId) {
      const foundLoc = locations.find((l) => l.id === matchedId);
      if (foundLoc) {
        playBeep();
        setScannedResult({ loc: foundLoc, text: cleanText });
        setTimeout(() => {
          onSelectScannedLocation(foundLoc);
          onClose();
        }, 800);
        return true;
      }
    }
    return false;
  }, [locations, onSelectScannedLocation, onClose]);

  // 카메라 스트림 시작
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setScannedResult(null);
      return;
    }

    let currentStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Camera initiation failed:', err);
          setHasCamera(false);
          setCameraError(t.qrCameraError);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, t.qrCameraError]);

  // 실시간 QR 코드 디코딩 루프
  useEffect(() => {
    if (!isOpen || !hasCamera) return;

    let active = true;

    const scanFrame = () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !scannedResult) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              const matched = handleMatchedCode(code.data);
              if (matched) {
                return; // 성공 시 루프 중단
              }
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, hasCamera, scannedResult, handleMatchedCode]);

  // 플래시/토치 토글
  const toggleTorch = async () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && 'applyConstraints' in videoTrack) {
      try {
        const nextState = !torchOn;
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch not supported on this device', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* 모달 상단 헤더 */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{t.qrScanModalTitle}</h3>
              <p className="text-[11px] text-slate-400">{t.qrScanInstructions}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 카메라 뷰파인더 영역 */}
        <div className="relative bg-black aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
          {hasCamera !== false ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* 뷰파인더 오버레이 가이드박스 */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* 코너 포인트 가이드 */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* 레이저 스캔 애니메이션 바 */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* 플래시 토치 버튼 (카메라 작동 시) */}
              <button
                onClick={toggleTorch}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-amber-400 hover:bg-slate-800 transition-colors z-10"
                title="Toggle Torch"
              >
                {torchOn ? <Zap className="w-4 h-4 fill-amber-400" /> : <ZapOff className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 max-w-xs space-y-2">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-medium">
                {lang === 'ko' ? '카메라를 직접 사용할 수 없는 환경입니다' : 'Camera not accessible in this environment'}
              </div>
              <div className="text-[11px] text-slate-500">
                {lang === 'ko'
                  ? '아래 등록된 적재구역 명판 태그를 터치하면 현장 QR 스캔과 동일하게 즉시 제원을 조회합니다.'
                  : 'Tap any yard tag below to simulate immediate QR recognition.'}
              </div>
            </div>
          )}

          {/* 스캔 성공 팝업 오버레이 */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
              <div className="text-base font-bold text-white mb-1">
                {t.qrTagScanned}
              </div>
              <div className="text-xs font-mono text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/40">
                {getLocalizedLocationName(scannedResult.loc.id, scannedResult.loc.name, lang)}
              </div>
            </div>
          )}
        </div>

        {/* 하단: 현장 구역 태그 원터치 인식 시뮬레이션 (현장 안전관리자 직관 버튼) */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex-1 overflow-y-auto space-y-2">
          <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.qrSimulateTagTitle}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {locations.length} {lang === 'ko' ? '개 태그' : 'Tags'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {locations.map((loc) => {
              const stock = stocks[loc.id];
              const mat = stock ? materials[stock.material_id] : null;
              const locName = getLocalizedLocationName(loc.id, loc.name, lang);
              const flName = getLocalizedFloor(loc.id, loc.floor, lang);
              const matName = mat ? getLocalizedMaterialName(mat.id, mat.name, lang) : '';

              return (
                <button
                  key={loc.id}
                  onClick={() => handleMatchedCode(loc.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 text-left transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold">
                        {flName}
                      </span>
                      <span>QR: {loc.id}</span>
                    </div>
                    <div className="font-bold text-slate-200 truncate group-hover:text-amber-300 text-xs">
                      {locName}
                    </div>
                    {matName && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        📦 {matName} ({stock?.count || 0})
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <QrCode className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {t.closeScanner}
          </button>
        </div>
      </div>
    </div>
  );
};
