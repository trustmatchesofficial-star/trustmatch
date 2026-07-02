import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Ban, X, Loader2, CheckCircle } from 'lucide-react';

export default function BlockModal({ blockedProfile, blockerId, onClose, onBlocked }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!blockedProfile) return null;

  const handleBlock = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Block.create({
        blocker_id: blockerId,
        blocked_id: blockedProfile.id,
      });
      setDone(true);
      onBlocked?.();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="text-destructive" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">User Blocked</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {blockedProfile.full_name} has been blocked. Their profile is hidden from your feed and they can no longer message you.
            </p>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Ban className="text-destructive" size={22} />
              <h2 className="text-xl font-heading font-bold">Block User</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Block {blockedProfile.full_name}? Their profile will be hidden from your discovery feed and they won't be able to send you messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition disabled:opacity-40"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Ban size={16} />}
                {submitting ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}