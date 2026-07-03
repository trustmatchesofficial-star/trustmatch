export default function MessageBubble({ message, isMine }) {
  const time = message.created_date
    ? new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
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