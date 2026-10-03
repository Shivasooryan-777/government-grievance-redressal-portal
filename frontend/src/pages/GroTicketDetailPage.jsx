import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

/**
 * GroTicketDetailPage
 * Converted faithfully from Stitch export: gro_ticket_detail_view
 * 
 * Features:
 * - Breadcrumb & context navigation
 * - Prominent "REOPENED VIA STATUTORY APPEAL" banner with real citizen statement & appeal reason
 * - Full docket article (Subject, Description, Dept, Asset Tag)
 * - Chronological Resolution Audit Timeline with real resolutionLogs
 * - Official Redressal Determination form with real PATCH /api/gro/grievances/{id}/status call:
 *   - Action taken input
 *   - Officer remarks textarea
 *   - Mandatory 3-way radio status update: In Progress | Resolved | Rejected
 *   - Evaluator State switcher (Form, Loading, Success, Error)
 */
export default function GroTicketDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initialTicket = location.state?.grievance || null;
  const targetGrievanceId =
    location.state?.grievanceId || new URLSearchParams(location.search).get('id') || null;
  const targetTrackingId =
    location.state?.trackingId || new URLSearchParams(location.search).get('trackingId') || null;

  const [ticket, setTicket] = useState(initialTicket);
  const [evaluatorState, setEvaluatorState] = useState(initialTicket ? 'active' : 'loading'); // 'active' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [countdown, setCountdown] = useState(null);

  // Form states
  const [actionTaken, setActionTaken] = useState('');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('RESOLVED'); // 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'

  const fetchTicketFromQueue = async () => {
    if (!ticket) {
      setEvaluatorState('loading');
    }
    setErrorMessage('');
    try {
      const res = await api.get('/api/gro/queue');
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        let matched = null;
        if (targetGrievanceId) {
          matched = list.find((g) => String(g.id) === String(targetGrievanceId));
        }
        if (!matched && targetTrackingId) {
          matched = list.find(
            (g) => (g.trackingId || '').toUpperCase() === targetTrackingId.toUpperCase()
          );
        }
        if (!matched && initialTicket) {
          matched = list.find(
            (g) => g.id === initialTicket.id || g.trackingId === initialTicket.trackingId
          );
        }
        if (!matched && list.length > 0) {
          matched = list[0];
        }

        if (matched) {
          setTicket(matched);
          setEvaluatorState('active');
        } else {
          setErrorMessage(
            'This ticket is not present in your active queue. Resolved or rejected tickets intentionally leave the active queue.'
          );
          setEvaluatorState('error');
        }
      } else {
        setErrorMessage(res.data?.message || 'Failed to retrieve ticket from queue.');
        setEvaluatorState('error');
      }
    } catch (err) {
      console.error('Failed to load queue ticket:', err);
      if (!ticket) {
        setErrorMessage(
          err.response?.data?.message ||
          'Failed to retrieve ticket from departmental queue.'
        );
        setEvaluatorState('error');
      }
    }
  };

  useEffect(() => {
    if (!ticket) {
      fetchTicketFromQueue();
    }
  }, [targetGrievanceId, targetTrackingId]);

  // Handle auto-redirect countdown after successful update
  useEffect(() => {
    let interval;
    if (evaluatorState === 'success') {
      setCountdown(3);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(interval);
            navigate('/gro-dashboard');
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [evaluatorState, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/gro-login');
  };

  const handleDeterminationSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!ticket?.id) return;

    setUpdateError('');
    setEvaluatorState('loading');

    try {
      const payload = {
        status: selectedStatus,
        remarks: officerRemarks.trim(),
        actionTaken: actionTaken.trim(),
      };

      const res = await api.patch(`/api/gro/grievances/${ticket.id}/status`, payload);
      if (res.data && res.data.success) {
        setTicket(res.data.data);
        setEvaluatorState('success');
      } else {
        setUpdateError(res.data?.message || 'Failed to update docket status.');
        setEvaluatorState('error');
      }
    } catch (err) {
      console.error('Failed to commit determination:', err);
      setUpdateError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to commit determination to central ledger. Network handshake timed out.'
      );
      setEvaluatorState('error');
    }
  };

  // Prepare chronological resolution log events
  const logs = ticket?.resolutionLogs || [];
  // Count total events: 1 intake + logs count + (isAppealed ? 1 : 0)
  const totalEventsCount = 1 + logs.length + (ticket?.isAppealed ? 1 : 0);

  const trackingIdDisplay = ticket?.trackingId || (ticket?.id ? `GRV-${ticket.id}` : 'DOCKET-INTAKE');
  const departmentDisplay = ticket?.departmentName || 'Dept of Public Works & Utilities';

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
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/gro-ticket-detail"
              className="flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-surface-container text-secondary font-label-lg rounded-lg"
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

      {/* Main Content Area */}
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
              <span className="font-label-sm text-label-sm">{departmentDisplay}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
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
                <span className="font-label-sm text-label-sm text-on-surface-variant">Officer Grade-I</span>
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

        {/* Page Content */}
        <main className="w-full pt-20 bg-background flex-1 px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            {/* Top Secondary Header & Context Bar */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
              <div className="flex flex-col gap-space-xs">
                <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                  <Link to="/gro-dashboard" className="hover:text-secondary transition-colors">
                    GRO Console
                  </Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <Link to="/gro-dashboard" className="hover:text-secondary transition-colors">
                    Active Queue
                  </Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="font-code-tracking text-code-tracking text-secondary font-semibold">
                    {trackingIdDisplay}
                  </span>
                </nav>
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Docket Dossier & Review
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-surface-container text-secondary">
                    {ticket?.isAppealed ? 'Appellate Review' : 'Statutory Docket'}
                  </span>
                </div>
              </div>

              {/* Evaluator State Preview Switcher Bar */}
              <div className="flex items-center bg-surface-container-low p-1.5 rounded-xl shadow-sm gap-1 self-start md:self-auto">
                <span className="px-2 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">tune</span> State:
                </span>
                <button
                  type="button"
                  onClick={() => setEvaluatorState('active')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    evaluatorState === 'active'
                      ? 'bg-surface-container-lowest text-secondary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Form
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluatorState('loading')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    evaluatorState === 'loading'
                      ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Loading
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluatorState('success')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    evaluatorState === 'success'
                      ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluatorState('error')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    evaluatorState === 'error'
                      ? 'bg-surface-container-lowest text-error shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Error
                </button>
              </div>
            </div>

            {/* Statutory Appeal Alert Banner - Only displays when real isAppealed is true */}
            {ticket?.isAppealed && (
              <section className="w-full bg-surface-container-highest rounded-xl p-space-md mb-space-lg shadow-sm relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-surface-container rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md relative z-10">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-error text-on-error flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-2xl">gavel</span>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <span className="px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm tracking-wider uppercase font-bold">
                          REOPENED VIA STATUTORY APPEAL
                        </span>
                        <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                          Section 19(2) Civic Charter
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface max-w-4xl font-medium">
                        <span className="text-error font-semibold">Citizen Statement:</span> “
                        {ticket.feedback?.appealReason || 'No reason provided'}
                        ”
                      </p>
                      <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant font-label-sm text-label-sm pt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-error">calendar_today</span>
                          Lodged: {formatDateTime(ticket.feedback?.submittedAt || ticket.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-error">assignment_return</span>
                          Escalation Tier: GRO Oversight
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-error">star</span>
                          Citizen Prior Rating:{' '}
                          <strong className="text-on-surface">
                            {ticket.feedback?.rating ? `★ ${ticket.feedback.rating}/5 Stars` : 'Rating not submitted'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-space-xs flex-shrink-0 bg-surface-container-lowest/80 backdrop-blur-sm p-space-sm rounded-lg shadow-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Appeal Window SLA
                    </span>
                    <span className="font-headline-sm text-headline-sm text-error font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">priority_high</span> HIGH PRIORITY
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Expedite mandated</span>
                  </div>
                </div>
              </section>
            )}

            {/* Main Dual-Column Master-Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column: Dossier Details & Timeline (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-code-tracking text-code-tracking bg-surface-container px-2.5 py-1 rounded-md text-secondary font-bold">
                        {trackingIdDisplay}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container flex items-center gap-1">
                        {ticket?.status === 'IN_PROGRESS' && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                        {ticket?.status === 'PENDING' && <span className="material-symbols-outlined text-xs">hourglass_empty</span>}
                        {ticket?.status === 'RESOLVED' && <span className="material-symbols-outlined text-xs">check_circle</span>}
                        {ticket?.status === 'REJECTED' && <span className="material-symbols-outlined text-xs">cancel</span>}
                        <span>{ticket?.status || 'IN_PROGRESS'}</span>
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          ticket?.priority === 'HIGH'
                            ? 'bg-error text-on-error'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {ticket?.priority === 'HIGH' ? 'priority_high' : 'flag'}
                        </span>
                        <span>{ticket?.priority || 'MEDIUM'} Priority</span>
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> Filed:{' '}
                      {formatDateTime(ticket?.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Incident Headline
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                      {ticket?.subject || 'Grievance Dossier'}
                    </h2>
                  </div>

                  {/* Description Box */}
                  <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-secondary uppercase tracking-wider">
                        Citizen Testimonial & Grievance Context
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {ticket?.departmentName || 'Civic Administration'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                      {ticket?.description || 'No detailed citizen description provided.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="flex flex-col p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Designated Department
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-base text-secondary">domain</span>
                        {departmentDisplay}
                      </span>
                    </div>
                    <div className="flex flex-col p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Jurisdiction Classification
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-base text-secondary">pin_drop</span>
                        {ticket?.isAppealed ? 'Appellate Redressal Zone' : 'Standard Municipal Ward'}
                      </span>
                    </div>
                  </div>
                </article>

                {/* Audit Timeline */}
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Resolution Timeline & Statutory Audit
                      </h3>
                    </div>
                    <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                      {totalEventsCount} {totalEventsCount === 1 ? 'Event' : 'Events'} Recorded
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-space-lg before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                    {/* Event: Appeal Reopening (If active appeal) */}
                    {ticket?.isAppealed && (
                      <div className="relative flex flex-col gap-1">
                        <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-error ring-4 ring-error-container" />
                        <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-label-lg text-label-lg font-bold text-on-surface">
                              Appeal Initiated & Case Reopened
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-error-container text-on-error-container">
                              Milestone #{String(totalEventsCount).padStart(2, '0')}
                            </span>
                          </div>
                          <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                            {formatDateTime(ticket.feedback?.submittedAt || ticket.createdAt)}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface font-medium">
                          Lodged by Citizen via Central Web Portal. Assigned directly to GRO Redressal Desk for secondary review.
                        </p>
                        <div className="text-xs text-on-surface-variant mt-1 p-2 bg-surface-container-low rounded">
                          <span className="font-semibold text-on-surface">System Note:</span> Ticket transitioned from{' '}
                          <em className="text-secondary font-semibold">Resolved</em> →{' '}
                          <em className="text-error font-semibold">In Progress (Appealed)</em>.
                        </div>
                      </div>
                    )}

                    {/* Events: Real Resolution Logs in reverse-chronological order */}
                    {[...logs].reverse().map((log, index) => {
                      const milestoneNum = logs.length - index + 1;
                      return (
                        <div key={log.id || index} className="relative flex flex-col gap-1">
                          <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary-fixed" />
                          <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                                {log.actionTaken || 'Supervisory Determination'}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-surface-container text-secondary">
                                Milestone #{String(milestoneNum).padStart(2, '0')}
                              </span>
                            </div>
                            <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                              {formatDateTime(log.loggedAt)}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface">
                            <strong>Officer:</strong> {log.groEmail || 'Grievance Redressal Officer'}
                          </p>
                          {log.remarks && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              <strong>Remarks:</strong> {log.remarks}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Event 1: Initial Grievance Registration */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-surface-container" />
                      <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            Grievance Registration & Auto-Routing
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                            Milestone #01
                          </span>
                        </div>
                        <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                          {formatDateTime(ticket?.createdAt)}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        <strong>Intake Channel:</strong> Central Citizen Web Portal (Tracking #{trackingIdDisplay})
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Auto-assigned to {departmentDisplay}. Initial priority set to {ticket?.priority || 'MEDIUM'}.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: GRO Official Action & Determination Form (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-24">
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col relative overflow-hidden">
                  {/* STATE 1: ACTIVE FORM */}
                  {evaluatorState === 'active' && (
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center justify-between pb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-lg">rate_review</span>
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Official Redressal Determination
                          </h3>
                        </div>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 bg-surface-container text-on-surface-variant rounded font-mono">
                          GRO-SEC-12
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Enter supervisory determination, field orders, and statutory verdict for Citizen Docket{' '}
                        <strong className="text-on-surface font-mono">{trackingIdDisplay}</strong>.
                      </p>

                      <form className="flex flex-col gap-space-md" onSubmit={handleDeterminationSubmit}>
                        {/* Action Taken */}
                        <div className="flex flex-col gap-space-xs">
                          <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between" htmlFor="action-taken">
                            <span>Action Taken</span>
                            <span className="font-body-sm text-body-sm text-outline">Optional (max 255)</span>
                          </label>
                          <input
                            id="action-taken"
                            name="action-taken"
                            type="text"
                            maxLength={255}
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                            placeholder="e.g. Field inspection conducted; replacement part installed..."
                            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 px-space-md py-space-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary font-body-md text-body-md transition-all border border-surface-container-high"
                          />
                          <span className="font-body-sm text-body-sm text-outline">
                            Specific operational interventions initiated or verified.
                          </span>
                        </div>

                        {/* Officer Remarks */}
                        <div className="flex flex-col gap-space-xs">
                          <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between" htmlFor="officer-remarks">
                            <span>Officer Remarks</span>
                            <span className="font-body-sm text-body-sm text-outline">Optional (max 2000)</span>
                          </label>
                          <textarea
                            id="officer-remarks"
                            name="officer-remarks"
                            rows={4}
                            maxLength={2000}
                            value={officerRemarks}
                            onChange={(e) => setOfficerRemarks(e.target.value)}
                            placeholder="e.g. Detailed supervisory notes, technical observations, or citizen outcome summary..."
                            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 p-space-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary font-body-md text-body-md transition-all resize-none border border-surface-container-high"
                          />
                          <span className="font-body-sm text-body-sm text-outline">
                            Detailed commentary visible in citizen dossier and audit trail.
                          </span>
                        </div>

                        {/* Required Status-Update Selection: In Progress | Resolved | Rejected */}
                        <div className="flex flex-col gap-space-xs pt-space-xs">
                          <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
                            <span>Update Docket Status <span className="text-error">*</span></span>
                            <span className="font-label-sm text-label-sm font-semibold uppercase text-secondary">
                              Mandatory Selection
                            </span>
                          </label>
                          <div className="grid grid-cols-3 gap-2 bg-surface-container p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setSelectedStatus('IN_PROGRESS')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'IN_PROGRESS'
                                  ? 'bg-surface-container-lowest shadow-sm text-secondary font-semibold'
                                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg mb-1">pending</span>
                              <span className="font-label-md text-label-md">In Progress</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatus('RESOLVED')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'RESOLVED'
                                  ? 'bg-surface-container-lowest shadow-sm text-secondary font-semibold'
                                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg mb-1">check_circle</span>
                              <span className="font-label-md text-label-md">Resolved</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatus('REJECTED')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'REJECTED'
                                  ? 'bg-surface-container-lowest shadow-sm text-error font-semibold'
                                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg mb-1">cancel</span>
                              <span className="font-label-md text-label-md">Rejected</span>
                            </button>
                          </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low rounded-lg text-on-surface-variant">
                          <span className="material-symbols-outlined text-base text-secondary flex-shrink-0 mt-0.5">
                            verified_user
                          </span>
                          <p className="font-body-sm text-body-sm">
                            Determination will be digitally signed by <strong className="text-on-surface">{user?.email || 'Authenticated Officer'}</strong> and committed to the statutory registry.
                          </p>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="w-full mt-space-xs py-3.5 px-space-md rounded-xl bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-sm shadow-md transition-all transform active:scale-[0.99]"
                        >
                          <span>Save Determination & Update Docket</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* STATE 2: LOADING */}
                  {evaluatorState === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-16 gap-space-md text-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-surface-container border-t-secondary animate-spin" />
                        <span className="material-symbols-outlined text-secondary absolute text-2xl">account_balance</span>
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Committing Official Determination
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Appending signed resolution payload to Central Public Ledger & updating grievance state...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STATE 3: SUCCESS */}
                  {evaluatorState === 'success' && (
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center gap-space-sm p-space-md bg-surface-container-highest rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-secondary flex-shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                            Status Updated Successfully!
                          </span>
                          <span className="font-title-md text-title-md font-bold text-on-surface">
                            Docket {trackingIdDisplay} Marked as {selectedStatus}
                          </span>
                        </div>
                      </div>
                      <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm text-on-surface">
                        <div className="flex items-start gap-space-xs font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">history_edu</span>
                          <span>Timeline entry appended to statutory record with GRO cryptographic timestamp.</span>
                        </div>
                        <div className="flex items-start gap-space-xs font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">mark_email_read</span>
                          <span>Notification and status transition dispatched to citizen.</span>
                        </div>
                        {selectedStatus !== 'IN_PROGRESS' && (
                          <div className="flex items-start gap-space-xs font-body-sm text-body-sm text-secondary font-medium">
                            <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">check</span>
                            <span>This ticket has now departed the active departmental queue.</span>
                          </div>
                        )}
                      </div>

                      {countdown !== null && (
                        <div className="p-space-sm bg-surface-container-low rounded-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                          Returning to dashboard queue in <strong className="text-secondary">{countdown}s</strong>...
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-space-sm pt-space-xs">
                        <button
                          type="button"
                          onClick={() => setEvaluatorState('active')}
                          className="flex-1 py-3 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-all text-center"
                        >
                          Re-edit Determination
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/gro-dashboard')}
                          className="flex-1 py-3 px-space-md rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold transition-all text-center flex items-center justify-center gap-1 shadow-md hover:bg-on-secondary-fixed-variant"
                        >
                          <span>Return to Queue</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATE 4: ERROR */}
                  {evaluatorState === 'error' && (
                    <div className="flex flex-col gap-space-md">
                      <div className="p-space-md bg-error-container text-on-error-container rounded-xl flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-xl">error</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-label-lg text-label-lg font-bold">Action Failed</span>
                          <p className="font-body-sm text-body-sm">
                            {updateError || errorMessage || 'Unable to commit determination to central ledger. Network handshake timed out.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-space-sm">
                        <button
                          type="button"
                          onClick={() => setEvaluatorState('active')}
                          className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold hover:bg-surface-container-high transition-colors"
                        >
                          Retry Determination Input
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/gro-dashboard')}
                          className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-label-md font-bold hover:bg-on-secondary-fixed-variant transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Back to Queue</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
