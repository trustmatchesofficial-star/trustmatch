import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, X, Camera, CheckCircle, XCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LiveVideoVerification({ profile, setProfile, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const profilePhotos = (profile?.photos || []).slice(0, 3);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setError('We could not access your camera. Please allow camera access in your browser settings and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !cameraOn) return;
    setCapturing(true);
    setError('');
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
      setCapturing(false);

      const file = new File([blob], 'live-capture.jpg', { type: 'image/jpeg' });
      const { file_url: liveUrl } = await base44.integrations.Core.UploadFile({ file });

      setVerifying(true);
      const response = await base44.functions.invoke('completeLiveVerification', {
        live_photo_url: liveUrl,
        profile_photo_urls: profilePhotos,
      });
      const data = response.data;
      const match = data?.match === true;
      setResult({ same_person: match, confidence: data?.confidence, note: data?.note, match });
      if (match && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error(err);
    }
    setVerifying(false);
  };

  const retry = () => {
    setResult(null);
    setError('');
    if (!cameraOn) startCamera();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Video className="text-purplecustom" size={22} />
          <h2 className="text-xl font-heading font-bold">Live Video Verification</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          We'll take a live photo with your camera and check it matches your profile photos — so others know you're really you.
        </p>

        {result?.match ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="text-teal" size={40} />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">You're live-verified!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your live photo matched your profile. A Live Verified badge has been added to your profile.
            </p>
            <button onClick={onClose} className="w-full px-5 py-3 rounded-full bg-teal text-accent-foreground font-semibold text-sm hover:bg-teal/90 transition">
              Done
            </button>
          </div>
        ) : result ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center mb-4 mx-auto">
              <XCircle className="text-destructive" size={40} />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">Couldn't confirm a match</h3>
            <p className="text-muted-foreground text-sm mb-1">
              {result.note || 'Your live photo did not clearly match your profile photos.'}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Make sure you're in good lighting, face the camera directly, and that your profile photos are of you.
            </p>
            <button onClick={retry} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition">
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : profilePhotos.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 mx-auto">
              <Camera className="text-muted-foreground" size={28} />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              You need at least one profile photo before live verification. Add a photo to your profile first.
            </p>
            <button onClick={onClose} className="w-full px-5 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-background border border-border aspect-[3/4] mb-4">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              {!cameraOn && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-muted-foreground animate-spin" size={28} />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Camera className="text-muted-foreground mb-2" size={28} />
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              )}
              {cameraOn && !verifying && !capturing && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Live
                </div>
              )}
            </div>

            {error && (
              <button onClick={startCamera} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-input font-medium text-sm hover:bg-secondary transition mb-3">
                <RefreshCw size={16} /> Enable camera
              </button>
            )}

            <button
              onClick={captureAndVerify}
              disabled={!cameraOn || verifying || capturing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-purplecustom text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-40"
            >
              {capturing ? <><Loader2 size={16} className="animate-spin" /> Capturing...</> :
               verifying ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> :
               <><ShieldCheck size={18} /> Capture & verify</>}
            </button>

            {(capturing || verifying) && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                {capturing ? 'Taking your photo...' : 'Comparing with your profile photos...'}
              </p>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your live photo is used only for this verification and is not shown on your profile.
            </p>
          </>
        )}
      </div>
    </div>
  );
}