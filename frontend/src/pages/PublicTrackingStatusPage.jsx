import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * PublicTrackingStatusPage
 * Converted faithfully from Stitch export: public_tracking_status_lookup
 * 
 * Features:
 * - Public top navigation
 * - Anonymous Public Lookup Protocol hero
 * - Prominent Search Interface for GRV-xxxxxxxx docket format
 * - Demo state switcher (1. Active Result, 2. Empty State, 3. Not Found, 4. Network / Loading)
 * - Anonymized Record Privacy Guarantee
 * - Visual Stepper Progress Bar (Registered -> Triaged -> Field Inspection -> Resolved)
 */
export default function PublicTrackingStatusPage() {
  const [docketInput, setDocketInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [simState, setSimState] = useState('initial'); // 'results' | 'rejected' | 'initial' | 'error' | 'loading'
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Fallback demo data for manual testing if needed
  const mockResult = {
    id: 'GRV-B7A231C4',
    tier: 'Tier-1 Redressal',
    status: simState === 'rejected' ? 'REJECTED' : 'IN_PROGRESS',
    priority: 'HIGH',
    directorate: 'Municipal Water Supply & Sewerage Directorate',
    dept: 'Public Health Engineering Dept',
    lodgementDate: 'Oct 14, 2024',
    latestUpdate: simState === 'rejected' ? 'Oct 16, 2024, 11:30 AM' : 'Oct 18, 2024, 02:45 PM',
    slaNote: simState === 'rejected' ? 'Closed (Terminal Outcome)' : 'On Schedule (SLA: 48h remaining)',
  };

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

  const fetchTracking = async (trackingId) => {
    const cleanId = (trackingId || docketInput).trim().toUpperCase();
    if (!cleanId) return;

    setSimState('loading');
    setErrorMessage('');
    try {
      const res = await api.get(`/api/grievances/track/${encodeURIComponent(cleanId)}`);
      if (res.data && res.data.success && res.data.data) {
        const data = res.data.data;
        setTrackingResult(data);
        if (data.status === 'REJECTED') {
          setSimState('rejected');
        } else {
          setSimState('results');
        }
      } else {
        setErrorMessage(res.data?.message || 'Docket reference not found.');
        setSimState('error');
      }
    } catch (err) {
      console.error('Failed to track grievance:', err);
      const msg =
        err.response?.data?.message ||
        `We could not locate any public record for tracking code "${cleanId}". Please verify the characters.`;
      setErrorMessage(msg);
      setSimState('error');
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchTracking(docketInput);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackingIdParam = params.get('trackingId');
    if (trackingIdParam) {
      setDocketInput(trackingIdParam);
      fetchTracking(trackingIdParam);
    }
  }, []);

  const activeResult = trackingResult
    ? {
        id: trackingResult.trackingId,
        tier: 'Central Redressal Gateway',
        status: trackingResult.status,
        priority: trackingResult.priority || 'MEDIUM',
        directorate: trackingResult.departmentName || 'Public Grievance Redressal Dept',
        dept: 'Redressal Operations Division',
        lodgementDate: formatDate(trackingResult.createdAt),
        latestUpdate: formatDateTime(trackingResult.updatedAt || trackingResult.createdAt),
        slaNote:
          trackingResult.status === 'REJECTED'
            ? 'Closed (Terminal Outcome)'
            : trackingResult.status === 'RESOLVED'
            ? 'Concluded & Resolved'
            : trackingResult.status === 'IN_PROGRESS'
            ? 'Under Active Investigation'
            : 'Assigned to Redressal Queue',
      }
    : mockResult;

  const copyTrackingId = () => {
    navigator.clipboard?.writeText(activeResult.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Public Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <img
              alt="CivicPulse Official Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">CivicPulse</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs">
                Citizen Grievance Redressal Portal
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-space-lg">
            <Link to="/dashboard" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs">
              Home
            </Link>
            <Link to="/track" className="transition-colors py-space-xs text-secondary font-label-lg border-b-2 border-secondary">
              Public Tracking
            </Link>
            <Link to="/citizen-login" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs">
              Citizen Login
            </Link>
            <Link to="/gro-login" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs">
              GRO Login
            </Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <Link
              to="/submit"
              className="inline-flex items-center justify-center px-space-md py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-secondary-container transition-colors shadow-sm"
            >
              Register Grievance
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 bg-background flex-1">
        <div className="flex flex-col w-full">
          {/* Ambient Backdrop Accent */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-40 right-1/4 w-96 h-96 bg-surface-variant/40 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-60 -left-20 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl flex flex-col gap-space-xl">
              {/* Hero Header */}
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-space-sm">
                <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-secondary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface">
                    Anonymous Public Lookup Protocol
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                  Public Grievance Tracking
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Check real-time resolution status of your grievance anonymously. No login required.
                </p>
              </div>

              {/* Search Interface */}
              <div className="w-full max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest p-space-sm md:p-space-md rounded-xl shadow-md transition-shadow focus-within:shadow-xl">
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-space-sm">
                    <div className="relative flex-1 flex items-center">
                      <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant pointer-events-none text-xl">
                        search
                      </span>
                      <input
                        type="text"
                        value={docketInput}
                        onChange={(e) => setDocketInput(e.target.value)}
                        placeholder="e.g. GRV-B7A231C4"
                        spellCheck="false"
                        className="w-full pl-12 pr-10 py-3.5 bg-surface-container-low rounded-lg font-code-tracking text-code-tracking text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors border border-surface-container-high"
                      />
                      {docketInput && (
                        <button
                          type="button"
                          onClick={() => setDocketInput('')}
                          className="absolute right-space-md text-outline hover:text-on-surface transition-colors p-1"
                          title="Clear input"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3.5 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:bg-secondary-container transition-all"
                    >
                      <span>Track Docket</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </form>
                  <div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-sm px-space-xs">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-xs">info</span>
                      <span>Format: <strong>GRV-</strong> followed by 8 alphanumeric characters</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-xs text-secondary">shield</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Zero Identity Disclosure
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulation State Switcher Panel */}
                <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-space-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">tune</span> Demo States:
                  </span>
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingResult(null);
                        setSimState('results');
                      }}
                      className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                        simState === 'results' ? 'bg-secondary text-on-secondary shadow-sm font-semibold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      1. In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingResult(null);
                        setSimState('rejected');
                      }}
                      className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                        simState === 'rejected' ? 'bg-error text-on-error shadow-sm font-semibold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      2. Rejected (Terminal Branch)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingResult(null);
                        setSimState('initial');
                      }}
                      className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                        simState === 'initial' ? 'bg-secondary text-on-secondary shadow-sm font-semibold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      3. Empty State
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingResult(null);
                        setErrorMessage('Sample 404: Docket reference not found.');
                        setSimState('error');
                      }}
                      className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                        simState === 'error' ? 'bg-error text-on-error shadow-sm font-semibold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      4. Not Found
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimState('loading')}
                      className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                        simState === 'loading' ? 'bg-secondary text-on-secondary shadow-sm font-semibold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      5. Network / Loading
                    </button>
                  </div>
                </div>
              </div>

              {/* State Canvas Area */}
              <div className="w-full max-w-4xl mx-auto min-h-[420px] flex items-center justify-center">
                {/* 1. RESULTS / REJECTED STATE */}
                {(simState === 'results' || simState === 'rejected') && (
                  <div className="w-full flex flex-col gap-space-md">
                    <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg md:p-space-xl flex flex-col gap-space-lg">
                      {/* Dossier Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-surface-container">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                              Public Docket Receipt
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            <span className="font-label-sm text-label-sm text-secondary font-semibold">
                              {activeResult.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-space-sm">
                            <span className="font-headline-md text-headline-md text-on-surface font-code-tracking font-bold tracking-tight">
                              {activeResult.id}
                            </span>
                            <button
                              type="button"
                              onClick={copyTrackingId}
                              className="p-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant"
                              title="Copy tracking ID"
                            >
                              <span className="material-symbols-outlined text-base">
                                {copied ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-space-sm">
                          {activeResult.status === 'REJECTED' || simState === 'rejected' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md">
                              <span className="inline-block w-2 h-2 rounded-full bg-error" />
                              <span className="font-bold">Closed / Rejected</span>
                            </div>
                          ) : activeResult.status === 'RESOLVED' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                              <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
                              <span className="font-bold">Resolved</span>
                            </div>
                          ) : activeResult.status === 'PENDING' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
                              <span className="inline-block w-2 h-2 rounded-full bg-outline" />
                              <span>Pending Triage</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                              <span>In Progress</span>
                            </div>
                          )}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-background font-label-md text-label-md">
                            <span className="material-symbols-outlined text-sm text-error">priority_high</span>
                            <span>Priority: {activeResult.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Privacy Banner */}
                      <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary text-lg">privacy_tip</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          <strong>Anonymized Record:</strong> Personal citizen identifiers and detailed narrative descriptions are redacted for public view. Log in to access the full unmasked case file.
                        </p>
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                        <div className="p-space-md bg-surface-container-low rounded-lg shadow-sm flex flex-col gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            Assigned Directorate
                          </span>
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            {activeResult.directorate}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{activeResult.dept}</span>
                        </div>
                        <div className="p-space-md bg-surface-container-low rounded-lg shadow-sm flex flex-col gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            Lodgement Date
                          </span>
                          <span className="font-title-md text-title-md text-on-surface font-code-tracking font-bold">
                            {activeResult.lodgementDate}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Central Intake Gateway</span>
                        </div>
                        <div className="p-space-md bg-surface-container-low rounded-lg shadow-sm flex flex-col gap-space-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            Latest Official Update
                          </span>
                          <span className="font-title-md text-title-md text-on-surface font-code-tracking font-bold">
                            {activeResult.latestUpdate}
                          </span>
                          <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-sm">schedule</span> {activeResult.slaNote}
                          </span>
                        </div>
                      </div>

                      {/* Procedural Stepper Progress Rail */}
                      <div className="flex flex-col gap-space-md pt-space-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            Redressal Milestone Trajectory
                          </span>
                          <span className={`font-label-sm text-label-sm uppercase font-semibold ${
                            activeResult.status === 'REJECTED' || simState === 'rejected'
                              ? 'text-error'
                              : 'text-on-surface-variant'
                          }`}>
                            {activeResult.status === 'REJECTED' || simState === 'rejected'
                              ? 'Terminal Alternate Branch (Closed)'
                              : activeResult.status === 'RESOLVED'
                              ? 'Stage 4 of 4 Concluded (Resolved)'
                              : activeResult.status === 'PENDING'
                              ? 'Stage 1 of 4 Active (Docket Registered)'
                              : 'Stage 3 of 4 Active (In Progress)'}
                          </span>
                        </div>

                        {/* Stepper Bar */}
                        {activeResult.status === 'REJECTED' || simState === 'rejected' ? (
                          <div className="flex flex-col gap-4">
                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md md:gap-0 w-full pt-4">
                              <div className="hidden md:block absolute left-[16.67%] right-[16.67%] top-8 -translate-y-1/2 h-1 bg-surface-container-high -z-0">
                                <div className="h-full bg-error rounded-full" style={{ width: '100%' }} />
                              </div>

                              {/* Step 1: Registered */}
                              <div className="relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/3">
                                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-sm">
                                  <span className="material-symbols-outlined text-sm">check</span>
                                </div>
                                <div>
                                  <span className="font-label-md text-label-md font-bold text-on-surface block">Registered</span>
                                  <span className="font-body-sm text-xs text-on-surface-variant block">{activeResult.lodgementDate}</span>
                                </div>
                              </div>

                              {/* Step 2: Triaged */}
                              <div className="relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/3">
                                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-sm">
                                  <span className="material-symbols-outlined text-sm">check</span>
                                </div>
                                <div>
                                  <span className="font-label-md text-label-md font-bold text-on-surface block">Triaged by GRO</span>
                                  <span className="font-body-sm text-xs text-on-surface-variant block">{activeResult.latestUpdate}</span>
                                </div>
                              </div>

                              {/* Step 3: Terminal Branch (Rejected) */}
                              <div className="relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/3">
                                <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-error/20">
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </div>
                                <div>
                                  <span className="font-label-md text-label-md font-bold text-error block">Terminal Determination</span>
                                  <span className="font-body-sm text-xs text-error font-semibold block">Rejected & Closed</span>
                                </div>
                              </div>
                            </div>

                            {/* Alternate Terminal Outcome Notice */}
                            <div className="p-4 rounded-xl bg-error-container text-on-error-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                              <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-error text-2xl shrink-0 mt-0.5">gavel</span>
                                <div>
                                  <span className="font-title-md font-bold block text-error">Terminal Determination: Grievance Rejected</span>
                                  <span className="font-body-sm text-on-error-container block mt-0.5">
                                    Docket concluded at administrative triage: Issue determined non-jurisdictional, deficient in grounds, or administrative duplicate. This is a terminal outcome, not an intermediate sequential milestone.
                                  </span>
                                </div>
                              </div>
                              <Link
                                to="/citizen-login"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity shrink-0"
                              >
                                <span>File Statutory Appeal</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md md:gap-0 w-full pt-4">
                            <div className="hidden md:block absolute left-[12.5%] right-[12.5%] top-8 -translate-y-1/2 h-1 bg-surface-container-high -z-0">
                              <div
                                className="h-full bg-secondary rounded-full transition-all duration-500"
                                style={{
                                  width:
                                    activeResult.status === 'RESOLVED'
                                      ? '100%'
                                      : activeResult.status === 'IN_PROGRESS'
                                      ? '68%'
                                      : '25%',
                                }}
                              />
                            </div>

                            {/* Step 1: Registered */}
                            <div className="relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/4">
                              <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-sm">
                                <span className="material-symbols-outlined text-sm">check</span>
                              </div>
                              <div>
                                <span className="font-label-md text-label-md font-bold text-on-surface block">Registered</span>
                                <span className="font-body-sm text-xs text-on-surface-variant block">{activeResult.lodgementDate}</span>
                              </div>
                            </div>

                            {/* Step 2: Triaged */}
                            <div className="relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                                  activeResult.status === 'PENDING'
                                    ? 'bg-secondary-fixed ring-4 ring-secondary/20 text-on-secondary-fixed animate-pulse'
                                    : 'bg-secondary text-on-secondary'
                                }`}
                              >
                                {activeResult.status === 'PENDING' ? (
                                  <span className="material-symbols-outlined text-sm text-secondary">sync</span>
                                ) : (
                                  <span className="material-symbols-outlined text-sm">check</span>
                                )}
                              </div>
                              <div>
                                <span className="font-label-md text-label-md font-bold text-on-surface block">Triaged by GRO</span>
                                <span className="font-body-sm text-xs text-on-surface-variant block">
                                  {activeResult.status === 'PENDING' ? 'Pending Review' : activeResult.latestUpdate}
                                </span>
                              </div>
                            </div>

                            {/* Step 3: Field Inspection / Action */}
                            <div
                              className={`relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/4 ${
                                activeResult.status === 'PENDING' ? 'opacity-50' : ''
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                                  activeResult.status === 'RESOLVED'
                                    ? 'bg-secondary text-on-secondary'
                                    : activeResult.status === 'IN_PROGRESS'
                                    ? 'bg-secondary-fixed ring-4 ring-secondary/20 text-on-secondary-fixed animate-pulse'
                                    : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {activeResult.status === 'RESOLVED' ? (
                                  <span className="material-symbols-outlined text-sm">check</span>
                                ) : activeResult.status === 'IN_PROGRESS' ? (
                                  <span className="material-symbols-outlined text-sm text-secondary">sync</span>
                                ) : (
                                  '3'
                                )}
                              </div>
                              <div>
                                <span className="font-label-md text-label-md font-bold text-on-surface block">
                                  Inspection / Action
                                </span>
                                <span className="font-body-sm text-xs text-on-surface-variant block">
                                  {activeResult.status === 'RESOLVED'
                                    ? 'Completed'
                                    : activeResult.status === 'IN_PROGRESS'
                                    ? 'In Progress'
                                    : 'Pending'}
                                </span>
                              </div>
                            </div>

                            {/* Step 4: Resolution */}
                            <div
                              className={`relative z-10 flex md:flex-col items-center gap-space-sm text-left md:text-center w-full md:w-1/4 ${
                                activeResult.status !== 'RESOLVED' ? 'opacity-50' : ''
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  activeResult.status === 'RESOLVED'
                                    ? 'bg-secondary text-on-secondary shadow-sm'
                                    : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {activeResult.status === 'RESOLVED' ? (
                                  <span className="material-symbols-outlined text-sm">check</span>
                                ) : (
                                  '4'
                                )}
                              </div>
                              <div>
                                <span className="font-label-md text-label-md text-on-surface block">Resolution Closure</span>
                                <span className="font-body-sm text-xs text-on-surface-variant block">
                                  {activeResult.status === 'RESOLVED' ? 'Concluded' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. INITIAL / EMPTY STATE */}
                {simState === 'initial' && (
                  <div className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center flex flex-col items-center gap-space-md py-16">
                    <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-4xl">travel_explore</span>
                    </div>
                    <div className="max-w-md">
                      <h3 className="font-headline-sm font-bold text-on-surface">Enter a Docket Tracking ID</h3>
                      <p className="font-body-md text-on-surface-variant mt-1">
                        Use the tracking ID received when your petition was submitted (e.g. GRV-XXXXXXXX) to view public audit status.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. ERROR / NOT FOUND STATE */}
                {simState === 'error' && (
                  <div className="w-full bg-error-container text-on-error-container p-space-xl rounded-xl shadow-sm flex flex-col items-center text-center gap-space-md py-16">
                    <div className="w-16 h-16 rounded-full bg-error text-on-error flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl">search_off</span>
                    </div>
                    <div className="max-w-md">
                      <h3 className="font-headline-sm font-bold">Docket Reference Not Found</h3>
                      <p className="font-body-md mt-1">
                        {errorMessage ||
                          'We could not locate any public record for the entered tracking code. Please verify the characters or contact the department helpline.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDocketInput('');
                        setTrackingResult(null);
                        setSimState('initial');
                      }}
                      className="px-space-md py-2 bg-on-error-container text-error-container rounded-lg font-label-md font-semibold hover:opacity-90 transition-opacity"
                    >
                      Clear & Try Another Code
                    </button>
                  </div>
                )}

                {/* 4. LOADING STATE */}
                {simState === 'loading' && (
                  <div className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-20 gap-space-md">
                    <div className="w-14 h-14 rounded-full border-4 border-surface-container border-t-secondary animate-spin" />
                    <span className="font-headline-sm font-bold text-on-surface">Querying Central Civic Registry...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high py-space-md px-margin-mobile lg:px-margin-desktop text-center text-on-surface-variant font-body-sm text-body-sm">
        <p>© 2026 CivicPulse National Redressal Network. Public Transparency & Grievance Tracking Engine.</p>
      </footer>
    </div>
  );
}
