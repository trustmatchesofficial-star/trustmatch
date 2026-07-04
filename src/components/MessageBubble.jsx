export default function MessageBubble({ message, isMine }) {
  const time = message.created_date
    ? new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (message.message_type === 'voice' && message.audio_url) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
            isMine
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-secondary text-secondary-foreground rounded-bl-md'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const audio = document.getElementById(`audio-${message.id}`);
                if (audio) {
                  if (audio.paused) audio.play();
                  else audio.pause();
                }
              }}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <audio id={`audio-${message.id}`} src={message.audio_url} className="hidden" />
            <div className="flex items-center gap-0.5 h-6">
              {[3,5,8,6,10,4,7,9,5,3,6,8,4,7,5].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full ${isMine ? 'bg-primary-foreground/60' : 'bg-muted-foreground/60'}`}
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>
          {time && (
            <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
              {time}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (message.message_type === 'call_signal') return null;

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        {time && (
          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}