import { useState, useEffect } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Flag, CheckCircle, XCircle, Users, AlertTriangle, Clock } from 'lucide-react';

export default function Admin() {
  const { profile } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReports, allProfiles] = await Promise.all([
        base44.entities.Report.list('-created_date', 50),
        base44.entities.Profile.list('-created_date', 50),
      ]);
      setReports(allReports);
      setProfiles(allProfiles);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status !== 'pending');
  const activeProfiles = profiles.filter((p) => p.is_active);
  const totalUsers = profiles.length;

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
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
            { label: 'Active Profiles', value: activeProfiles.length, icon: CheckCircle },
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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('reports')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === 'reports' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === 'users' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Users
          </button>
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-teal/25 transition"
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
                  <span className="bg-accent/20 text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">Verified</span>
                )}
                {p.is_premium && (
                  <span className="bg-accent/20 text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">Premium</span>
                )}
                <button
                  onClick={() => handleToggleActive(p.id, p.is_active)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    p.is_active
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-green-100 text-green-700 hover:bg-teal/25'
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