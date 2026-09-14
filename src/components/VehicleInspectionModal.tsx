import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Car,
  Eye,
  Lock
} from 'lucide-react';
import { LiveCameraCapture } from './LiveCameraCapture';

export interface VehicleConditionData {
  front: string | null;
  rightSide: string | null;
  back: string | null;
  leftSide: string | null;
  defects: string[];
  defectNotes: string;
  selectedTags: string[];
  inspectedAt: string;
}

interface VehicleInspectionModalProps {
  isOpen: boolean;
  initialData?: VehicleConditionData | null;
  onClose: () => void;
  onConfirmAndStartTrip: (data: VehicleConditionData) => void;
  vehicleName?: string;
  customerName?: string;
}

const PRESET_DEMO_PHOTOS = {
  front: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
  rightSide: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
  back: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
  leftSide: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  defect: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
};

const COMMON_DEFECT_TAGS = [
  'Minor Bumper Scratch',
  'Passenger Door Ding',
  'Wheel / Rim Scuff',
  'Small Paint Chip',
  'Rear Bumper Scuff',
  'Clean / No Major Damage'
];

const ANGLE_CONFIG = {
  front: { title: 'Car Front', instruction: 'Point camera at front bumper, hood & headlights' },
  rightSide: { title: 'Right Side', instruction: 'Capture passenger doors, windows & wheels' },
  back: { title: 'Car Back / Rear', instruction: 'Capture rear bumper, trunk & taillights' },
  leftSide: { title: 'Left Side (Driver)', instruction: 'Capture driver doors, windows & wheels' },
  defect: { title: 'Defect Close-Up', instruction: 'Hold camera close to scratch, dent or paint chip' },
};

