import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Loader2, Clock, XCircle, Upload, Heart, IdCard, Camera, LogOut } from 'lucide-react';

export default function PendingVerification() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!user) return;
    try {
      const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
      if (!profiles[0]) return;
      setProfile(profiles[0]);
      if (profiles[0].is_verified) {
        navigate('/discover', { replace: true });
        return;
      }
      const vrs = await base44.entities.VerificationRequest.filter(
        { user_id: user.id },
        '-created_date',
        1
      );
      setVerification(vrs[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setter(file_url);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleResubmit = async () => {
    if (!selfieUrl || !idDocumentUrl || !user) return;
    setSubmitting(true);
    try {
      await base44.entities.VerificationRequest.create({
        user_id: user.id,
        selfie_url: selfieUrl,
        id_document_url: idDocumentUrl,
        status: 'pending',
      });
      setSelfieUrl(null);
      setIdDocumentUrl(null);
      checkStatus();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/register" replace />;
  if (!profile?.is_onboarded) return <Navigate to="/onboarding" replace />;
  if (profile.is_verified) return <Navigate to="/discover" replace />;

  const status = verification?.status || 'pending';
  const needsResubmit = status === 'rejected';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-10">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Heart className="text-primary fill-primary" size={24} />
          <span className="font-heading font-bold text-lg">Trust Matches</span>
        </div>

        {needsResubmit ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
                <XCircle className="text-destructive" size={32} />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">Verification needs attention</h1>
              <p className="text-sm text-muted-foreground">
                Your ID couldn't be verified. Please re-upload a clear photo of your passport or government ID and a new selfie.
              </p>
              {verification?.review_note && (
                <p className="text-xs text-muted-foreground mt-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  {verification.review_note}
                </p>
              )}
            </div>

            {/* Re-upload form */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Camera size={16} className="text-primary" /> New selfie
                </label>
                {selfieUrl ? (
                  <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden mx-auto">
                    <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                    <button onClick={() => setSelfieUrl(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full">
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
                    {uploading ? <Loader2 size={28} className="text-muted-foreground animate-spin" /> : <Camera size={28} className="text-muted-foreground" />}
                    <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload selfie'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, setSelfieUrl)} />
                  </label>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <IdCard size={16} className="text-gold" /> New passport or government ID
                </label>
                {idDocumentUrl ? (
                  <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden mx-auto">
                    <img src={idDocumentUrl} alt="ID Document" className="w-full h-full object-cover" />
                    <button onClick={() => setIdDocumentUrl(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full">
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-8 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition">
                    {uploading ? <Loader2 size={28} className="text-muted-foreground animate-spin" /> : <IdCard size={28} className="text-muted-foreground" />}
                    <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload passport/ID'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, setIdDocumentUrl)} />
                  </label>
                )}
              </div>

              <button
                onClick={handleResubmit}
                disabled={!selfieUrl || !idDocumentUrl || submitting || uploading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold disabled:opacity-40 transition hover:bg-primary/90"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {submitting ? 'Submitting...' : 'Re-submit for review'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-teal" size={32} />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">Verification under review</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thanks — your passport/ID and selfie have been submitted. Our team is reviewing your documents.
                You'll get access to Trust Matches as soon as your identity is confirmed.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-teal shrink-0" size={20} />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {status === 'pending' ? 'Pending review' : status === 'reviewing' ? 'In review' : status === 'flagged_fraud' ? 'Under investigation' : status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-muted-foreground shrink-0" size={20} />
                <div>
                  <p className="text-sm font-medium">Estimated time</p>
                  <p className="text-xs text-muted-foreground">Usually within 24–48 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-teal/5 border border-teal/20 rounded-2xl p-4 mb-6">
              <p className="text-xs text-foreground leading-relaxed">
                This page updates automatically — no need to refresh. You can safely close the app and come back later.
              </p>
            </div>
          </>
        )}

        <button
          onClick={() => logout('/')}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition py-3"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}