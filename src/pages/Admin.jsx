import { useState, useEffect } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Flag, CheckCircle, XCircle, Users, AlertTriangle, Clock, BadgeCheck, Camera } from 'lucide-react';

export default function Admin() {
  const { profile } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');
  const [selectedSelfie, setSelectedSelfie] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReports, allProfiles, allVerifications] = await Promise.all([
        base44.entities.Report.list('-created_date', 50),
        base44.entities.Profile.list('-created_date', 50),
        base44.entities.VerificationRequest.list('-created_date', 50),
      ]);
      setReports(allReports);
      setProfiles(allProfiles);
      setVerifications(allVerifications);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleReportAction = async (reportId, status) => {
    try {
      await base44.entities.Report.update(reportId, { status });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (profileId, currentActive) => {
    try {
      await base44.entities.Profile.update(profileId, { is_active: !currentActive });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleVerification = async (req, approved) => {
    try {
      await base44.entities.VerificationRequest.update(req.id, {
        status: approved ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
      });
      await base44.entities.Profile.update(req.user_id, { is_verified: approved });
      loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status !== 'pending');
  const activeProfiles = profiles.filter((p) => p.is_active);
  const totalUsers = profiles.length;
  const pendingVerifications = verifications.filter((v) => v.status === 'pending');

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      {selectedSelfie && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedSelfie(null)}>
          <img src={selectedSelfie} alt="Selfie review" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-primary" size={28} />
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users', value: totalUsers, icon: Users },
            { label: 'Pending Reports', value: pendingReports.length, icon: Flag },
            { label: 'Pending Verifications', value: pendingVerifications.length, icon: BadgeCheck },
            { label: 'Resolved Reports', value: resolvedReports.length, icon: Clock },
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
          {[
            { key: 'reports', label: 'Reports', count: pendingReports.length },
            { key: 'verifications', label: 'Verifications', count: pendingVerifications.length },
            { key: 'users', label: 'Users', count: null },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                tab === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
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
              reports.map((report) => {
                const reportedProfile = profiles.find((p) => p.id === report.reported_id);
                return (
                  <div key={report.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-destructive" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {reportedProfile?.full_name || 'Unknown user'}
                          </h3>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                            report.status === 'pending' ? 'bg-accent/20 text-accent-foreground' :
                            report.status === 'resolved' ? 'bg-teal/15 text-teal' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 capitalize">
                          Reason: {report.reason?.replace('_', ' ')}
                        </p>
                        {report.details && (
                          <p className="text-sm text-muted-foreground">{report.details}</p>
                        )}
                        {report.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleReportAction(report.id, 'resolved')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm font-medium hover:bg-teal/25 transition"
                            >
                              <CheckCircle size={14} /> Resolve
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismissed')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:bg-muted transition"
                            >
                              <XCircle size={14} /> Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
                const userProfile = profiles.find((p) => p.id === req.user_id);
                return (
                  <div key={req.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={req.selfie_url}
                        alt="Verification selfie"
                        onClick={() => setSelectedSelfie(req.selfie_url)}
                        className="w-20 h-20 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold truncate flex items-center gap-2">
                            {userProfile?.full_name || 'Unknown user'}
                            {userProfile?.is_verified && <BadgeCheck size={16} className="text-teal" />}
                          </h3>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                            req.status === 'pending' ? 'bg-gold/20 text-gold' :
                            req.status === 'approved' ? 'bg-teal/15 text-teal' :
                            'bg-destructive/15 text-destructive'
                          }`}>
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
                        {req.review_note && (
                          <p className="text-sm text-muted-foreground mb-2">Note: {req.review_note}</p>
                        )}
                        {req.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleVerification(req, true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm font-medium hover:bg-teal/25 transition"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleVerification(req, false)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
                  <h3 className="font-semibold truncate">{p.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{p.age} • {p.location || 'No location'}</p>
                </div>
                {p.is_verified && (
                  <span className="bg-teal/15 text-teal text-xs font-medium px-2 py-0.5 rounded-full">Verified</span>
                )}
                {p.is_premium && (
                  <span className="bg-gold/20 text-gold text-xs font-medium px-2 py-0.5 rounded-full">Premium</span>
                )}
                <button
                  onClick={() => handleToggleActive(p.id, p.is_active)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    p.is_active
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-teal/15 text-teal hover:bg-teal/25'
                  }`}
                >
                  {p.is_active ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}