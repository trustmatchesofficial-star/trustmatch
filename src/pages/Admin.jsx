import { useState, useEffect } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Shield, Flag, CheckCircle, XCircle, Users, AlertTriangle, Clock, BadgeCheck,
  IdCard, MessageSquareWarning, Ban, UserX, UserCheck, ShieldAlert,
} from 'lucide-react';
import TrustScoreBadge from '@/components/TrustScoreBadge';

export default function Admin() {
  const { profile } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');
  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReports, allProfiles, allVerifications] = await Promise.all([
        base44.entities.Report.list('-created_date', 100),
        base44.entities.Profile.list('-created_date', 100),
        base44.entities.VerificationRequest.list('-created_date', 100),
      ]);
      setReports(allReports);
      setProfiles(allProfiles);
      setVerifications(allVerifications);

      const flagged = allReports.filter((r) => r.message_id);
      const msgMap = {};
      await Promise.all(
        flagged.map(async (r) => {
          try { msgMap[r.message_id] = await base44.entities.Message.get(r.message_id); } catch {}
        })
      );
      setMessages(msgMap);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (profile?.role !== 'admin' && !profile) return null;

  const handleVerification = async (req, approved) => {
    try {
      await base44.entities.VerificationRequest.update(req.id, {
        status: approved ? 'approved' : 'rejected',
        review_note: notes[req.id] || undefined,
        reviewed_at: new Date().toISOString(),
      });
      const userProfile = profiles.find((p) => p.created_by_id === req.user_id);
      if (userProfile) {
        await base44.entities.Profile.update(userProfile.id, { is_verified: approved, trust_score: approved ? 85 : 30 });
      }
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleReportAction = async (report, action) => {
    try {
      const reportedProfile = profiles.find((p) => p.id === report.reported_id);
      if (action === 'dismiss') {
        await base44.entities.Report.update(report.id, { status: 'dismissed', action_taken: 'none' });
      } else if (action === 'warn') {
        await base44.entities.Report.update(report.id, { status: 'resolved', action_taken: 'warned' });
      } else if (action === 'suspend' && reportedProfile) {
        await base44.entities.Report.update(report.id, { status: 'resolved', action_taken: 'suspended' });
        await base44.entities.Profile.update(reportedProfile.id, { account_status: 'suspended', is_active: false, trust_score: 20 });
      } else if (action === 'ban' && reportedProfile) {
        await base44.entities.Report.update(report.id, { status: 'resolved', action_taken: 'banned' });
        await base44.entities.Profile.update(reportedProfile.id, { account_status: 'banned', is_active: false, trust_score: 5 });
      }
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleUserStatus = async (profileId, status) => {
    try {
      await base44.entities.Profile.update(profileId, {
        account_status: status,
        is_active: status === 'active',
        trust_score: status === 'active' ? 55 : status === 'suspended' ? 20 : 5,
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingVerifications = verifications.filter((v) => v.status === 'pending');
  const flaggedReports = reports.filter((r) => r.message_id || r.reason === 'scam' || r.reason === 'safety_concern');
  const suspendedCount = profiles.filter((p) => p.account_status === 'suspended' || p.account_status === 'banned').length;

  const tabs = [
    { key: 'reports', label: 'Reports', count: pendingReports.length, icon: Flag },
    { key: 'verifications', label: 'Verifications', count: pendingVerifications.length, icon: BadgeCheck },
    { key: 'flagged', label: 'Flagged Messages', count: flaggedReports.length, icon: MessageSquareWarning },
    { key: 'users', label: 'Users', count: null, icon: Users },
  ];

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-gold/20 text-gold',
      reviewing: 'bg-accent/20 text-accent-foreground',
      resolved: 'bg-teal/15 text-teal',
      dismissed: 'bg-secondary text-muted-foreground',
      approved: 'bg-teal/15 text-teal',
      rejected: 'bg-destructive/15 text-destructive',
    };
    return map[status] || 'bg-secondary text-muted-foreground';
  };

  const renderReport = (report) => {
    const reportedProfile = profiles.find((p) => p.id === report.reported_id);
    const reporterProfile = profiles.find((p) => p.id === report.reporter_id);
    const msg = report.message_id ? messages[report.message_id] : null;
    return (
      <div key={report.id} className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-destructive" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate flex items-center gap-2">
                {reportedProfile?.full_name || 'Unknown user'}
                {reportedProfile && <TrustScoreBadge profile={reportedProfile} size="sm" />}
              </h3>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${statusBadge(report.status)}`}>
                {report.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1 capitalize">
              Reason: <span className="font-medium text-foreground">{report.reason?.replace('_', ' ')}</span>
              {report.action_taken && report.action_taken !== 'none' && (
                <span className="ml-2 text-xs">· action: {report.action_taken}</span>
              )}
            </p>
            {reporterProfile && (
              <p className="text-xs text-muted-foreground">Reported by {reporterProfile.full_name}</p>
            )}
            {report.details && <p className="text-sm text-muted-foreground mt-1">{report.details}</p>}
            {msg && (
              <div className="mt-2 bg-secondary/50 border border-border rounded-xl p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Flagged message</p>
                <p className="text-sm text-foreground">{msg.content}</p>
              </div>
            )}
            {report.status === 'pending' && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => handleReportAction(report, 'warn')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold text-sm font-medium hover:bg-gold/25 transition">
                  <AlertTriangle size={14} /> Warn
                </button>
                <button onClick={() => handleReportAction(report, 'suspend')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent-foreground text-sm font-medium hover:bg-accent/30 transition">
                  <UserX size={14} /> Suspend
                </button>
                <button onClick={() => handleReportAction(report, 'ban')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive text-sm font-medium hover:bg-destructive/25 transition">
                  <Ban size={14} /> Ban
                </button>
                <button onClick={() => handleReportAction(report, 'dismiss')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:bg-muted transition">
                  <XCircle size={14} /> Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Review" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="text-primary" size={28} />
          <h1 className="text-3xl font-heading font-bold">Trust &amp; Safety</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Users', value: profiles.length, icon: Users },
            { label: 'Open Reports', value: pendingReports.length, icon: Flag },
            { label: 'Verifications', value: pendingVerifications.length, icon: BadgeCheck },
            { label: 'Flagged Msgs', value: flaggedReports.length, icon: MessageSquareWarning },
            { label: 'Suspended', value: suspendedCount, icon: UserX },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="text-muted-foreground" size={18} />
                <span className="text-2xl font-heading font-bold">{value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                tab === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Icon size={15} /> {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-primary-foreground/20' : 'bg-primary text-primary-foreground'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="text-muted-foreground mx-auto mb-3" size={36} />
                <p className="text-muted-foreground">No reports to review.</p>
              </div>
            ) : (
              reports.map(renderReport)
            )}
          </div>
        )}

        {/* Verifications */}
        {tab === 'verifications' && (
          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="text-center py-16">
                <BadgeCheck className="text-muted-foreground mx-auto mb-3" size={36} />
                <p className="text-muted-foreground">No verification requests.</p>
              </div>
            ) : (
              verifications.map((req) => {
                const userProfile = profiles.find((p) => p.created_by_id === req.user_id);
                return (
                  <div key={req.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex gap-2 shrink-0">
                        <img
                          src={req.selfie_url}
                          alt="Selfie"
                          onClick={() => setSelectedImage(req.selfie_url)}
                          className="w-20 h-20 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition"
                        />
                        {req.id_photo_url ? (
                          <img
                            src={req.id_photo_url}
                            alt="ID"
                            onClick={() => setSelectedImage(req.id_photo_url)}
                            className="w-20 h-20 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition border border-border"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                            <IdCard className="text-muted-foreground" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold truncate flex items-center gap-2">
                            {userProfile?.full_name || 'Unknown user'}
                            {userProfile?.is_verified && <BadgeCheck size={16} className="text-teal" />}
                          </h3>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${statusBadge(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        {userProfile && (
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={userProfile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100`}
                              alt={userProfile.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-muted-foreground">{userProfile.age} • {userProfile.location || 'No location'}</span>
                          </div>
                        )}
                        {req.review_note && <p className="text-sm text-muted-foreground mb-2">Note: {req.review_note}</p>}
                        {req.status === 'pending' && (
                          <>
                            <input
                              type="text"
                              value={notes[req.id] || ''}
                              onChange={(e) => setNotes((n) => ({ ...n, [req.id]: e.target.value }))}
                              placeholder="Review note (optional)"
                              className="w-full mb-2 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleVerification(req, true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm font-medium hover:bg-teal/25 transition">
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button onClick={() => handleVerification(req, false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition">
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Flagged Messages */}
        {tab === 'flagged' && (
          <div className="space-y-3">
            {flaggedReports.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquareWarning className="text-muted-foreground mx-auto mb-3" size={36} />
                <p className="text-muted-foreground">No flagged messages.</p>
              </div>
            ) : (
              flaggedReports.map(renderReport)
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-2">
            {profiles.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <img
                  src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100`}
                  alt={p.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate flex items-center gap-2">
                    {p.full_name}
                    {p.is_verified && <BadgeCheck size={15} className="text-teal shrink-0" />}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{p.age} • {p.location || 'No location'}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      p.account_status === 'active' ? 'bg-teal/15 text-teal' :
                      p.account_status === 'suspended' ? 'bg-gold/20 text-gold' :
                      'bg-destructive/15 text-destructive'
                    }`}>{p.account_status || 'active'}</span>
                  </div>
                </div>
                <TrustScoreBadge profile={p} size="sm" />
                {p.account_status === 'active' ? (
                  <button onClick={() => handleUserStatus(p.id, 'suspended')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition">
                    <UserX size={14} /> Suspend
                  </button>
                ) : (
                  <button onClick={() => handleUserStatus(p.id, 'active')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm font-medium hover:bg-teal/25 transition">
                    <UserCheck size={14} /> Reactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}