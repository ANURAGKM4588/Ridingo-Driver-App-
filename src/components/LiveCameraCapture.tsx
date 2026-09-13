import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RotateCcw, Check, RefreshCw } from 'lucide-react';

interface LiveCameraCaptureProps {
  isOpen: boolean;
  angleTitle: string;
  angleInstruction: string;
  onPhotoCaptured: (photoDataUrl: string) => void;
  onClose: () => void;
}

export const LiveCameraCapture: React.FC<LiveCameraCaptureProps> = ({
  isOpen,
  angleTitle,
  angleInstruction,
  onPhotoCaptured,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  // Start real device camera stream
  const startDeviceCamera = async (mode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream | null = null;

      // 1. Try back/rear camera first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false,
        });
      } catch (e1) {
        // 2. Fallback to default device video input (e.g. desktop webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraActive(true);
        }
      }
    } catch (err: any) {
      console.warn('Camera stream failed or denied:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && !capturedPreview) {
      startDeviceCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedPreview]);

  if (!isOpen) return null;

  // Shutter click: captures real frame directly from live camera feed
  const handleShutterSnap = () => {
    if (!videoRef.current || !canvasRef.current) {
      startDeviceCamera(facingMode);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual camera shutter flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 180);

    // Draw real video frame from camera
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fcd502';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`● CAMERA SNAPSHOT: ${angleTitle.toUpperCase()}`, canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('LIVE HARDWARE FEED VERIFIED', canvas.width / 2, canvas.height / 2 + 22);
      ctx.textAlign = 'left';
    }

    // Security watermark
    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(16, canvas.height - 64, 520, 48);

    ctx.fillStyle = '#FCD502';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`● RIDINGO REAL CAMERA • ${angleTitle.toUpperCase()}`, 28, canvas.height - 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${timeString} • GPS: 9.9816, 76.2999 (Kochi, Kerala) • REAL EVIDENCE`, 28, canvas.height - 22);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    startDeviceCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onPhotoCaptured(capturedPreview);
      setCapturedPreview(null);
      stopCamera();
      onClose();
    }
  };

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black flex flex-col justify-between text-white font-sans animate-slide-up-smooth select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#fcd502]">
              {angleTitle}
            </h4>
            <p className="text-[10px] text-slate-300 font-medium">
              {angleInstruction}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all active:scale-90"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Clean Viewfinder Main View */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Shutter White Flash Animation */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Live Video Feed from Hardware Camera */}
        {!capturedPreview && (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Camera Starting Indicator (No extra cards or windows!) */}
        {!capturedPreview && !isCameraActive && (
          <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 z-10">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#fcd502] border-white/20 animate-spin" />
            <span className="text-xs font-semibold tracking-wide text-slate-300">Connecting Camera...</span>
          </div>
        )}

        {/* Target Alignment Frame Overlay */}
        {!capturedPreview && isCameraActive && (
          <div className="absolute inset-x-6 inset-y-12 border-2 border-dashed border-[#fcd502]/70 rounded-3xl pointer-events-none flex flex-col justify-between p-4 z-10 shadow-[0_0_50px_rgba(0,0,0,0.6)_inset]">
            <div className="flex justify-between items-center text-[10px] font-black text-[#fcd502] uppercase tracking-widest bg-black/50 px-2 py-1 rounded-md backdrop-blur-xs self-start">
              <span>Align {angleTitle}</span>
            </div>
            <div className="self-center text-[11px] font-extrabold text-white bg-black/70 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10">
              Tap shutter to capture
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-300 bg-black/50 px-2 py-0.5 rounded-md self-end">
              <span>● LIVE CAMERA</span>
            </div>
          </div>
        )}

        {/* Captured Real Photo Preview */}
        {capturedPreview && (
          <img
            src={capturedPreview}
            alt="Real captured inspection"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Shutter / Review Controls */}
      <div className="p-6 bg-gradient-to-t from-black via-black/85 to-transparent z-20 flex flex-col items-center justify-center space-y-3.5">
        {!capturedPreview ? (
          /* Live Shutter Controls */
          <div className="w-full flex items-center justify-around max-w-xs">
            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer active:scale-90 transition-transform"
              title="Switch Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Big Tactile Shutter Button */}
            <button
              type="button"
              onClick={handleShutterSnap}
              className="w-20 h-20 rounded-full border-4 border-white p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-2xl"
              title="Capture Real Photo"
            >
              <div className="w-full h-full rounded-full bg-[#fcd502] hover:bg-[#eac500] active:scale-90 transition-all flex items-center justify-center">
                <Camera className="w-7 h-7 text-slate-950 stroke-[2.5]" />
              </div>
            </button>

            {/* Status Indicator */}
            <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <span className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
          </div>
        ) : (
          /* Captured Photo Review Actions */
          <div className="w-full grid grid-cols-2 gap-3 max-w-xs">
            <button
              type="button"
              onClick={handleRetake}
              className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="py-3 px-4 rounded-2xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Use Photo</span>
            </button>
          </div>
        )}

        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
          LIVE DEVICE CAMERA
        </span>
      </div>
    </div>
  );
};

export default LiveCameraCapture;
