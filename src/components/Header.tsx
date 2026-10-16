import React from 'react';
import {
  ShieldAlert,
  Wind,
  Camera,
  Database,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { Site } from '../types';
import { Language, translations } from '../services/i18n';

interface HeaderProps {
  site: Site;
  lang: Language;
  onToggleLang: () => void;
  isMobileView: boolean;
  setIsMobileView: (val: boolean) => void;
  onOpenAiIntake: () => void;
  onOpenMaterialManager: () => void;
  onOpenRegionSelector: () => void;
  currentRegionName: string;
  onResetData: () => void;
  lastUpdated: string;
  isLiveKma: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  site,
  lang,
  onToggleLang,
  isMobileView,
  setIsMobileView,
  onOpenAiIntake,
  onOpenMaterialManager,
  onOpenRegionSelector,
  currentRegionName,
  onResetData,
  lastUpdated,
  isLiveKma,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Site Info */}
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 border border-amber-500/40 p-2 rounded-lg flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  SafeStack <span className="text-amber-400 text-sm font-semibold">Weather Guard</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {t.siteHeaderTag}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-2 truncate">
                <button
                  onClick={onOpenRegionSelector}
                  className="font-medium text-amber-300 hover:text-amber-200 underline decoration-amber-500/60 flex items-center gap-1 transition-colors truncate"
                  title="GPS 현위치 또는 타 지역 건설현장 전환"
                >
                  <span className="truncate">{currentRegionName || site.name}</span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300 shrink-0">
                    {lang === 'ko' ? '지역/GPS 변경' : 'Change Site/GPS'}
                  </span>
                </button>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:inline whitespace-nowrap">
                  {t.buildingHeight} {site.building_height_m}m
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 언어 전환 버튼 (KO / EN) */}
            <button
              onClick={onToggleLang}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
              title="언어 전환 (Language Switch: KO / EN)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ko' ? 'EN' : '한국어'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
              <button
                onClick={() => setIsMobileView(false)}
                title="PC 종합 관제 모드"
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  !isMobileView
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.pcView}</span>
              </button>
              <button
                onClick={() => setIsMobileView(true)}
                title="모바일 현장 순찰 모드"
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isMobileView
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.mobileView}</span>
              </button>
            </div>

            {/* AI Intake Button */}
            <button
              onClick={onOpenAiIntake}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t.aiIntakeBtn}</span>
            </button>

            {/* Material DB Button */}
            <button
              onClick={onOpenMaterialManager}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>{t.materialDbBtn}</span>
            </button>

            {/* Reset / Reload Button */}
            <button
              onClick={onResetData}
              title={t.resetTooltip}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub Header Notice Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {isLiveKma
              ? lang === 'ko'
                ? '기상청 API 실시간 연동 정상 (VilageFcstInfoService_2.0)'
                : 'KMA API Live Connected (VilageFcstInfoService_2.0)'
              : t.stationConnecting}
          </span>
          <span className="text-slate-600">·</span>
          <span>
            {t.lastUpdated}: {lastUpdated}
          </span>
        </div>
        <div className="text-amber-400 font-medium flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.windAdvisoryNotice}</span>
        </div>
      </div>
    </header>
  );
};

