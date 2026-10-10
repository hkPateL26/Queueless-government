'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Database, CheckCircle2 } from 'lucide-react';
import { FirebaseSyncModal } from './FirebaseSyncModal';
import { getFirebaseSyncStatus, seedAllGovSchemesToFirebase } from '@/lib/firebase-service';

interface FirebaseBadgeProps {
  className?: string;
  lang?: string;
  autoSeedOnce?: boolean;
}

export function FirebaseBadge({ className = '', lang = 'gu', autoSeedOnce = true }: FirebaseBadgeProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [status, setStatus] = useState(getFirebaseSyncStatus());

  useEffect(() => {
    setStatus(getFirebaseSyncStatus());

    // Auto-seed schemes once in background if not already seeded
    if (autoSeedOnce && typeof window !== 'undefined') {
      const alreadySeeded = localStorage.getItem('qless_firebase_schemes_auto_seeded');
      if (!alreadySeeded) {
        seedAllGovSchemesToFirebase().then((res) => {
          if (res.success) {
            localStorage.setItem('qless_firebase_schemes_auto_seeded', 'true');
          }
        }).catch(() => {});
      }
    }
  }, [autoSeedOnce]);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border transition active:scale-95 cursor-pointer shadow-xs ${
          status.isConnected 
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400' 
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
        } ${className}`}
        title="Firebase Real-Time Cloud Database Status & Schema Sync"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
        <span className="tracking-tight">
          {lang === 'gu' ? 'Firebase ડેટાબેઝ' : lang === 'hi' ? 'Firebase डेटाबेस' : 'Firebase Cloud'}
        </span>
        <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 font-bold">
          45 Schemes
        </span>
      </button>

      <FirebaseSyncModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        lang={lang} 
      />
    </>
  );
}
