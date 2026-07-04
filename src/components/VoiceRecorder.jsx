import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, X, Loader2, Send } from 'lucide-react';

export default function VoiceRecorder({ onSend, disabled }) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await onSend(file_url);
        } catch (err) {
          console.error(err);
        }
        setUploading(false);
        setSeconds(0);
      };

      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error('Mic access denied', err);
    }
  };

  const stopAndSend = () => {
    if (mediaRef.current && mediaRef.current.state === 'recording') {
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  const cancel = () => {
    if (mediaRef.current && mediaRef.current.state === 'recording') {
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    setRecording(false);
    setSeconds(0);
  };

  if (uploading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 size={18} className="animate-spin" /> Uploading voice message...
      </div>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={cancel}
          className="w-10 h-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0"
        >
          <X size={18} />
        </button>
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full bg-destructive/10 border border-destructive/20">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm text-destructive font-medium">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>
        <button
          onClick={stopAndSend}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition"
        >
          <Send size={20} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition disabled:opacity-40 shrink-0"
      title="Record voice message"
    >
      <Mic size={18} />
    </button>
  );
}