import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin, Users, Check, Clock, Plus, X } from 'lucide-react';

export default function Events() {
  const { profile } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [myRSVPs, setMyRSVPs] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [blockIds, setBlockIds] = useState([]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const all = await base44.entities.Event.list('-date_time', 50);
      const now = new Date();
      const upcoming = all.filter((e) => new Date(e.date_time) >= now);
      setEvents(upcoming);

      // Load all attendees for these events
      const attendeeMap = {};
      const rsvpMap = {};
      await Promise.all(upcoming.map(async (event) => {
        const att = await base44.entities.EventAttendee.filter({ event_id: event.id });
        attendeeMap[event.id] = att;
        const mine = att.find((a) => a.user_id === profile.created_by_id);
        if (mine) rsvpMap[event.id] = mine;
      }));
      setAttendees(attendeeMap);
      setMyRSVPs(rsvpMap);

      // Load blocks for privacy filtering
      const myBlocks = await base44.entities.Block.filter({ blocker_id: profile.created_by_id });
      setBlockIds(myBlocks.map((b) => b.blocked_id));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleRSVP = async (eventId, status) => {
    try {
      const existing = myRSVPs[eventId];
      if (existing) {
        const updated = await base44.entities.EventAttendee.update(existing.id, { rsvp_status: status });
        setMyRSVPs((prev) => ({ ...prev, [eventId]: updated }));
        setAttendees((prev) => ({
          ...prev,
          [eventId]: prev[eventId].map((a) => (a.id === updated.id ? updated : a)),
        }));
      } else {
        const created = await base44.entities.EventAttendee.create({
          event_id: eventId,
          user_id: profile.created_by_id,
          rsvp_status: status,
        });
        setMyRSVPs((prev) => ({ ...prev, [eventId]: created }));
        setAttendees((prev) => ({ ...prev, [eventId]: [...(prev[eventId] || []), created] }));
      }
    } catch (err) { console.error(err); }
  };

  const handleCheckIn = async (eventId) => {
    const rsvp = myRSVPs[eventId];
    if (!rsvp) return;
    try {
      const updated = await base44.entities.EventAttendee.update(rsvp.id, {
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      });
      setMyRSVPs((prev) => ({ ...prev, [eventId]: updated }));
      setAttendees((prev) => ({
        ...prev,
        [eventId]: prev[eventId].map((a) => (a.id === updated.id ? updated : a)),
      }));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={26} />
            <h1 className="text-2xl font-heading font-bold">Events</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition"
          >
            <Plus size={16} /> Create
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="text-muted-foreground mx-auto mb-3" size={36} />
            <p className="text-muted-foreground mb-2">No upcoming events.</p>
            <p className="text-sm text-muted-foreground">Create one to bring people together!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventAttendees = attendees[event.id] || [];
              const myRSVP = myRSVPs[event.id];
              const isGoing = myRSVP?.rsvp_status === 'going' || myRSVP?.rsvp_status === 'maybe';

              // Filter attendee list for privacy — exclude blocked users
              const visibleAttendees = eventAttendees.filter((a) => !blockIds.includes(a.user_id));
              const goingCount = eventAttendees.filter((a) => a.rsvp_status === 'going').length;
              const checkedIn = myRSVP?.checked_in;

              return (
                <div key={event.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  {event.cover_image && (
                    <img src={event.cover_image} alt={event.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-heading font-bold mb-1">{event.title}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {new Date(event.date_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> {goingCount} going
                        {event.max_attendees && ` / ${event.max_attendees}`}
                      </span>
                    </div>

                    {/* RSVP buttons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {!isGoing ? (
                        <>
                          <button
                            onClick={() => handleRSVP(event.id, 'going')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
                          >
                            <Check size={14} /> Going
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'maybe')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-secondary transition"
                          >
                            Maybe
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRSVP(event.id, 'not_going')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-muted-foreground text-sm font-medium hover:bg-secondary transition"
                        >
                          <X size={14} /> Cancel RSVP
                        </button>
                      )}
                    </div>

                    {/* Check in button (only if going and event day is near) */}
                    {isGoing && !checkedIn && (
                      <button
                        onClick={() => handleCheckIn(event.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal/10 border border-teal/30 text-teal text-sm font-semibold hover:bg-teal/20 transition mb-3"
                      >
                        <Check size={16} /> Check In
                      </button>
                    )}
                    {checkedIn && (
                      <div className="flex items-center gap-2 text-teal text-sm font-medium mb-3">
                        <Check size={16} /> Checked in
                      </div>
                    )}

                    {/* Attendee list (privacy-filtered) */}
                    {visibleAttendees.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Who's going</p>
                        <div className="flex flex-wrap gap-1.5">
                          {visibleAttendees.slice(0, 10).map((a) => (
                            <span key={a.id} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-xs">
                              {a.checked_in && <Check size={10} className="text-teal" />}
                              {a.rsvp_status === 'going' ? 'Going' : a.rsvp_status === 'maybe' ? 'Maybe' : 'Not going'}
                            </span>
                          ))}
                          {visibleAttendees.length > 10 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">+{visibleAttendees.length - 10} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateEventModal
          profile={profile}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateEventModal({ profile, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    max_attendees: 50,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.date_time || !form.location) return;
    setSaving(true);
    try {
      await base44.entities.Event.create({
        ...form,
        date_time: new Date(form.date_time).toISOString(),
        max_attendees: Number(form.max_attendees) || 50,
      });
      onCreated();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-t-3xl md:rounded-3xl border border-border max-w-md w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Create Event</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">✕</button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <input
            type="datetime-local"
            value={form.date_time}
            onChange={(e) => setForm({ ...form, date_time: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location"
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            value={form.max_attendees}
            onChange={(e) => setForm({ ...form, max_attendees: e.target.value })}
            placeholder="Max attendees"
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full mt-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </div>
  );
}