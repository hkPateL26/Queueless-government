'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck } from 'lucide-react';

interface AuthenticQrCodeProps {
  payload: string;
  tokenId: string;
  size?: number;
  label?: string;
  subLabel?: string;
}

export function AuthenticQrCode({
  payload,
  tokenId,
  size = 190,
  label = 'સત્તાવાર સુરક્ષિત QR ટોકન',
  subLabel = 'પ્રવેશદ્વારે કે કાઉન્ટર પર સ્કેન કરો'
}: AuthenticQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(payload, {
      width: size * 2,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#003366',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [payload, size]);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border-2 border-[#003366]/20 shadow-sm relative group">
      {/* Top Security Header */}
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#003366] mb-2 uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
        <span>{label}</span>
      </div>

      {/* QR Code Container */}
      <div 
        className="relative bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`Official QR Code for Token ${tokenId}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono animate-pulse">
            QR કોડ જનરેટ થાય છે...
          </div>
        )}
      </div>

      {/* Token ID and Verification Text */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
          <span className="font-mono font-black text-xs text-[#003366]">
            {tokenId}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">• QL-GUJ</span>
        </div>
        <p className="text-[10.5px] font-medium text-slate-500 mt-1">
          {subLabel}
        </p>
      </div>
    </div>
  );
}
