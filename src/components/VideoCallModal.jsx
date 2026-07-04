import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, X, Loader2 } from 'lucide-react';

export default function VideoCallModal({ match, profile, otherProfile, onClose }) {
  const [state, setState] = useState('idle'); // idle, calling, connected, ended
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const callIdRef = useRef(`call-${Date.now()}`);
  const iceSentRef = useRef(new Set());

  const matchId = match?.id;
  const myId = profile?.created_by_id;
  const otherId = match?.user_a === myId ? match?.user_b : match?.user_a;

  // Poll for signaling messages
  useEffect(() => {
    if (!matchId) return;
    const poll = async () => {
      try {
        const msgs = await base44.entities.Message.filter({ match_id: matchId });
        const signals = msgs
          .filter((m) => m.message_type === 'call_signal')
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

        for (const msg of signals) {
          if (msg.sender_id === myId) continue;
          try {
            const data = JSON.parse(msg.content);
            if (data.call_id !== callIdRef.current) continue;
            await handleSignal(data);
          } catch (e) {}
        }
      } catch (err) {}
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [matchId, myId]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const sendSignal = async (data) => {
    await base44.entities.Message.create({
      match_id: matchId,
      sender_id: myId,
      receiver_id: otherId,
      content: JSON.stringify({ ...data, call_id: callIdRef.current }),
      message_type: 'call_signal',
    });
  };

  const handleSignal = async (data) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.type === 'offer') {
      setState('connected');
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal({ type: 'answer', sdp: answer });
    } else if (data.type === 'answer') {
      if (pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setState('connected');
      }
    } else if (data.type === 'ice' && data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {}
    } else if (data.type === 'end') {
      endCall();
    }
  };

  const startCall = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const key = e.candidate.candidate;
          if (!iceSentRef.current.has(key)) {
            iceSentRef.current.add(key);
            sendSignal({ type: 'ice', candidate: e.candidate });
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal({ type: 'offer', sdp: offer });
      setState('calling');
    } catch (err) {
      setError('Camera/mic access denied. Please allow permissions and try again.');
    }
  };

  const endCall = async () => {
    try {
      await sendSignal({ type: 'end' });
    } catch (e) {}
    cleanup();
  };

  const cleanup = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setState('ended');
    setTimeout(onClose, 1500);
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  };

  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Remote video (full screen) */}
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
          {state === 'calling' ? (
            <>
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 animate-pulse">
                <Video size={40} />
              </div>
              <p className="text-lg font-medium">Calling {otherProfile?.full_name}...</p>
              <p className="text-sm text-white/40 mt-1">Ringing</p>
            </>
          ) : state === 'ended' ? (
            <>
              <PhoneOff size={40} className="mb-4" />
              <p className="text-lg font-medium">Call ended</p>
            </>
          ) : (
            <>
              <Video size={48} className="mb-4" />
              <p className="text-lg font-medium mb-4">Video Call</p>
              <button
                onClick={startCall}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition"
              >
                <Video size={20} /> Start Video Call
              </button>
            </>
          )}
        </div>
      )}

      {/* Local video (picture-in-picture) */}
      {localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute bottom-24 right-4 w-28 h-40 md:w-36 md:h-48 rounded-2xl object-cover border-2 border-white/20 shadow-xl z-10 ${!camOn ? 'opacity-0' : ''}`}
        />
      )}

      {/* Close button */}
      <button
        onClick={state === 'connected' || state === 'calling' ? endCall : onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-20"
      >
        <X size={20} />
      </button>

      {/* Error */}
      {error && (
        <div className="absolute top-4 left-4 right-16 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-xl text-sm z-20">
          {error}
        </div>
      )}

      {/* Controls */}
      {(state === 'connected' || state === 'calling') && (
        <div className="absolute bottom-8 flex items-center gap-4 z-20">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              micOn ? 'bg-white/15 text-white' : 'bg-white text-black'
            }`}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              camOn ? 'bg-white/15 text-white' : 'bg-white text-black'
            }`}
          >
            {camOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      )}
    </div>
  );
}