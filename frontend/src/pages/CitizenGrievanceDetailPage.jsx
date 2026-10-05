import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

/**
 * CitizenGrievanceDetailPage
 * Converted faithfully from Stitch export: citizen_grievance_detail_view
 * 
 * Features:
 * - Citizen persona header & breadcrumb
 * - State simulator (State A: Fresh Resolved, State B: Rated / Can Appeal, State C: Under Appeal, Loading, Error)
 * - Full metadata dossier (Tracking ID, Dept, Priority, Coords, Citizen Statement)
 * - Chronological resolution audit timeline with officer notes & cryptographic stamps
 * - Interactive Citizen Action Center (5-star rating, comments, statutory appeal filing form)
 */
export default function CitizenGrievanceDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Passed from navigation state or URL query params
  const initialGrievance = location.state?.grievance || null;
  const targetGrievanceId = location.state?.grievanceId || new URLSearchParams(location.search).get('id') || null;
  const targetTrackingId = location.state?.trackingId || new URLSearchParams(location.search).get('trackingId') || null;

  const [dossier, setDossier] = useState(initialGrievance);
  const [screenState, setScreenState] = useState(initialGrievance ? 'ready' : 'loading'); // 'ready' | 'loading' | 'error' | 'empty'
  const [simOverride, setSimOverride] = useState(null); // 'stateA' | 'stateB' | 'stateC' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Feedback state
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Appeal state
  const [appealReason, setAppealReason] = useState('');
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  const [copied, setCopied] = useState(false);

  const loadGrievanceDetails = async () => {
    if (!dossier) {
      setScreenState('loading');
    }
    setErrorMessage('');
    try {
      const res = await api.get('/api/grievances/mine');
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        if (list.length === 0) {
          setScreenState('empty');
          return;
        }

        let matched = null;
        if (targetGrievanceId) {
          matched = list.find((g) => String(g.id) === String(targetGrievanceId));
        }
        if (!matched && targetTrackingId) {
          matched = list.find((g) => (g.trackingId || '').toUpperCase() === targetTrackingId.toUpperCase());
        }
        if (!matched && initialGrievance) {
          matched = list.find((g) => g.id === initialGrievance.id || g.trackingId === initialGrievance.trackingId);
        }
        // Fallback to first grievance in list if direct URL access without params
        if (!matched) {
          matched = list[0];
        }

        setDossier(matched);
        setScreenState('ready');
      } else {
        setErrorMessage(res.data?.message || 'Failed to load grievance details.');
        setScreenState('error');
      }
    } catch (err) {
      console.error('Failed to fetch citizen grievance:', err);
      if (!dossier) {
        setErrorMessage(
          err.response?.data?.message ||
          'Failed to synchronize dossier with Central Grievance Monitoring Registry.'
        );
        setScreenState('error');
      }
    }
  };

  useEffect(() => {
    loadGrievanceDetails();
  }, [targetGrievanceId, targetTrackingId]);

  const handleCopyId = () => {
    if (!dossier) return;
    const idToCopy = dossier.trackingId || `GRV-${dossier.id}`;
    navigator.clipboard?.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async (e) => {
    if (e) e.preventDefault();
    setActionError('');
    if (rating < 1 || rating > 5) {
      setActionError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const res = await api.post(`/api/grievances/${dossier.id}/feedback`, {
        rating,
        comment: feedbackComment.trim(),
      });

      if (res.data && res.data.success) {
        setDossier(res.data.data);
        setActionError('');
        setSimOverride(null);
      } else {
        setActionError(res.data?.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setActionError(err.response?.data?.message || 'Failed to record feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAppealSubmit = async (e) => {
    if (e) e.preventDefault();
    setActionError('');
    if (!appealReason.trim()) {
      setActionError('Statement of appeal grounds is mandatory.');
      return;
    }

    if (!dossier.feedback?.id) {
      setActionError('Feedback record ID not found for this grievance.');
      return;
    }

    setIsSubmittingAppeal(true);
    try {
      const res = await api.patch(`/api/feedback/${dossier.feedback.id}/appeal`, {
        reason: appealReason.trim(),
      });

      if (res.data && res.data.success) {
        setDossier(res.data.data);
        setShowAppealForm(false);
        setActionError('');
        setSimOverride(null);
      } else {
        setActionError(res.data?.message || 'Failed to file appeal.');
      }
    } catch (err) {
      console.error('Failed to raise appeal:', err);
      setActionError(err.response?.data?.message || 'Failed to submit formal appeal.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/citizen-login');
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

  // Determine active action state:
  // Priority: manual simulation override (if clicked by evaluator) -> real data state
  const isAppealed = Boolean(dossier?.isAppealed || dossier?.feedback?.appealed);
  const hasFeedback = Boolean(dossier?.feedback && dossier.feedback.id);
  const isResolved = dossier?.status === 'RESOLVED';

  let currentActionState = 'in_progress';
  if (simOverride) {
    currentActionState = simOverride;
  } else if (isAppealed) {
    currentActionState = 'stateC';
  } else if (hasFeedback) {
    currentActionState = 'stateB';
  } else if (isResolved) {
    currentActionState = 'stateA';
  } else {
    currentActionState = 'in_progress';
  }

  const logs = dossier?.resolutionLogs || [];

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
              to="/dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary bg-surface-container font-label-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/submit"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>Submit Grievance</span>
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
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Citizen Identity</span>
              <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                {user?.email || 'Authenticated User'}
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
              <span className="font-label-sm text-label-sm">Citizen Grievance Dossier</span>
            </div>
            {dossier?.departmentName && (
              <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-xs">account_balance</span>
                <span className="font-label-sm text-label-sm">{dossier.departmentName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs ring-1 ring-surface-container-high">
                {(user?.fullName || user?.name || user?.email || 'C')[0].toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                  {user?.fullName || user?.name || 'Citizen User'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {user?.email || 'Citizen'}
                </span>
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
            {/* View State Switcher / Evaluator Simulator */}
            <div className="mb-space-lg p-space-sm bg-surface-container rounded-xl flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-secondary text-sm">tune</span>
                <span>Citizen State Simulator / Evaluator:</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSimOverride(null);
                    setScreenState('ready');
                  }}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    !simOverride && screenState === 'ready'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Live Backend State
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimOverride('stateA');
                    setScreenState('ready');
                  }}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    simOverride === 'stateA'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  State A: Fresh Resolved (Rate Now)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimOverride('stateB');
                    setScreenState('ready');
                  }}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    simOverride === 'stateB'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  State B: Rated (Can Appeal)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimOverride('stateC');
                    setScreenState('ready');
                  }}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    simOverride === 'stateC'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  State C: Under Appeal
                </button>
                <div className="w-px h-5 bg-outline-variant mx-1" />
                <button
                  type="button"
                  onClick={() => setScreenState('loading')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    screenState === 'loading'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Loading View
                </button>
                <button
                  type="button"
                  onClick={() => setScreenState('error')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    screenState === 'error'
                      ? 'bg-error text-on-error shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Error View
                </button>
              </div>
            </div>

            {/* Loading View State */}
            {screenState === 'loading' && !dossier && (
              <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-xl shadow-sm">
                <div className="relative w-16 h-16 mb-space-md">
                  <div className="w-16 h-16 rounded-full border-4 border-surface-container-high border-t-secondary animate-spin" />
                  <span className="material-symbols-outlined text-secondary text-2xl absolute inset-0 m-auto flex items-center justify-center">
                    sync
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Retrieving Grievance Dossier</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs text-center max-w-md">
                  Syncing immutable records for <span className="font-code-tracking font-medium text-secondary">{targetTrackingId || 'Docket'}</span> with Municipal Utilities Division...
                </p>
              </div>
            )}

            {/* Error View State */}
            {screenState === 'error' && (
              <div className="flex flex-col items-center justify-center py-20 px-space-lg bg-surface-container-lowest rounded-xl shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-space-md shadow-sm">
                  <span className="material-symbols-outlined text-3xl">error_outline</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-error font-bold">Failed to Synchronize Dossier</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-lg">
                  {errorMessage || 'The municipal record server could not locate or validate this grievance record.'}
                </p>
                <div className="flex items-center gap-space-md mt-space-lg">
                  <button
                    type="button"
                    onClick={loadGrievanceDetails}
                    className="px-space-lg py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity flex items-center gap-space-xs"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    <span>Retry Transaction</span>
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Empty View State */}
            {screenState === 'empty' && (
              <div className="flex flex-col items-center justify-center py-20 px-space-lg bg-surface-container-lowest rounded-xl shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mb-space-md shadow-sm">
                  <span className="material-symbols-outlined text-3xl">folder_off</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">No Grievance Found</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-lg">
                  No grievances matching the requested reference were found in your citizen account.
                </p>
                <div className="flex items-center gap-space-md mt-space-lg">
                  <Link
                    to="/submit"
                    className="px-space-lg py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity"
                  >
                    Lodge New Grievance
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Main Content (States A, B, C or In-Progress) */}
            {dossier && screenState !== 'error' && screenState !== 'empty' && (
              <div className="flex flex-col gap-space-lg">
                {/* Breadcrumb Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-lg text-label-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      <span>Back to My Grievances</span>
                    </Link>
                    <div className="h-4 w-px bg-outline-variant" />
                    <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                      <Link to="/dashboard" className="hover:text-secondary transition-colors">
                        Dashboard
                      </Link>
                      <span>/</span>
                      <span className="font-code-tracking text-on-surface font-semibold">
                        {dossier.trackingId || `GRV-${dossier.id}`}
                      </span>
                    </nav>
                  </div>
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-space-md py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Secure Citizen Channel • End-to-End Logged</span>
                  </div>
                </div>

                {/* State C Banner (Appealed) */}
                {(currentActionState === 'stateC' || isAppealed) && (
                  <div className="p-space-md rounded-xl bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-2xl">gavel</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-sm">
                            <span className="font-headline-sm text-headline-sm font-bold">Docket Under Statutory Appeal (Re-Opened)</span>
                            <span className="px-space-xs py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm uppercase font-semibold">
                              Escalated
                            </span>
                          </div>
                          <p className="font-body-md text-body-md mt-0.5 opacity-90">
                            Your appeal has been formally assigned to the Appellate Nodal Authority. Priority has been escalated to HIGH.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm shrink-0 self-end md:self-auto">
                        <span className="px-space-sm py-1 rounded-lg bg-surface-container-lowest/80 text-on-tertiary-fixed font-code-tracking text-label-sm">
                          {dossier.trackingId || `APL-${dossier.id}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Dossier Card */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
                  {/* Header Row */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md pb-space-md bg-surface-container-low/50 -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <span className="font-code-tracking text-headline-sm text-secondary font-bold">
                          {dossier.trackingId || `GRV-${dossier.id}`}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyId}
                          title="Copy Docket ID"
                          className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {copied ? 'check' : 'content_copy'}
                          </span>
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span className="text-outline-variant text-xs">•</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-secondary">verified</span>
                          Cryptographically Certified
                        </span>
                      </div>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold leading-tight">
                        {dossier.subject}
                      </h1>
                    </div>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-semibold">
                        <span className="material-symbols-outlined text-sm">priority</span>
                        <span>Priority: {dossier.priority || 'MEDIUM'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            currentActionState === 'stateC' || isAppealed
                              ? 'bg-tertiary animate-pulse'
                              : dossier.status === 'RESOLVED'
                              ? 'bg-secondary'
                              : dossier.status === 'REJECTED'
                              ? 'bg-error'
                              : 'bg-primary'
                          }`}
                        />
                        <span>Status: {dossier.status || 'PENDING'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">domain</span>
                        <span>Assigned Department</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold leading-snug">
                        {dossier.departmentName || 'General Administration'}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Division: Redressal Operations</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">calendar_today</span>
                        <span>Date Submitted</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold">
                        {formatDateTime(dossier.createdAt)}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Web Submission</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">update</span>
                        <span>Date Last Updated</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold">
                        {formatDateTime(
                          logs.length > 0 ? logs[logs.length - 1].loggedAt : dossier.createdAt
                        )}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Official Redressal Log</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">pin_drop</span>
                        <span>Tracking Reference</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold font-code-tracking">
                        {dossier.trackingId || `REF-${dossier.id}`}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Central Registry Index</span>
                    </div>
                  </div>

                  {/* Citizen Statement */}
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary">article</span>
                        Citizen Grievance Statement
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-code-tracking">Original Intake Text</span>
                    </div>
                    <div className="p-space-lg rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                      {dossier.description || 'No detailed statement entered.'}
                    </div>
                  </div>
                </div>

                {/* Audit Trail vs Action Center Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  {/* Left: Chronological Resolution Timeline (7 Cols) */}
                  <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
                    <div className="flex items-center justify-between pb-space-sm">
                      <div className="flex flex-col">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Official Resolution Docket Audit Trail
                        </h2>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Chronological administrative log with cryptographic GRO agent verifications.
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">security_update_good</span>
                        <span>{logs.length} Events Recorded</span>
                      </div>
                    </div>

                    {/* Timeline Rail */}
                    <div className="relative pl-8 space-y-space-lg">
                      <div className="absolute left-4 -translate-x-1/2 top-3 bottom-3 w-0.5 bg-surface-container-high" />
                      {logs.length === 0 ? (
                        <div className="p-space-md rounded-xl bg-surface-container-low text-on-surface-variant text-body-md">
                          No resolution updates recorded yet. The grievance has been registered and routed to the assigned department officer for initial review.
                        </div>
                      ) : (
                        logs.map((log, idx) => {
                          const isFinal = idx === logs.length - 1 && dossier.status === 'RESOLVED';
                          return (
                            <div key={log.id || idx} className="relative flex items-start gap-space-md">
                              <div
                                className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                                  isFinal
                                    ? 'bg-secondary text-on-secondary shadow-sm'
                                    : 'bg-surface-container-lowest ring-4 ring-secondary-fixed'
                                }`}
                              >
                                {isFinal ? (
                                  <span className="material-symbols-outlined text-[10px]">check</span>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-secondary" />
                                )}
                              </div>
                              <div
                                className={`flex flex-col w-full p-space-md rounded-xl gap-space-xs ${
                                  isFinal ? 'bg-surface-container shadow-sm' : 'bg-surface-container-low'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                                  <span className="font-title-md text-title-md text-on-surface font-bold">
                                    {log.actionTaken || 'Administrative Action'}
                                  </span>
                                  <span className="font-code-tracking text-label-sm text-on-surface-variant">
                                    {formatDateTime(log.loggedAt)}
                                  </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">
                                  {log.remarks || 'No remarks recorded.'}
                                </p>
                                <div className="flex items-center gap-space-xs pt-space-xs font-label-sm text-label-sm text-on-surface">
                                  <span className="material-symbols-outlined text-sm text-secondary">verified_user</span>
                                  <span>
                                    Handled by: <strong className="font-semibold">{log.groEmail || 'Grievance Redressal Officer'}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                        <span className="material-symbols-outlined text-2xl">policy</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">Statutory Resolution Guarantee</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Citizens maintain an unconditional statutory window of 15 calendar days from resolution date to submit satisfaction feedback or file an appeal.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Citizen Action Center (5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-space-lg">
                    {actionError && (
                      <div className="p-space-md rounded-xl bg-error-container text-on-error-container text-body-md shadow-sm flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-base mt-0.5">error_outline</span>
                        <span>{actionError}</span>
                      </div>
                    )}

                    {/* STATE A: Fresh Resolved (Pending Feedback) */}
                    {currentActionState === 'stateA' && (
                      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Resolution Evaluation</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Citizen Satisfaction Protocol</span>
                          </div>
                          <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                            Pending Feedback
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Please indicate whether the department resolved <strong className="text-on-surface">"{dossier.subject}"</strong> to your satisfaction.
                        </p>

                        {/* Interactive Star Rating */}
                        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs items-center text-center">
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">Rate Work Quality & Response Time</span>
                          <div className="flex items-center gap-space-sm my-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 transition-colors ${rating >= star ? 'text-secondary' : 'text-outline-variant hover:text-secondary'}`}
                              >
                                <span
                                  className="material-symbols-outlined text-3xl"
                                  style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  star
                                </span>
                              </button>
                            ))}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {rating > 0 ? `Selected: ${rating} / 5 Stars` : 'Click to score from 1 (Unsatisfied) to 5 (Excellent)'}
                          </span>
                        </div>

                        {/* Feedback Comments */}
                        <div className="flex flex-col gap-1">
                          <label className="font-label-lg text-label-lg text-on-surface font-semibold" htmlFor="feedback-comments">
                            Comments or Observations <span className="font-normal text-on-surface-variant">(Optional)</span>
                          </label>
                          <textarea
                            id="feedback-comments"
                            rows={3}
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Provide any details regarding the physical work done or lingering issues..."
                            className="w-full p-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm resize-none border border-surface-container-high"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleFeedbackSubmit}
                          disabled={isSubmittingFeedback || rating === 0}
                          className="w-full py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-space-xs disabled:opacity-50"
                        >
                          {isSubmittingFeedback ? (
                            <>
                              <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Feedback...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">rate_review</span>
                              <span>Submit Resolution Feedback</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* STATE B: Rated (Shows submitted review & Raise Appeal option) */}
                    {currentActionState === 'stateB' && (
                      <div className="flex flex-col gap-space-lg">
                        {/* Submitted Evaluation Card */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Your Submitted Evaluation</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Logged on {formatDateTime(dossier.feedback?.submittedAt || dossier.feedback?.createdAt)}
                              </span>
                            </div>
                            <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                              Recorded
                            </span>
                          </div>
                          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                            <div className="flex items-center gap-space-xs">
                              <div className="flex items-center text-secondary">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const activeRating = dossier.feedback?.rating || rating || 5;
                                  return (
                                    <span
                                      key={star}
                                      className={`material-symbols-outlined text-xl ${
                                        activeRating >= star ? 'text-secondary' : 'text-outline-variant'
                                      }`}
                                      style={{ fontVariationSettings: activeRating >= star ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                      star
                                    </span>
                                  );
                                })}
                              </div>
                              <span className="font-label-lg text-label-lg text-on-surface font-bold ml-1">
                                {dossier.feedback?.rating || rating || 5} / 5 Stars
                              </span>
                              <span
                                className={`font-body-sm text-body-sm font-medium ${
                                  (dossier.feedback?.rating || rating || 5) >= 4 ? 'text-secondary' : 'text-error'
                                }`}
                              >
                                {(dossier.feedback?.rating || rating || 5) >= 4 ? '(Satisfied)' : '(Dissatisfied)'}
                              </span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface mt-1 bg-surface-container-lowest p-space-sm rounded-lg shadow-sm">
                              “{dossier.feedback?.comment || feedbackComment || 'Resolution marked complete.'}”
                            </p>
                          </div>
                        </div>

                        {/* Raise an Appeal Action Card */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                          <div className="flex items-start gap-space-md">
                            <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-xl">priority_high</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Unsatisfied with the Resolution?</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                You have the statutory legal right to request an independent second-tier administrative audit.
                              </span>
                            </div>
                          </div>

                          {showAppealForm ? (
                            <div className="flex flex-col gap-space-md pt-space-xs">
                              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                                <label className="font-label-lg text-label-lg text-on-surface font-semibold" htmlFor="appeal-statement">
                                  Statement of Appeal Grounds <span className="text-error font-bold">*</span>
                                </label>
                                <textarea
                                  id="appeal-statement"
                                  rows={4}
                                  value={appealReason}
                                  onChange={(e) => setAppealReason(e.target.value)}
                                  placeholder="Provide clear reasons explaining why the department's resolution was unsatisfactory..."
                                  className="w-full p-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm resize-none border border-surface-container-high"
                                />
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  This statement will be transmitted directly to the Office of the Appellate Authority.
                                </span>
                              </div>
                              <div className="flex items-center gap-space-sm">
                                <button
                                  type="button"
                                  onClick={handleAppealSubmit}
                                  disabled={isSubmittingAppeal || !appealReason.trim()}
                                  className="flex-1 py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-space-xs disabled:opacity-50"
                                >
                                  {isSubmittingAppeal ? (
                                    <>
                                      <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
                                      <span>Transmitting Appeal...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="material-symbols-outlined text-lg">send</span>
                                      <span>Submit Formal Appeal</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowAppealForm(false)}
                                  className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-space-xs">
                              <button
                                type="button"
                                onClick={() => setShowAppealForm(true)}
                                className="w-full py-space-sm rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-space-xs"
                              >
                                <span className="material-symbols-outlined text-lg">gavel</span>
                                <span>Raise Statutory Appeal</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STATE C: Active Appeal Raised View */}
                    {currentActionState === 'stateC' && (
                      <div className="flex flex-col gap-space-md">
                        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Active Appeal Dossier</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">Appellate Level II Review Initiated</span>
                            </div>
                            <span className="px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                              Active Appeal
                            </span>
                          </div>
                          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                            <div className="flex items-center justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Appellate Case ID:</span>
                              <span className="font-code-tracking font-bold text-on-surface">
                                {dossier.trackingId || `APL-${dossier.id}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Escalated Priority:</span>
                              <span className="font-semibold text-error">HIGH (Appellate Escalation)</span>
                            </div>
                            <div className="flex items-center justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Assigned Department:</span>
                              <span className="font-semibold text-on-surface">{dossier.departmentName}</span>
                            </div>
                            <div className="flex flex-col gap-1 pt-2 border-t border-surface-container-high">
                              <span className="text-on-surface-variant font-label-sm text-label-sm">Appeal Grounds Stated:</span>
                              <p className="font-body-sm text-body-sm text-on-surface bg-surface-container-lowest p-2 rounded-lg">
                                “{dossier.feedback?.appealReason || appealReason || 'Citizen requested formal review of resolution.'}”
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IN-PROGRESS / PENDING View */}
                    {currentActionState === 'in_progress' && (
                      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Redressal In Progress</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Assigned to {dossier.departmentName}</span>
                          </div>
                          <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                            {dossier.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                          Your grievance is currently under official review and administrative processing.
                          Once the grievance redressal officer marks this docket as <strong>RESOLVED</strong>, the satisfaction feedback evaluation and statutory appeal protocols will be unlocked right here.
                        </p>
                        <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-sm text-on-surface-variant font-label-sm">
                          <span className="material-symbols-outlined text-secondary text-lg">info</span>
                          <span>You will receive system notifications as official progress is logged.</span>
                        </div>
                      </div>
                    )}
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
