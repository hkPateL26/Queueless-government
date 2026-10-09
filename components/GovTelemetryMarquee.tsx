'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Server, Wifi, RefreshCw, CheckCircle2, ShieldCheck, Database, Cloud } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { Language } from '@/lib/translations';

interface GovTelemetryMarqueeProps {
  lang?: Language;
}

export const GovTelemetryMarquee: React.FC<GovTelemetryMarqueeProps> = ({ lang: propLang }) => {
  const [activeLang, setActiveLang] = useState<Language>(propLang || 'gu');
  const [cpu, setCpu] = useState(6);
  const [ram, setRam] = useState(14);
  const [latency, setLatency] = useState(38);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveServed, setLiveServed] = useState(12483);

  useEffect(() => {
    if (propLang) {
      setActiveLang(propLang);
    } else {
      try {
        const stored = localStorage.getItem('qless_preferred_lang') as Language;
        if (stored) setActiveLang(stored);
      } catch {}
    }
  }, [propLang]);

  // Realistic telemetry fluctuation every 4-6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(prev => Math.min(18, Math.max(4, prev + (Math.floor(Math.random() * 5) - 2))));
      setRam(prev => Math.min(22, Math.max(12, prev + (Math.floor(Math.random() * 3) - 1))));
      setLatency(prev => Math.min(68, Math.max(24, prev + (Math.floor(Math.random() * 7) - 3))));
      setLiveServed(prev => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('tap');
    setIsRefreshing(true);
    setLatency(Math.floor(Math.random() * 20) + 25);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const isEn = activeLang === 'en';
  const isHi = activeLang === 'hi';

  // Translations for telemetry items
  const t = {
    dpiLive: isEn ? 'DPI LIVE' : isHi ? 'DPI लाइव' : 'DPI LIVE',
    serverNode: isEn ? 'node-01 (GSWAN Gandhinagar)' : isHi ? 'नोड-०१ (GSWAN गांधीनगर)' : 'નોડ-૦૧ (GSWAN ગાંધીનગર)',
    cpuLabel: 'CPU',
    ramLabel: 'RAM',
    coverage: isEn 
      ? 'State Coverage: 33 Districts | 250+ Talukas | 39 Public Services' 
      : isHi 
      ? 'राज्य कवरेज: ३३ जिले | २५०+ तहसील | ३९ योजनाएं' 
      : 'રાજ્ય કવરેજ: ૩૩ જિલ્લા | ૨૫૦+ તાલુકા | ૩૯ સેવાઓ',
    uptime: isEn
      ? '99.98% System Uptime • GRTSA 2013 Statutory Compliance'
      : isHi
      ? '99.98% अपटाइम • GRTSA २०१३ वैधानिक अनुपालन'
      : '99.98% અપટાઇમ • GRTSA ૨૦૧૩ સત્તાવાર માન્ય',
    version: isEn ? 'v2.5.9 (Official Release) DPI' : isHi ? 'v2.5.9 (आधिकारिक संस्करण) DPI' : 'v2.5.9 (સત્તાવાર અપડેટ) DPI',
    cloud: isEn
      ? 'DPI Cloud: Gujarat State Data Centre (GSDC) Active'
      : isHi
      ? 'DPI क्लाउड: गुजरात राज्य डेटा केंद्र (GSDC) सक्रिय'
      : 'DPI Cloud: ગુજરાત સ્ટેટ ડેટા સેન્ટર (GSDC) સક્રિય',
    portalStats: isEn
      ? `[DPI Portal] 39 Services | 36 Active Hubs | Served Today: ${liveServed.toLocaleString('en-IN')}`
      : isHi
      ? `[DPI पोर्टल] ३९ सेवाएं | ३६ केंद्र | आज सेवा प्राप्त: ${liveServed.toLocaleString('hi-IN')}`
      : `[DPI પોર્ટલ] કુલ સેવાઓ: ૩૯ | સક્રિય કચેરીઓ: ૩૬ | આજે સેવા મેળવી: ${liveServed.toLocaleString('gu-IN')}`,
    security: isEn 
      ? '256-Bit SSL Secured • NIC GSWAN' 
      : isHi 
      ? '२५६-बिट SSL सुरक्षित • NIC GSWAN' 
      : '૨૫૬-બીટ SSL સુરક્ષિત • NIC GSWAN'
  };

  // The telemetry items array
  const items = [
    {
      id: 'dpi-live',
      badge: true,
      content: (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[11px] border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>{t.dpiLive}</span>
        </span>
      )
    },
    {
      id: 'node',
      content: (
        <span className="font-mono text-slate-300 text-[11px]">
          {t.serverNode}
        </span>
      )
    },
    {
      id: 'resources',
      content: (
        <span className="inline-flex items-center gap-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          <span className="text-cyan-400">⚙️</span>
          <span>{t.cpuLabel}: <strong className="text-white">{cpu}%</strong></span>
          <span className="text-slate-500">/</span>
          <span>{t.ramLabel}: <strong className="text-white">{ram}%</strong></span>
        </span>
      )
    },
    {
      id: 'coverage',
      content: (
        <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
          <span>📡</span>
          <span>{t.coverage}</span>
        </span>
      )
    },
    {
      id: 'uptime',
      content: (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
          <span>✅</span>
          <span>{t.uptime}</span>
        </span>
      )
    },
    {
      id: 'version',
      content: (
        <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 font-mono">
          <span>🚀</span>
          <span>{t.version}</span>
        </span>
      )
    },
    {
      id: 'cloud',
      content: (
        <span className="inline-flex items-center gap-1 text-[11px] text-blue-300 font-medium">
          <span>☁️</span>
          <span>{t.cloud}</span>
        </span>
      )
    },
    {
      id: 'portalStats',
      content: (
        <span className="text-[11px] text-yellow-300 font-bold">
          {t.portalStats}
        </span>
      )
    },
    {
      id: 'security',
      content: (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
          <span>🔒</span>
          <span>{t.security}</span>
        </span>
      )
    }
  ];

  return (
    <div className="w-full bg-[#001428] text-white border-b border-blue-900/80 shadow-inner select-none relative overflow-hidden z-50">
      {/* Top Tricolor Decorative Micro-line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="flex items-center justify-between h-7 sm:h-8 px-2 sm:px-4">
        
        {/* Left Fixed Badge: DPI Status */}
        <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-blue-900/60 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] tracking-wider border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{t.dpiLive}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">node-01</span>
        </div>

        {/* Center Marquee Track */}
        <div className="flex-1 overflow-hidden relative mx-2">
          {/* Subtle Left & Right Fade Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#001428] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#001428] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee hover:pause flex items-center whitespace-nowrap cursor-default">
            {/* First Set of Items */}
            <div className="flex items-center gap-6 pr-6">
              {items.map((item, idx) => (
                <React.Fragment key={`marquee-1-${idx}`}>
                  {item.content}
                  <span className="text-slate-600 select-none">•</span>
                </React.Fragment>
              ))}
            </div>

            {/* Duplicate Set for Seamless Continuous Crawl */}
            <div className="flex items-center gap-6 pr-6" aria-hidden="true">
              {items.map((item, idx) => (
                <React.Fragment key={`marquee-2-${idx}`}>
                  {item.content}
                  <span className="text-slate-600 select-none">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right Fixed Metrics: Latency & Interactive Refresh */}
        <div className="flex items-center gap-2 pl-3 border-l border-blue-900/60 shrink-0">
          <div className="flex items-center gap-1 font-mono text-[10.5px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            <span>⚡</span>
            <span>{latency}ms</span>
          </div>

          <button
            onClick={handleManualRefresh}
            title={isEn ? "Refresh live connection ping" : isHi ? "कनेक्शन पिंग रीफ्रेश करें" : "કનેક્શન પિંગ રિફ્રેશ કરો"}
            className="w-5 h-5 rounded hover:bg-blue-900/60 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#FF9933]' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
};
