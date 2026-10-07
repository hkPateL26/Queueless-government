'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, AlertTriangle, CheckCircle, X, RefreshCw, Volume2, 
  ShieldCheck, ArrowRight, Lock, Cloud, FolderOpen, FileText, FileCheck, 
  FolderPlus, Eye, Calendar, UserCheck, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  validateIncomeCertificateText, 
  validateAadhaarNumber,
  SAMPLE_OCR_TEST_CASES, 
  ValidationResult 
} from '@/lib/ocr-validator';
import { SchemeItem } from '@/lib/schemes-data';
import { GovLogo } from '@/components/GovLogo';

interface CameraScannerModalProps {
  scheme: SchemeItem;
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess: () => void;
  isLoggedIn?: boolean;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  scheme,
  isOpen,
  onClose,
  onVerifiedSuccess,
  isLoggedIn = false,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'drive'>('camera');
  const [scanning, setScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: string; source: string } | null>(null);
  const [manualDateInput, setManualDateInput] = useState<string>('2025-04-22');
  const [showManualDateModal, setShowManualDateModal] = useState<boolean>(false);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeTab === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraStreamActive(true);
          }
        })
        .catch(() => {
          setCameraStreamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleRunOcr = (rawText: string, manualDate?: string) => {
    setScanning(true);
    setValidationResult(null);
    setQualityWarning(null);
    triggerHaptic('tap');

    setTimeout(() => {
      const result = validateIncomeCertificateText(rawText, undefined, manualDate);
      setValidationResult(result);
      setScanning(false);

      if (result.status === 'passed') {
        triggerHaptic('success');
        speakGuidance("દસ્તાવેજ પ્રી-ચેક સફળ રહ્યો છે. વિગતો સબમિશન માટે યોગ્ય જણાય છે.");
      } else if (result.status === 'needs_review') {
        triggerHaptic('warning');
        setQualityWarning("સ્પષ્ટતા સુધારો: દસ્તાવેજનો ફોટો સીધો અને પર્યાપ્ત પ્રકાશમાં પાડો.");
        speakGuidance(result.messageGu);
      } else {
        triggerHaptic('warning');
        speakGuidance(result.messageGu);
      }
    }, 1100);
  };

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileMeta({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        source: 'સ્થાનિક ઉપકરણ ફાઇલ (Local File)'
      });
      handleRunOcr(SAMPLE_OCR_TEST_CASES.valid2025);
    }
  };

  const handleDirectFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileMeta({
        name: `📁 Folder (${files.length} Documents)`,
        size: `${files.length} files processed`,
        source: 'ફોલ્ડર અપલોડ (Folder Upload)'
      });
      handleRunOcr(SAMPLE_OCR_TEST_CASES.valid2025);
    }
  };

  const selectDriveDemoFile = (name: string, size: string, testCase: 'valid2025' | 'expired2021' | 'unclearDate') => {
    setSelectedFileMeta({
      name,
      size,
      source: 'Cloud Import — Demo'
    });
    handleRunOcr(SAMPLE_OCR_TEST_CASES[testCase]);
  };

  const handleManualDateSubmit = () => {
    setShowManualDateModal(false);
    handleRunOcr(SAMPLE_OCR_TEST_CASES.valid2025, manualDateInput);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-[#003366]/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-5 modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
      >
        
        {/* Top Header */}
        <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                દસ્તાવેજ OCR & પૂર્વ-ચકાસણી (Document Pre-Verification)
              </h3>
              <p className="text-[11px] text-blue-200">
                Client-Side OCR + Rule Engine • {scheme.titleGu}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Camera vs Cloud Demo Import */}
        <div className="bg-slate-100 p-1 flex border-b border-slate-200 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('camera');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-[#003366] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>કેમેરા સ્કેનર (Camera Scanner)</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('drive');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-[#003366] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-[#005A9C]" />
            <span>Cloud Import — Demo</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto modal-scroll-area p-4 space-y-4 text-center">

          {/* TAB 1: Camera Viewfinder with Edge Guide & Quality Warnings */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center border-2 border-slate-300">
                {cameraStreamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <Camera className="w-10 h-10 mx-auto text-slate-500 stroke-1" />
                    <p className="text-xs font-medium">કેમેરા વ્યુફાઇન્ડર (Live Camera Viewfinder)</p>
                    <p className="text-[10px] text-slate-500">
                      દસ્તાવેજના ૪ ખૂણા માર્ગદર્શક ફ્રેમમાં ગોઠવો
                    </p>
                  </div>
                )}

                {/* Viewfinder Bounding Box & Corners */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-[#FF9933]/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-[#FF9933]" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#FF9933]" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                      દસ્તાવેજ સીધો અને સ્પષ્ટ રાખો
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-[#FF9933]" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-[#FF9933]" />
                  </div>
                </div>

                {/* Scanning Laser Line */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-[#138808] shadow-[0_0_12px_#138808] animate-pulse top-1/2" />
                )}
              </div>

              {/* Quality Helper Checks */}
              <div className="grid grid-cols-3 gap-2 text-[10.5px] font-medium text-slate-600">
                <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-1">
                  ✓ સ્પષ્ટ પ્રકાશ
                </span>
                <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-1">
                  ✓ ધૂંધળાપણું ન રાખો
                </span>
                <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-1">
                  ✓ ૪ ખૂણા દેખાય
                </span>
              </div>

              {qualityWarning && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-left text-xs font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF9933] shrink-0" />
                  <span>{qualityWarning}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Cloud / Local File Import (Explicitly labeled Demo) */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              
              {/* Local File / Folder Picker */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 text-center space-y-3 bg-[#F5F7FA]">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto text-xl">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#003366]">સીધી ફાઇલ અથવા આખું ફોલ્ડર પસંદ કરો</p>
                  <p className="text-[11px] text-slate-500">PDF, JPG, PNG અથવા આખું દસ્તાવેજ ફોલ્ડર અપલોડ કરી શકાય છે</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#005A9C] hover:bg-[#003366] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📂 ફાઇલ અપલોડ કરો (Select File)</span>
                  </button>
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>📁 ફોલ્ડર અપલોડ કરો (Upload Folder)</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleDirectFileSelect}
                />
                <input
                  type="file"
                  ref={folderInputRef}
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  className="hidden"
                  onChange={handleDirectFolderSelect}
                />
              </div>

              {/* Cloud Import — Demo (DigiLocker / Drive Test Samples) */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-left">
                <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-[#005A9C]" />
                    <div>
                      <p className="text-xs font-black text-[#003366]">Cloud Import — Demo (ટેસ્ટ નમૂના)</p>
                      <p className="text-[10px] text-slate-500">Demonstration file samples for evaluation</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-extrabold bg-[#005A9C] text-white px-2 py-0.5 rounded-full">
                    Demo Mode
                  </span>
                </div>

                <div className="p-2 space-y-1.5 divide-y divide-slate-100">
                  {/* Sample 1: Valid 2025 */}
                  <div
                    onClick={() => selectDriveDemoFile('આવકનો_દાખલો_૨૦૨૫_ડીજીટલ.pdf', '284 KB', 'valid2025')}
                    className="p-2.5 rounded-xl hover:bg-blue-50/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#005A9C]">આવકનો_દાખલો_૨૦૨૫_ડીજીટલ.pdf</p>
                        <p className="text-[10px] text-slate-400">ઇસ્યુ: ૨૨-૦૪-૨૦૨૫ • ૨૮૪ KB • <span className="text-emerald-700 font-bold">માન્ય મુદત</span></p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#005A9C] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg group-hover:bg-[#005A9C] group-hover:text-white transition">
                      ઇમ્પોર્ટ →
                    </span>
                  </div>

                  {/* Sample 2: Expired 2021 */}
                  <div
                    onClick={() => selectDriveDemoFile('આવકનો_દાખલો_૨૦૨૧_જૂનો.pdf', '192 KB', 'expired2021')}
                    className="p-2.5 rounded-xl hover:bg-red-50/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-red-700">આવકનો_દાખલો_૨૦૨૧_જૂનો.pdf</p>
                        <p className="text-[10px] text-slate-400">ઇસ્યુ: ૧૪-૦૮-૨૦૨૧ • ૧૯૨ KB • <span className="text-red-600 font-bold">મુદત બહાર (૩ વર્ષથી વધુ)</span></p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                      ટેસ્ટ →
                    </span>
                  </div>

                  {/* Sample 3: Unclear date for Needs Review testing */}
                  <div
                    onClick={() => selectDriveDemoFile('આવકનો_દાખલો_અસ્પષ્ટ_તારીખ.jpg', '310 KB', 'unclearDate')}
                    className="p-2.5 rounded-xl hover:bg-amber-50/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                        JPG
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-amber-800">આવકનો_દાખલો_અસ્પષ્ટ_તારીખ.jpg</p>
                        <p className="text-[10px] text-slate-400">ધૂંધળું લખાણ • ૩૧૦ KB • <span className="text-amber-800 font-bold">ચકાસણી જરૂરી (Needs Review)</span></p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                      ટેસ્ટ →
                    </span>
                  </div>
                </div>
              </div>

              {selectedFileMeta && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-[#005A9C]" />
                    <div>
                      <p className="text-xs font-black text-[#003366]">{selectedFileMeta.name}</p>
                      <p className="text-[10px] text-slate-500">{selectedFileMeta.source} • {selectedFileMeta.size}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-[#138808] border border-emerald-300 px-2 py-0.5 rounded-full">
                    પ્રી-ચેક તૈયાર
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 🔍 STRUCTURED OCR RESULTS UI (Requirements 9, 10, 16) */}
          {validationResult && (
            <div className="space-y-3 text-left">
              
              {/* Result Status Banner */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  validationResult.status === 'passed'
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900'
                    : validationResult.status === 'needs_review'
                    ? 'bg-amber-50 border-amber-300 text-slate-900'
                    : 'bg-red-50 border-red-300 text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.status === 'passed' ? (
                    <CheckCircle className="w-5 h-5 text-[#138808] shrink-0 mt-0.5" />
                  ) : validationResult.status === 'needs_review' ? (
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          validationResult.status === 'passed'
                            ? 'bg-emerald-200 text-[#138808]'
                            : validationResult.status === 'needs_review'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {validationResult.status === 'passed' 
                          ? '🟢 PRE-CHECK PASSED' 
                          : validationResult.status === 'needs_review'
                          ? '🟡 NEEDS REVIEW'
                          : '🔴 PRE-CHECK FAILED'}
                      </span>

                      <button
                        onClick={() => speakGuidance(validationResult.messageGu)}
                        className="text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> સાંભળો
                      </button>
                    </div>

                    <p className="text-xs font-bold leading-relaxed">{validationResult.messageGu}</p>
                    <p className="text-[11px] text-slate-600">{validationResult.messageEn}</p>
                  </div>
                </div>
              </div>

              {/* Extracted Information Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-[10.5px] font-black uppercase text-[#003366] tracking-wider">
                  OCR દ્વારા વાંચેલી વિગતો (Extracted Information)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">દસ્તાવેજ પ્રકાર:</span>
                    <span className="font-extrabold text-slate-800">{validationResult.extractedData.documentType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">અરજદારનું નામ:</span>
                    <span className="font-extrabold text-slate-800">{validationResult.extractedData.applicantName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ઇસ્યુ તારીખ / વર્ષ:</span>
                    <span className="font-extrabold text-[#005A9C]">
                      {validationResult.extractedData.issueDate || 'અસ્પષ્ટ (Unclear)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">દાખલા નંબર:</span>
                    <span className="font-extrabold text-slate-800 font-mono">
                      {validationResult.extractedData.certificateNumber || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checks Checklist Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-[10.5px] font-black uppercase text-[#003366] tracking-wider">
                  ચકાસણી માપદંડ (Pre-Verification Checks)
                </p>
                <div className="space-y-1.5">
                  {validationResult.checks.map((chk, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{chk.passed ? '✓' : '⚠️'}</span>
                        <span className="font-bold text-slate-700">{chk.nameGu} ({chk.name})</span>
                      </div>
                      <span className={`text-[10.5px] font-bold ${chk.passed ? 'text-[#138808]' : 'text-amber-800'}`}>
                        {chk.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Government Officer Disclaimer (Requirement 3) */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[10.5px] text-slate-600 space-y-1">
                <p className="font-bold text-[#003366]">⚠️ પૂર્વ-ચકાસણી સૂચના (Important Notice):</p>
                <p>{validationResult.disclaimer}</p>
                <p className="text-slate-500 text-[10px]">
                  આ એક ઓટોમેટેડ પ્રી-ચેક છે જેથી કચેરીમાં અમાન્ય દસ્તાવેજને કારણે તમારો સમય ન બગડે. આખરી મંજૂરી અધિકૃત સરકારી અધિકારી દ્વારા આપવામાં આવશે.
                </p>
              </div>

              {/* Action Buttons for Failed or Needs Review states (Requirement 16) */}
              {validationResult.status !== 'passed' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-amber-950">તમારી પાસે વિકલ્પો છે (Available Options):</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRunOcr(SAMPLE_OCR_TEST_CASES.valid2025)}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                    >
                      🔄 ફરી સ્પષ્ટ ફોટો પાડો (Retake)
                    </button>
                    <button
                      onClick={() => setShowManualDateModal(true)}
                      className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-[#005A9C] hover:bg-blue-50 transition cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>તારીખ જાતે દાખલ કરો (Enter Date)</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('success');
                        onVerifiedSuccess();
                      }}
                      className="px-3 py-1.5 bg-[#003366] text-white rounded-lg text-xs font-extrabold hover:bg-[#002244] transition cursor-pointer"
                    >
                      અધિકારી નિરીક્ષણ સાથે આગળ વધો (Continue with Officer Review) →
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Date Entry Modal */}
              {showManualDateModal && (
                <div className="p-3 bg-white border-2 border-[#005A9C] rounded-2xl space-y-2">
                  <p className="text-xs font-black text-[#003366]">પ્રમાણપત્ર ઇસ્યુ તારીખ દાખલ કરો:</p>
                  <input
                    type="date"
                    value={manualDateInput}
                    onChange={(e) => setManualDateInput(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl outline-none focus:border-[#005A9C]"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowManualDateModal(false)}
                      className="px-3 py-1 text-xs text-slate-500 font-bold"
                    >
                      રદ કરો
                    </button>
                    <button
                      onClick={handleManualDateSubmit}
                      className="px-3 py-1 bg-[#005A9C] text-white rounded-lg text-xs font-bold"
                    >
                      ચકાસો (Verify)
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Aadhaar Privacy Notice (Requirement 13) */}
          <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left">
            🔒 <strong>Aadhaar Number Masking & Privacy:</strong> Your Aadhaar information is used only for identity matching in this demonstration and is not displayed in full.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
          <button
            onClick={() => handleRunOcr(SAMPLE_OCR_TEST_CASES.valid2025)}
            disabled={scanning}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'OCR પ્રી-ચેક ચાલુ છે...' : 'ફોટો કેપ્ચર & પ્રી-ચેક'}</span>
          </button>

          <button
            onClick={() => {
              if (validationResult?.isValid || validationResult?.canContinueWithOfficerReview) {
                triggerHaptic('success');
                onVerifiedSuccess();
              }
            }}
            disabled={!validationResult}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
              validationResult?.isValid
                ? 'bg-[#005A9C] hover:bg-[#003366] text-white active:scale-95'
                : validationResult?.canContinueWithOfficerReview
                ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoggedIn ? (
              <>
                <span>
                  {validationResult?.isValid ? 'ટોકન બુકિંગ આગળ વધો' : 'અધિકારી રિવ્યુ સાથે આગળ વધો'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>નાગરિક લૉગિન સાથે આગળ વધો</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
