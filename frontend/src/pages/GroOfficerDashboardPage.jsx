import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

/**
 * GroOfficerDashboardPage
 * Converted faithfully from Stitch export: gro_officer_dashboard
 * 
 * Features:
 * - Officer fixed sidebar with GRO identity credentials & auth state
 * - Top header with department indicator & officer profile
 * - Queue Environment Harness (Active Queue, Cleared Zero-State, Skeleton Pulse, Network Interruption)
 * - 4 Redressal Key KPI Cards (Active Queue, High Escalation, Avg Resolution Time, SLA Met Meter)
 * - Dossier Data Table prioritizing Appealed / Re-Opened tickets at the very top with distinctive visual alert badges
 * - Full integration with real GET /api/gro/queue backend endpoint
 */
export default function GroOfficerDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dockets, setDockets] = useState([]);
  const [queueView, setQueueView] = useState('loading'); // 'default' | 'empty' | 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchQueue = async () => {
    setQueueView('loading');
    setErrorMessage('');
    try {
      const res = await api.get('/api/gro/queue');
      if (res.data && res.data.success) {
        const queue = res.data.data || [];
        setDockets(queue);
        if (queue.length === 0) {
          setQueueView('empty');
        } else {
          setQueueView('default');
        }
      } else {
        setErrorMessage(res.data?.message || 'Failed to retrieve departmental queue.');
        setQueueView('error');
      }
    } catch (err) {
      console.error('Failed to fetch GRO queue:', err);
      setErrorMessage(
        err.response?.data?.message ||
        'Could not synchronize departmental queue with Central State Registry.'
      );
      setQueueView('error');
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/gro-login');
  };

  const activeCount = dockets.length;
  const highOrAppealedCount = dockets.filter((d) => d.priority === 'HIGH' || d.isAppealed).length;

  const filteredDockets = dockets.filter((d) => {
    const q = searchFilter.toLowerCase();
    const id = (d.trackingId || `GRV-${d.id}`).toLowerCase();
    const subj = (d.subject || '').toLowerCase();
    const dept = (d.departmentName || '').toLowerCase();
    const desc = (d.description || '').toLowerCase();
    return id.includes(q) || subj.includes(q) || dept.includes(q) || desc.includes(q);
  });

  // Sort appealed tickets and HIGH-priority tickets to the top
  const sortedDockets = [...filteredDockets].sort((a, b) => {
    if (a.isAppealed && !b.isAppealed) return -1;
    if (!a.isAppealed && b.isAppealed) return 1;
    const pOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const pDiff = (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return 0;
  });

  const departmentName = dockets[0]?.departmentName || 'Public Works & Utilities';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-surface-container-high z-50 flex flex-col justify-between py-space-md">
        <div className="flex flex-col">
          <div className="px-space-md mb-space-lg flex items-center gap-space-sm">
            <img
              alt="CivicPulse Official Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">CivicPulse</span>
              <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Redressal Desk</span>
            </div>
          </div>
          <div className="px-space-md mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Operational Modules</span>
          </div>
          <nav className="flex flex-col px-space-sm gap-space-xs">
            <Link
              to="/gro-dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-surface-container text-secondary font-label-lg rounded-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/gro-ticket-detail"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">inbox</span>
              <span>Grievance Dossiers</span>
            </Link>
            <Link
              to="/track"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">track_changes</span>
              <span>Public Tracking</span>
            </Link>
          </nav>
        </div>
        <div className="px-space-md pt-space-md border-t border-surface-container-high">
          <div className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">National Portal ID</span>
              <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                {user?.userId ? `GRO-OFFICER-00${user.userId}` : 'GRO-DEPT-9042'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high z-40 flex items-center justify-between px-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xs">shield_person</span>
              <span className="font-label-sm text-label-sm">Grievance Redressal Officer (GRO)</span>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-xs">account_balance</span>
              <span className="font-label-sm text-label-sm">{departmentName}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>
            <div className="h-8 w-px bg-surface-container-high" />
            <div className="flex items-center gap-space-sm">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWmIBB930N1Am58db7-V_wCzAHz1LK3DS6P914gr7D4ReOsRRag3KgRklywxQDogF9LWnbcHjASWpUQbLOMx8KdDS4tPJ8tjbGy24tFb4kysn5Cfgs6rYf-6hZx8tTejAzJNMFbLebEUJn6AXPGIsmMMN2eYV_OsyBVXhAMzGvuPj1FNNj1Fljw-9QBeEIpfqHTXQoz0TAZXVlwFkx6L6TeKKIFgLvttaiwbpe7MYMtpqIXHSTA9kF"
              />
              <div className="hidden md:flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                  {user?.email ? user.email.split('@')[0] : 'Officer (GRO)'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Officer Grade-I (GRO)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg border border-outline-variant hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="w-full pt-20 bg-background flex-1 px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            {/* Control & State Evaluation Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-base">tune</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface">Queue Environment Harness</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Switch operational view states for grievance audit demonstration
                  </span>
                </div>
              </div>
              <div className="inline-flex p-1 bg-surface-container-low rounded-lg gap-1">
                <button
                  type="button"
                  onClick={() => setQueueView('default')}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-all ${
                    queueView === 'default'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">checklist</span> Active Queue ({dockets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueView('empty')}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-all ${
                    queueView === 'empty'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">done_all</span> Cleared Zero-State
                </button>
                <button
                  type="button"
                  onClick={() => setQueueView('loading')}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-all ${
                    queueView === 'loading'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">sync</span> Skeleton Pulse
                </button>
                <button
                  type="button"
                  onClick={() => setQueueView('error')}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-all ${
                    queueView === 'error'
                      ? 'bg-error text-on-error shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">wifi_off</span> Network Interruption
                </button>
              </div>
            </div>

            {/* Page Header & Operational Summary */}
            <div className="flex flex-col gap-space-md mb-space-xl">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
                <div className="flex flex-col max-w-3xl">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code-tracking text-code-tracking uppercase">
                      DESK // {departmentName.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping" /> Live Statutory Dispatch
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Department Redressal Queue & Active Dockets
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Official civil service intake console. Prioritized resolution queue sorted by statutory escalation urgency.
                  </p>
                </div>

                {/* Quick Action Desk Bar */}
                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">calendar_today</span>
                    <span className="font-label-md text-label-md text-on-surface">Statutory Cycle: Active Queue</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchQueue}
                    className="flex items-center gap-1.5 bg-primary text-on-primary px-space-md py-space-sm rounded-xl font-label-lg text-label-lg shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span> Refresh Queue
                  </button>
                </div>
              </div>

              {/* 4 Redressal Key KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-sm">
                {/* Card 1: Active Queue */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Active Queue</span>
                    <span className="material-symbols-outlined text-secondary text-2xl">pending_actions</span>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-display-hero text-display-hero text-on-surface">{activeCount}</span>
                    <span className="font-label-lg text-label-lg text-on-surface-variant">dockets</span>
                  </div>
                  <div className="mt-space-md flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-base text-secondary">assignment_turned_in</span>
                    <span>Requires officer triage</span>
                  </div>
                </div>

                {/* Card 2: Escalations & Appeals */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden ring-2 ring-error/20">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-error font-bold">
                      High Escalation / Appealed
                    </span>
                    <span className="material-symbols-outlined text-error text-2xl animate-bounce">priority_high</span>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-display-hero text-display-hero text-error">{highOrAppealedCount}</span>
                    <span className="font-label-lg text-label-lg text-error font-semibold">critical dockets</span>
                  </div>
                  <div className="mt-space-md flex items-center gap-1 text-error font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-base">emergency_home</span>
                    <span>Top priority re-investigation</span>
                  </div>
                </div>

                {/* Card 3: Resolution Time */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Average Resolution
                    </span>
                    <span className="material-symbols-outlined text-secondary text-2xl">timer</span>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">
                      Not available
                    </span>
                  </div>
                  <div className="mt-space-md flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-outline">Active queue excludes resolved tickets</span>
                  </div>
                </div>

                {/* Card 4: SLA Met */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Statutory SLA Met
                    </span>
                    <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">
                      Not available
                    </span>
                  </div>
                  <div className="mt-space-md flex items-center gap-1 text-outline font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-base text-outline">info</span>
                    <span>Historical resolution data excluded from active queue</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIEW: Skeleton Loading Pulse */}
            {queueView === 'loading' && (
              <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="h-8 w-64 bg-surface-container-high rounded animate-pulse" />
                <div className="space-y-4 pt-4">
                  <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                  <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                  <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                  <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                </div>
              </div>
            )}

            {/* VIEW: Network Error Banner */}
            {queueView === 'error' && (
              <div className="w-full bg-error-container text-on-error-container p-space-lg rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-3xl text-error">wifi_off</span>
                  <div>
                    <h4 className="font-title-md font-bold">Network Connection Interrupted</h4>
                    <p className="font-body-sm mt-0.5">
                      {errorMessage || 'Could not synchronize departmental queue with Central State Registry.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchQueue}
                  className="px-space-md py-space-sm rounded-lg bg-on-error-container text-error-container font-label-md font-bold hover:opacity-90 transition-opacity"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* VIEW: Cleared Zero-State */}
            {queueView === 'empty' && (
              <div className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-20 gap-space-md">
                <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-5xl">done_all</span>
                </div>
                <div className="max-w-md">
                  <h3 className="font-headline-md font-bold text-on-surface">Queue Cleared - Zero Pending Dockets</h3>
                  <p className="font-body-md text-on-surface-variant mt-1">
                    All departmental grievance dockets within this statutory cycle have been processed or escalated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchQueue}
                  className="px-space-lg py-space-sm rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Refresh Queue</span>
                </button>
              </div>
            )}

            {/* VIEW: Default Active Queue Table */}
            {queueView === 'default' && (
              <div className="flex flex-col gap-space-md">
                {/* Search & Sort Breadth */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm flex-1 max-w-md bg-surface-container-low px-space-md py-2 rounded-lg">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter by Docket ID, department, or grievance subject..."
                      className="bg-transparent border-0 outline-none w-full text-on-surface font-body-md text-body-md placeholder:text-outline"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">
                      <span className="material-symbols-outlined text-base">sort</span>
                      <span>Order: <strong className="text-on-surface">Appeals First (Statutory Urgency)</strong></span>
                    </div>
                  </div>
                </div>

                {/* Dossier Table */}
                <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1020px]">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                          <th className="py-space-md px-space-lg w-44">Tracking ID</th>
                          <th className="py-space-md px-space-md min-w-[280px]">Subject & Civil Summary</th>
                          <th className="py-space-md px-space-md w-52">Department</th>
                          <th className="py-space-md px-space-md w-32">Priority</th>
                          <th className="py-space-md px-space-md w-36">Status</th>
                          <th className="py-space-md px-space-md w-32">Submitted</th>
                          <th className="py-space-md px-space-md w-56">Escalation Indicator</th>
                          <th className="py-space-md px-space-lg text-right w-44">Operational Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                        {sortedDockets.map((row) => (
                          <tr
                            key={row.id || row.trackingId}
                            onClick={() =>
                              navigate('/gro-ticket-detail', {
                                state: { grievanceId: row.id, trackingId: row.trackingId, grievance: row },
                              })
                            }
                            className={`transition-colors cursor-pointer group ${
                              row.isAppealed ? 'bg-error-container/30 hover:bg-error-container/50' : 'hover:bg-surface-container-low/70'
                            }`}
                          >
                            <td className="py-space-lg px-space-lg">
                              <div className="flex flex-col">
                                <span className="font-code-tracking text-code-tracking font-bold text-on-surface flex items-center gap-1">
                                  {row.isAppealed && <span className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                                  {row.trackingId || `GRV-${row.id}`}
                                </span>
                                <span className={`font-label-sm text-label-sm font-semibold mt-0.5 ${row.isAppealed ? 'text-error' : 'text-on-surface-variant'}`}>
                                  {row.isAppealed ? 'Statutory Escalated' : 'Civil Intake'}
                                </span>
                              </div>
                            </td>
                            <td className="py-space-lg px-space-md">
                              <div className="flex flex-col gap-1 max-w-md">
                                <div className="flex items-center gap-2">
                                  {row.isAppealed && (
                                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error text-on-error font-bold tracking-wide">
                                      URGENT APPELLATE
                                    </span>
                                  )}
                                  <span className="font-title-md text-title-md font-semibold text-on-surface">
                                    {row.subject}
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                                  {row.description || 'No detailed citizen description provided.'}
                                </p>
                              </div>
                            </td>
                            <td className="py-space-lg px-space-md">
                              <div className="flex flex-col">
                                <span className="font-label-lg text-label-lg text-on-surface">
                                  {row.departmentName || 'General Grievance Desk'}
                                </span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {row.isAppealed ? 'First Appellate Division' : 'Municipal Jurisdiction'}
                                </span>
                              </div>
                            </td>
                            <td className="py-space-lg px-space-md">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                                  row.priority === 'HIGH'
                                    ? 'bg-error-container text-error'
                                    : row.priority === 'MEDIUM'
                                    ? 'bg-surface-container text-on-surface-variant'
                                    : 'bg-surface-container-low text-outline'
                                }`}
                              >
                                {row.priority === 'HIGH' && <span className="material-symbols-outlined text-sm">priority_high</span>}
                                {row.priority}
                              </span>
                            </td>
                            <td className="py-space-lg px-space-md">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                                {row.status === 'IN_PROGRESS' && <span className="material-symbols-outlined text-sm animate-spin">refresh</span>}
                                {row.status === 'PENDING' && <span className="material-symbols-outlined text-sm text-outline">hourglass_empty</span>}
                                {row.status}
                              </span>
                            </td>
                            <td className="py-space-lg px-space-md">
                              <div className="flex flex-col font-body-sm text-body-sm text-on-surface">
                                <span>{formatDate(row.createdAt)}</span>
                                <span className={`font-label-sm text-label-sm font-semibold ${row.isAppealed ? 'text-error' : 'text-on-surface-variant'}`}>
                                  {row.isAppealed ? 'Immediate Priority' : 'Standard SLA'}
                                </span>
                              </div>
                            </td>
                            <td className="py-space-lg px-space-md">
                              {row.isAppealed ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error text-on-error font-label-sm text-label-sm shadow-sm ring-4 ring-error/20 animate-pulse">
                                  <span className="text-sm font-bold">🔥</span>
                                  <span className="tracking-wide uppercase font-extrabold">RE-OPENED VIA APPEAL</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                                  <span className="material-symbols-outlined text-xs text-outline">description</span>
                                  Standard Docket
                                </span>
                              )}
                            </td>
                            <td className="py-space-lg px-space-lg text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/gro-ticket-detail', {
                                    state: { grievanceId: row.id, trackingId: row.trackingId, grievance: row },
                                  });
                                }}
                                className={`inline-flex items-center justify-end gap-1 px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-all ${
                                  row.isAppealed
                                    ? 'bg-error text-on-error hover:opacity-95 shadow-sm'
                                    : 'bg-surface-container text-secondary hover:bg-secondary hover:text-on-secondary'
                                }`}
                              >
                                <span>Inspect Docket</span>
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
