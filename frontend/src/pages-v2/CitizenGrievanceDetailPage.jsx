import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * CitizenGrievanceDetailPage (v2)
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
  const [screenState, setScreenState] = useState('stateA'); // 'stateA' | 'stateB' | 'stateC' | 'loading' | 'error'
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [appealReason, setAppealReason] = useState(
    'The primary intersection hazard remains unrectified because light pole L-43 was left without replacement bulb, leaving the crosswalk dark. Requesting secondary supervisor review.'
  );
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [copied, setCopied] = useState(false);

  // MOCK DATA - replaced with real API data in a later session
  const mockDossier = {
    id: 'GRV-A99104F2',
    subject: 'Street lamp outage causing severe hazard at Elm St intersection',
    department: 'Dept of Public Lighting & Energy',
    division: 'Metro Grid West',
    dateSubmitted: 'Sep 28, 2024 • 09:14 AM',
    dateUpdated: 'Oct 02, 2024 • 04:30 PM',
    location: 'Elm St & 4th Ave Cross (Ward 12 • Pole #L-42/43)',
    statement:
      'The dual sodium vapor streetlight cluster at Elm & 4th cross has been non-operational for over 8 calendar days. Vehicles turning onto Elm St have nearly hit pedestrian crossers twice this week.',
    priority: 'Medium',
    status: screenState === 'stateC' ? 'Under Re-Review' : 'Resolved',
    timeline: [
      {
        title: 'Docket Intake & Department Triage',
        date: 'Sep 28, 2024 • 10:30 AM',
        desc: 'Assigned to Municipal Lighting Division Unit 4. Initial triage determined non-emergency high priority due to pedestrian crosswalk proximity.',
        officer: 'GRO Officer Sarah Jenkins (Staff ID #8841)',
        icon: 'badge',
      },
      {
        title: 'Field Inspection Dispatched',
        date: 'Sep 30, 2024 • 02:15 PM',
        desc: 'Ground technician verified ballast failure on pole #L-42. Replacement parts requisitioned from Central Depot. Work order #WO-994 issued.',
        officer: 'GRO Field Supervisor Marcus Vance (Lighting Maintenance)',
        icon: 'engineering',
      },
      {
        title: 'Status Updated to Resolved',
        date: 'Oct 02, 2024 • 04:30 PM',
        desc: 'High-efficiency LED luminaire installed and photometrically tested. Luminaire is operational and daylight sensor verified functioning.',
        officer: 'GRO Officer Sarah Jenkins (Closing Authority)',
        icon: 'verified_user',
        isFinal: true,
      },
    ],
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(mockDossier.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = () => {
    // MOCK DATA - replaced with real API data in a later session
    setScreenState('stateB');
  };

  const handleAppealSubmit = () => {
    // MOCK DATA - replaced with real API data in a later session
    setScreenState('stateC');
    setShowAppealForm(false);
  };

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
              to="/v2/citizen-dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary bg-surface-container font-label-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/v2/submit-grievance"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>Submit Grievance</span>
            </Link>
            <Link
              to="/v2/public-tracking"
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
              <span className="font-code-tracking text-code-tracking text-on-surface-variant">UID-VNC-7821</span>
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
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-xs">account_balance</span>
              <span className="font-label-sm text-label-sm">Dept of Public Works & Utilities</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              />
              <div className="hidden md:flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">Eleanor Vance</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Citizen</span>
              </div>
            </div>
            <Link
              to="/v2/citizen-login"
              className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg border border-outline-variant hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Logout</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full pt-20 bg-background flex-1 px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            {/* Interactive View Switcher */}
            <div className="mb-space-lg p-space-sm bg-surface-container rounded-xl flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-secondary text-sm">tune</span>
                <span>Citizen State Simulator:</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setScreenState('stateA')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    screenState === 'stateA'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  State A: Fresh Resolved (Rate Now)
                </button>
                <button
                  type="button"
                  onClick={() => setScreenState('stateB')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    screenState === 'stateB'
                      ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  State B: Rated (Can Appeal)
                </button>
                <button
                  type="button"
                  onClick={() => setScreenState('stateC')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm transition-all ${
                    screenState === 'stateC'
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
            {screenState === 'loading' && (
              <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-xl shadow-sm">
                <div className="relative w-16 h-16 mb-space-md">
                  <div className="w-16 h-16 rounded-full border-4 border-surface-container-high border-t-secondary animate-spin" />
                  <span className="material-symbols-outlined text-secondary text-2xl absolute inset-0 m-auto flex items-center justify-center">
                    sync
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Retrieving Grievance Dossier</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs text-center max-w-md">
                  Syncing immutable ledger records for <span className="font-code-tracking font-medium text-secondary">{mockDossier.id}</span> with Municipal Utilities Division...
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
                  The municipal record server timed out while validating the cryptographic signature of grievance <span className="font-code-tracking font-medium text-on-surface">{mockDossier.id}</span>.
                </p>
                <div className="flex items-center gap-space-md mt-space-lg">
                  <button
                    type="button"
                    onClick={() => setScreenState('stateA')}
                    className="px-space-lg py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity flex items-center gap-space-xs"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    <span>Retry Transaction</span>
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface transition-colors"
                  >
                    Report System Incident
                  </button>
                </div>
              </div>
            )}

            {/* Main Content (States A, B, C) */}
            {screenState !== 'loading' && screenState !== 'error' && (
              <div className="flex flex-col gap-space-lg">
                {/* Breadcrumb Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <Link
                      to="/v2/citizen-dashboard"
                      className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-lg text-label-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      <span>Back to My Grievances</span>
                    </Link>
                    <div className="h-4 w-px bg-outline-variant" />
                    <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                      <Link to="/v2/citizen-dashboard" className="hover:text-secondary transition-colors">
                        Dashboard
                      </Link>
                      <span>/</span>
                      <span className="font-code-tracking text-on-surface font-semibold">{mockDossier.id}</span>
                    </nav>
                  </div>
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-space-md py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Secure Citizen Channel • End-to-End Logged</span>
                  </div>
                </div>

                {/* State C Banner (Appealed) */}
                {screenState === 'stateC' && (
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
                            Your appeal has been formally assigned to the Appellate Nodal Officer. Target review timeline: within 7 business days.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm shrink-0 self-end md:self-auto">
                        <span className="px-space-sm py-1 rounded-lg bg-surface-container-lowest/80 text-on-tertiary-fixed font-code-tracking text-label-sm">
                          APL-REF-2024-819
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
                        <span className="font-code-tracking text-headline-sm text-secondary font-bold">{mockDossier.id}</span>
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
                        {mockDossier.subject}
                      </h1>
                    </div>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-semibold">
                        <span className="material-symbols-outlined text-sm">priority</span>
                        <span>Priority: {mockDossier.priority}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold">
                        <span className={`w-2.5 h-2.5 rounded-full ${screenState === 'stateC' ? 'bg-error animate-pulse' : 'bg-secondary'}`} />
                        <span>Status: {mockDossier.status}</span>
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
                      <span className="font-title-md text-title-md text-on-surface font-bold leading-snug">{mockDossier.department}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Division: {mockDossier.division}</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">calendar_today</span>
                        <span>Date Submitted</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold">{mockDossier.dateSubmitted}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Web Submission</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">update</span>
                        <span>Date Last Updated</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold">{mockDossier.dateUpdated}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Closure by GRO</span>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                        <span className="material-symbols-outlined text-base text-secondary">pin_drop</span>
                        <span>Incident Coordinates</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface font-bold">{mockDossier.location}</span>
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
                    <div className="p-space-lg rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md leading-relaxed">
                      {mockDossier.statement}
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
                        <span>3 Events Recorded</span>
                      </div>
                    </div>

                    {/* Timeline Rail */}
                    <div className="relative pl-6 space-y-space-lg">
                      <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-surface-container-high" />
                      {mockDossier.timeline.map((event, idx) => (
                        <div key={idx} className="relative flex items-start gap-space-md">
                          <div
                            className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                              event.isFinal
                                ? 'bg-secondary text-on-secondary shadow-sm'
                                : 'bg-surface-container-lowest ring-4 ring-secondary-fixed'
                            }`}
                          >
                            {event.isFinal ? (
                              <span className="material-symbols-outlined text-xs">check</span>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                            )}
                          </div>
                          <div
                            className={`flex flex-col w-full p-space-md rounded-xl gap-space-xs ${
                              event.isFinal ? 'bg-surface-container shadow-sm' : 'bg-surface-container-low'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-space-xs">
                              <span className="font-title-md text-title-md text-on-surface font-bold">{event.title}</span>
                              <span className="font-code-tracking text-label-sm text-on-surface-variant">{event.date}</span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant">{event.desc}</p>
                            <div className="flex items-center gap-space-xs pt-space-xs font-label-sm text-label-sm text-on-surface">
                              <span className="material-symbols-outlined text-sm text-secondary">{event.icon}</span>
                              <span>Handled by: <strong className="font-semibold">{event.officer}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                    {/* STATE A: Fresh Resolved (Pending Feedback) */}
                    {screenState === 'stateA' && (
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
                          Please indicate whether the municipal field team resolved the streetlight outage at Elm & 4th Ave to your satisfaction.
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
                          className="w-full py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-space-xs"
                        >
                          <span className="material-symbols-outlined text-lg">rate_review</span>
                          <span>Submit Resolution Feedback</span>
                        </button>
                      </div>
                    )}

                    {/* STATE B: Rated (Shows submitted review & Raise Appeal option) */}
                    {screenState === 'stateB' && (
                      <div className="flex flex-col gap-space-lg">
                        {/* Submitted Evaluation Card */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Your Submitted Evaluation</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">Logged on Oct 03, 2024 • 08:20 AM</span>
                            </div>
                            <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                              Recorded
                            </span>
                          </div>
                          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                            <div className="flex items-center gap-space-xs">
                              <div className="flex items-center text-secondary">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl text-outline-variant">star</span>
                                <span className="material-symbols-outlined text-xl text-outline-variant">star</span>
                                <span className="material-symbols-outlined text-xl text-outline-variant">star</span>
                              </div>
                              <span className="font-label-lg text-label-lg text-on-surface font-bold ml-1">2 / 5 Stars</span>
                              <span className="font-body-sm text-body-sm text-error font-medium">(Dissatisfied)</span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface mt-1 bg-surface-container-lowest p-space-sm rounded-lg shadow-sm">
                              “Technicians fixed pole L-42, but the adjacent pole L-43 is still completely dark.”
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
                                  className="w-full p-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm resize-none border border-surface-container-high"
                                />
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  This statement will be transmitted directly to the Office of the District Commissioner.
                                </span>
                              </div>
                              <div className="flex items-center gap-space-sm">
                                <button
                                  type="button"
                                  onClick={handleAppealSubmit}
                                  className="flex-1 py-space-sm rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-space-xs"
                                >
                                  <span className="material-symbols-outlined text-lg">send</span>
                                  <span>Submit Formal Appeal</span>
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
                    {screenState === 'stateC' && (
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
                              <span className="font-code-tracking font-bold text-on-surface">APL-2024-9042-REV</span>
                            </div>
                            <div className="flex items-center justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Assigned Magistrate:</span>
                              <span className="font-semibold text-on-surface">Hon. Vikram Anand (Addl. Collector)</span>
                            </div>
                            <div className="flex items-center justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Statutory Deadline:</span>
                              <span className="font-code-tracking text-secondary font-bold">Oct 16, 2024 (7 Days Remaining)</span>
                            </div>
                          </div>
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