export const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onConfirmAndStartTrip,
  vehicleName = '2024 Mercedes-Maybach S-Class',
  customerName = 'Passenger',
}) => {
  const [frontImage, setFrontImage] = useState<string | null>(initialData?.front || null);
  const [rightSideImage, setRightSideImage] = useState<string | null>(initialData?.rightSide || null);
  const [backImage, setBackImage] = useState<string | null>(initialData?.back || null);
  const [leftSideImage, setLeftSideImage] = useState<string | null>(initialData?.leftSide || null);
  const [defectImages, setDefectImages] = useState<string[]>(initialData?.defects || []);
  const [defectNotes, setDefectNotes] = useState<string>(initialData?.defectNotes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.selectedTags || []);
  const [previewEnlarged, setPreviewEnlarged] = useState<string | null>(null);

  // Synchronize state whenever modal opens or initialData updates
  useEffect(() => {
    if (isOpen && initialData) {
      setFrontImage(initialData.front);
      setRightSideImage(initialData.rightSide);
      setBackImage(initialData.back);
      setLeftSideImage(initialData.leftSide);
      setDefectImages(initialData.defects || []);
      setDefectNotes(initialData.defectNotes || '');
      setSelectedTags(initialData.selectedTags || []);
    }
  }, [isOpen, initialData]);

  // Active slot for live mobile camera
  const [activeCameraSlot, setActiveCameraSlot] = useState<'front' | 'rightSide' | 'back' | 'leftSide' | 'defect' | null>(null);

  if (!isOpen) return null;

  const handlePhotoCapturedFromCamera = (photoDataUrl: string) => {
    if (activeCameraSlot === 'front') setFrontImage(photoDataUrl);
    else if (activeCameraSlot === 'rightSide') setRightSideImage(photoDataUrl);
    else if (activeCameraSlot === 'back') setBackImage(photoDataUrl);
    else if (activeCameraSlot === 'leftSide') setLeftSideImage(photoDataUrl);
    else if (activeCameraSlot === 'defect') setDefectImages((prev) => [...prev, photoDataUrl]);
    setActiveCameraSlot(null);
  };

  const handleAutoFillDemo = () => {
    setFrontImage(PRESET_DEMO_PHOTOS.front);
    setRightSideImage(PRESET_DEMO_PHOTOS.rightSide);
    setBackImage(PRESET_DEMO_PHOTOS.back);
    setLeftSideImage(PRESET_DEMO_PHOTOS.leftSide);
    setDefectImages([PRESET_DEMO_PHOTOS.defect]);
    setSelectedTags(['Minor Bumper Scratch']);
    setDefectNotes('Pre-existing 2-inch scuff on front lower bumper before passenger boarding.');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRemoveDefect = (index: number) => {
    setDefectImages((prev) => prev.filter((_, i) => i !== index));
  };

  const completedCount = [frontImage, rightSideImage, backImage, leftSideImage].filter(Boolean).length;
  const isReady = completedCount >= 4;

  const handleStartTrip = () => {
    if (!isReady) {
      const missing: string[] = [];
      if (!frontImage) missing.push('1. Car Front');
      if (!rightSideImage) missing.push('2. Right Side');
      if (!backImage) missing.push('3. Car Back');
      if (!leftSideImage) missing.push('4. Left Side');
      alert(`Cannot start trip!\n\nAll 4 car images must be taken before starting the ride.\n\nMissing photos:\n• ${missing.join('\n• ')}`);
      return;
    }

    const conditionData: VehicleConditionData = {
      front: frontImage,
      rightSide: rightSideImage,
      back: backImage,
      leftSide: leftSideImage,
      defects: defectImages,
      defectNotes: defectNotes,
      selectedTags: selectedTags,
      inspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onConfirmAndStartTrip(conditionData);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200">

      {/* ── LIVE IN-APP CAMERA VIEWFINDER ── */}
      {activeCameraSlot && (
        <LiveCameraCapture
          isOpen={true}
          angleTitle={ANGLE_CONFIG[activeCameraSlot].title}
          angleInstruction={ANGLE_CONFIG[activeCameraSlot].instruction}
          onPhotoCaptured={handlePhotoCapturedFromCamera}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}

      {/* ── ENLARGED PHOTO PREVIEW MODAL ── */}
      {previewEnlarged && (
        <div
          className="absolute inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewEnlarged(null)}
        >
          <img
            src={previewEnlarged}
            alt="Enlarged inspection"
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
          />
          <button
            type="button"
            onClick={() => setPreviewEnlarged(null)}
            className="mt-4 px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> Close Preview
          </button>
        </div>
      )}

      {/* ── MAIN INSPECTION CONTAINER ── */}
      <div className="bg-[#0E1420] rounded-t-[36px] sm:rounded-3xl max-w-sm w-full h-[88vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl border border-white/10 text-white overflow-hidden font-sans animate-slide-up-smooth">

        {/* Modal Header */}
        <div className="px-4.5 pt-4 pb-3 bg-[#121824] border-b border-white/10 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-white tracking-tight whitespace-nowrap truncate">Vehicle Inspection</h3>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap truncate">Real-time camera snaps • GPS verified</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">

          {/* Security & Verification Banner */}
          <div className="p-3 rounded-2xl bg-[#151D2C] border border-amber-400/20 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 whitespace-nowrap truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap truncate">Dispute Proof • Live Camera Only</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium whitespace-nowrap truncate mt-0.5">
                GPS time-stamped photos to protect from damage claims
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-2.5 py-1.5 rounded-xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap shrink-0"
              title="Fast fill for testing"
            >
              <Sparkles className="w-3 h-3 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">Demo Fill</span>
            </button>
          </div>

          {/* Inspection Progress Tracker */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              4 Mandatory Angles
            </span>
            <span className={`text-[11px] font-black ${completedCount === 4 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {completedCount} of 4 Live Snaps
            </span>
          </div>

          {/* 4 Car Angles Grid (Front, Right Side, Back, Left Side) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. FRONT */}
            <div
              onClick={() => setActiveCameraSlot('front')}
              className={`group relative rounded-2xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                frontImage
                  ? 'border-emerald-500/50 bg-[#121824]'
                  : 'border-white/10 bg-[#121824] hover:border-[#fcd502] hover:bg-[#182032]'
              }`}
            >
              {frontImage ? (
                <div className="w-full relative">
                  <img
                    src={frontImage}
                    alt="Car Front"
                    className="w-full h-24 object-cover rounded-xl border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Live
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-[11px] font-black text-white truncate">1. Front</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-500/30">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#fcd502]/20 flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-[#fcd502]" />
                  </div>
                  <span className="text-xs font-bold text-white">1. Car Front</span>
                  <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Tap to Open Camera
                  </span>
                </div>
              )}
            </div>

            {/* 2. RIGHT SIDE */}
            <div
              onClick={() => setActiveCameraSlot('rightSide')}
              className={`group relative rounded-2xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                rightSideImage
                  ? 'border-emerald-500/50 bg-[#121824]'
                  : 'border-white/10 bg-[#121824] hover:border-[#fcd502] hover:bg-[#182032]'
              }`}
            >
              {rightSideImage ? (
                <div className="w-full relative">
                  <img
                    src={rightSideImage}
                    alt="Right Side"
                    className="w-full h-24 object-cover rounded-xl border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Live
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-[11px] font-black text-white truncate">2. Right Side</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-500/30">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#fcd502]/20 flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-[#fcd502]" />
                  </div>
                  <span className="text-xs font-bold text-white">2. Right Side</span>
                  <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Tap to Open Camera
                  </span>
                </div>
              )}
            </div>

            {/* 3. BACK / REAR */}
            <div
              onClick={() => setActiveCameraSlot('back')}
              className={`group relative rounded-2xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                backImage
                  ? 'border-emerald-500/50 bg-[#121824]'
                  : 'border-white/10 bg-[#121824] hover:border-[#fcd502] hover:bg-[#182032]'
              }`}
            >
              {backImage ? (
                <div className="w-full relative">
                  <img
                    src={backImage}
                    alt="Back"
                    className="w-full h-24 object-cover rounded-xl border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Live
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-[11px] font-black text-white truncate">3. Car Back</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-500/30">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#fcd502]/20 flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-[#fcd502]" />
                  </div>
                  <span className="text-xs font-bold text-white">3. Car Back</span>
                  <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Tap to Open Camera
                  </span>
                </div>
              )}
            </div>

            {/* 4. LEFT SIDE (OTHER SIDE) */}
            <div
              onClick={() => setActiveCameraSlot('leftSide')}
              className={`group relative rounded-2xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                leftSideImage
                  ? 'border-emerald-500/50 bg-[#121824]'
                  : 'border-white/10 bg-[#121824] hover:border-[#fcd502] hover:bg-[#182032]'
              }`}
            >
              {leftSideImage ? (
                <div className="w-full relative">
                  <img
                    src={leftSideImage}
                    alt="Left Side"
                    className="w-full h-24 object-cover rounded-xl border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Live
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-[11px] font-black text-white truncate">4. Left Side</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-500/30">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#fcd502]/20 flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-[#fcd502]" />
                  </div>
                  <span className="text-xs font-bold text-white">4. Left Side</span>
                  <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Tap to Open Camera
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5. SCRATCHES, DENTS & DEFECTS CAMERA SECTION */}
          <div className="uber-card p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#fcd502]" />
                  Scratches & Dents Camera
                </span>
                <p className="text-[10px] text-slate-400">Take real close-up camera photos of defects</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCameraSlot('defect')}
                className="px-2.5 py-1.5 rounded-xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <Camera className="w-3 h-3 text-slate-950" />
                <span>Snap Defect</span>
              </button>
            </div>

            {/* Defect Photo Previews Gallery */}
            {defectImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {defectImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-amber-400/50">
                    <img
                      src={img}
                      alt={`Defect ${idx + 1}`}
                      className="w-full h-16 object-cover cursor-pointer"
                      onClick={() => setPreviewEnlarged(img)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDefect(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs cursor-pointer"
                      title="Remove defect photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveCameraSlot('defect')}
                className="w-full py-3 px-3 rounded-xl border border-dashed border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-amber-300 font-bold text-xs"
              >
                <Camera className="w-4 h-4 text-[#fcd502]" />
                <span>Open Camera to Photograph Scratches / Dents</span>
              </button>
            )}

            {/* Common Damage Tag Chips */}
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Defect Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DEFECT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#fcd502] border-[#fcd502] text-slate-950 font-black'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="pt-1">
              <input
                type="text"
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                placeholder="Optional notes: e.g. 2-inch scratch on lower rear passenger door"
                className="w-full py-2 px-3 rounded-xl bg-[#182032] border border-white/10 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#fcd502]"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer with "Start the trip" Button (Strict Validation) */}
        <div className="p-4 bg-[#121824] border-t border-white/10 shrink-0 space-y-2.5">
          {!isReady ? (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-rose-300 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="whitespace-nowrap truncate">Trip Start Locked ({completedCount}/4 Photos Taken)</span>
              </div>
              <p className="text-[10px] text-rose-300/80 font-medium whitespace-nowrap truncate">
                All 4 angles mandatory before starting ride meter:
              </p>
              <div className="flex flex-wrap justify-center gap-1 pt-0.5">
                {[
                  { name: '1. Front', done: Boolean(frontImage) },
                  { name: '2. Right Side', done: Boolean(rightSideImage) },
                  { name: '3. Back', done: Boolean(backImage) },
                  { name: '4. Left Side', done: Boolean(leftSideImage) },
                ].map((item) => (
                  <span
                    key={item.name}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.done
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-900/60 text-rose-200 border border-rose-600/40'
                    }`}
                  >
                    {item.done ? '✓ ' : '✕ '}
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-0.5">
              <span className="text-[11px] font-black text-emerald-300 flex items-center justify-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap truncate">All 4 Car Angles Documented! Ready to Start</span>
              </span>
              <p className="text-[10px] text-emerald-400/80 font-medium whitespace-nowrap truncate">
                Damage protection proof saved. Tap below to start ride.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!isReady}
            onClick={handleStartTrip}
            className={`w-full py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none ${
              isReady
                ? 'bg-[#fcd502] hover:bg-[#eac500] text-slate-950 shadow-lg shadow-[#fcd502]/20 cursor-pointer active:scale-[0.98]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10 shadow-none pointer-events-none'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Start the trip</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Take All 4 Photos to Start Trip ({completedCount}/4)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VehicleInspectionModal;
