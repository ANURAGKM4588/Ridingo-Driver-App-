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
      <div className="bg-[#12141A] rounded-t-3xl sm:rounded-2xl max-w-sm w-full h-[88vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl border border-white/[0.08] text-white overflow-hidden font-sans animate-slide-up-smooth">

        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#090A0D] border-b border-white/[0.06] shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-white tracking-tight whitespace-nowrap truncate">Vehicle Inspection</h3>
              <p className="text-[11px] text-white/40 font-normal whitespace-nowrap truncate">Pre-ride live camera verification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 text-white/60 flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">

          {/* Security & Verification Banner */}
          <div className="p-3 rounded-xl bg-[#171A22] border border-white/[0.06] flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap truncate">Damage Protection Record</span>
              </div>
              <p className="text-[11px] text-white/40 font-normal whitespace-nowrap truncate mt-0.5">
                Time-stamped photos protect driver from claims
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/80 font-medium text-[11px] flex items-center gap-1 border border-white/10 cursor-pointer active:scale-95 transition-all whitespace-nowrap shrink-0"
              title="Fast fill for testing"
            >
              <Sparkles className="w-3 h-3 text-[#F5C518] shrink-0" />
              <span className="whitespace-nowrap">Demo Fill</span>
            </button>
          </div>

          {/* Inspection Progress Tracker */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-medium text-white/60 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-white/40" />
              4 Mandatory Angles
            </span>
            <span className={`text-[11px] font-medium ${completedCount === 4 ? 'text-emerald-400' : 'text-white/40'}`}>
              {completedCount} of 4 Documented
            </span>
          </div>

          {/* 4 Car Angles Grid (Front, Right Side, Back, Left Side) */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. FRONT */}
            <div
              onClick={() => setActiveCameraSlot('front')}
              className={`group relative rounded-xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                frontImage
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.08] bg-[#171A22] hover:border-[#F5C518]/50 hover:bg-[#1C202A]'
              }`}
            >
              {frontImage ? (
                <div className="w-full relative">
                  <img
                    src={frontImage}
                    alt="Car Front"
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-medium flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Saved
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-xs font-medium text-white truncate">1. Front</span>
                    <span className="text-[10px] font-normal text-emerald-400">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-[#F5C518]/15 flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-[#F5C518]" />
                  </div>
                  <span className="text-xs font-medium text-white">1. Front</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    Tap to capture
                  </span>
                </div>
              )}
            </div>

            {/* 2. RIGHT SIDE */}
            <div
              onClick={() => setActiveCameraSlot('rightSide')}
              className={`group relative rounded-xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                rightSideImage
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.08] bg-[#171A22] hover:border-[#F5C518]/50 hover:bg-[#1C202A]'
              }`}
            >
              {rightSideImage ? (
                <div className="w-full relative">
                  <img
                    src={rightSideImage}
                    alt="Right Side"
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-medium flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Saved
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-xs font-medium text-white truncate">2. Right Side</span>
                    <span className="text-[10px] font-normal text-emerald-400">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-[#F5C518]/15 flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-[#F5C518]" />
                  </div>
                  <span className="text-xs font-medium text-white">2. Right Side</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    Tap to capture
                  </span>
                </div>
              )}
            </div>

            {/* 3. BACK / REAR */}
            <div
              onClick={() => setActiveCameraSlot('back')}
              className={`group relative rounded-xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                backImage
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.08] bg-[#171A22] hover:border-[#F5C518]/50 hover:bg-[#1C202A]'
              }`}
            >
              {backImage ? (
                <div className="w-full relative">
                  <img
                    src={backImage}
                    alt="Back"
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-medium flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Saved
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-xs font-medium text-white truncate">3. Rear</span>
                    <span className="text-[10px] font-normal text-emerald-400">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-[#F5C518]/15 flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-[#F5C518]" />
                  </div>
                  <span className="text-xs font-medium text-white">3. Rear</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    Tap to capture
                  </span>
                </div>
              )}
            </div>

            {/* 4. LEFT SIDE (OTHER SIDE) */}
            <div
              onClick={() => setActiveCameraSlot('leftSide')}
              className={`group relative rounded-xl border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                leftSideImage
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.08] bg-[#171A22] hover:border-[#F5C518]/50 hover:bg-[#1C202A]'
              }`}
            >
              {leftSideImage ? (
                <div className="w-full relative">
                  <img
                    src={leftSideImage}
                    alt="Left Side"
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-medium flex items-center gap-0.5 shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Saved
                  </span>
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-xs font-medium text-white truncate">4. Left Side</span>
                    <span className="text-[10px] font-normal text-emerald-400">Retake ↺</span>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-2 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-[#F5C518]/15 flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-[#F5C518]" />
                  </div>
                  <span className="text-xs font-medium text-white">4. Left Side</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    Tap to capture
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5. SCRATCHES, DENTS & DEFECTS CAMERA SECTION */}
          <div className="bg-[#171A22] border border-white/[0.06] p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F5C518]" />
                  Scratches &amp; Pre-existing Defects
                </span>
                <p className="text-[11px] text-white/40 font-normal">Optional close-up photos for documentation</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCameraSlot('defect')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-white/10"
              >
                <Camera className="w-3 h-3 text-[#F5C518]" />
                <span>Snap Photo</span>
              </button>
            </div>

            {/* Defect Photo Previews Gallery */}
            {defectImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {defectImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={img}
                      alt={`Defect ${idx + 1}`}
                      className="w-full h-16 object-cover cursor-pointer"
                      onClick={() => setPreviewEnlarged(img)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDefect(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center shadow-xs cursor-pointer"
                      title="Remove photo"
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
                className="w-full py-2.5 px-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-white/50 text-xs font-normal"
              >
                <Camera className="w-3.5 h-3.5 text-[#F5C518]" />
                <span>Photograph minor scratches or dents</span>
              </button>
            )}

            {/* Common Damage Tag Chips */}
            <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
              <span className="text-[11px] font-medium text-white/40 block">Common Damage Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DEFECT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-normal px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5C518] border-[#F5C518] text-black font-medium shadow-xs'
                          : 'bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/[0.08]'
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
                placeholder="Optional notes (e.g. 2-inch scratch on rear bumper)"
                className="w-full py-2 px-3 rounded-lg bg-[#12141A] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/50"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer with "Start Trip" Button */}
        <div className="p-4 bg-[#090A0D] border-t border-white/[0.06] shrink-0 space-y-2.5">
          {!isReady ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap truncate">{completedCount} of 4 Photos Completed</span>
              </div>
              <p className="text-[11px] text-white/40 font-normal whitespace-nowrap truncate">
                Capture all 4 angles to unlock trip meter
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-0.5">
              <span className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap truncate">All 4 Angles Verified. Ready to Start</span>
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={!isReady}
            onClick={handleStartTrip}
            className={`w-full h-12 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 select-none ${
              isReady
                ? 'bg-[#F5C518] hover:bg-[#E5B510] text-black shadow-md shadow-[#F5C518]/15 cursor-pointer active:scale-[0.98]'
                : 'bg-white/[0.06] text-white/30 cursor-not-allowed border border-white/[0.06] shadow-none pointer-events-none'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.2]" />
                <span>Start Trip</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white/30" />
                <span>Take All 4 Photos to Start ({completedCount}/4)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VehicleInspectionModal;
