import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * GroTicketDetailPage (v2)
 * Converted faithfully from Stitch export: gro_ticket_detail_view
 * 
 * Features:
 * - Breadcrumb & context navigation
 * - Prominent "REOPENED VIA STATUTORY APPEAL" banner with citizen statement & countdown timer
 * - Full docket article (Subject, Description, Dept, Asset Tag)
 * - Chronological Resolution Audit Timeline with milestones #01, #02, #03
 * - Official Redressal Determination form with:
 *   - Action taken input
 *   - Officer remarks textarea
 *   - Mandatory 3-way radio status update: In Progress | Resolved | Rejected
 *   - Evaluator State switcher (Form, Loading, Success, Error)
 */
export default function GroTicketDetailPage() {
  const [evaluatorState, setEvaluatorState] = useState('active'); // 'active' | 'loading' | 'success' | 'error'
  const [actionTaken, setActionTaken] = useState(
    'Emergency dispatch sent to replace luminaire on secondary pole L-43 and certify lux output.'
  );
  const [officerRemarks, setOfficerRemarks] = useState(
    'Field team acknowledged secondary pole miscommunication. New high-output LED fixture installed today. Crosswalk lux survey verified above safety standard.'
  );
  const [selectedStatus, setSelectedStatus] = useState('resolved'); // 'in_progress' | 'resolved' | 'rejected'

  // MOCK DATA - replaced with real API data in a later session
  const mockDossier = {
    id: 'GRV-A99104F2',
    subject: 'Street lamp outage causing severe hazard at Elm St intersection',
    statement:
      'The dual sodium vapor streetlight cluster at Elm & 4th cross has been non-operational for over 8 calendar days. Vehicles turning onto Elm St have nearly hit pedestrian crossers twice this week.',
    appealStatement:
      'The primary intersection hazard remains unrectified because light pole L-43 was left without replacement bulb, leaving crosswalk dark. Requesting secondary supervisor review.',
    department: 'Dept of Public Lighting & Energy',
    location: 'Mast Pole L-42 & L-43 (Elm St)',
    ward: 'Ward 14 • Cross-junction',
    filedDate: 'Sep 28, 2024, 09:14 AM',
    appealDate: 'Oct 03, 2024 • 04:32 PM',
  };

  const handleDeterminationSubmit = (e) => {
    e.preventDefault();
    setEvaluatorState('loading');

    // MOCK DATA - replaced with real API data in a later session
    setTimeout(() => {
      setEvaluatorState('success');
    }, 1200);
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
              to="/v2/gro-dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/v2/gro-ticket-detail"
              className="flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-surface-container text-secondary font-label-lg rounded-lg"
            >
              <span className="material-symbols-outlined text-xl">inbox</span>
              <span>Grievance Dossiers</span>
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
              <span className="font-code-tracking text-code-tracking text-on-surface-variant">GRO-DEPT-9042</span>
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
              <span className="font-label-sm text-label-sm">Dept of Public Works & Utilities</span>
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
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">Sarah Jenkins</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Officer Grade-I</span>
              </div>
            </div>
            <Link
              to="/v2/gro-login"
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
            {/* Top Secondary Header & Context Bar */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
              <div className="flex flex-col gap-space-xs">
                <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                  <Link to="/v2/gro-dashboard" className="hover:text-secondary transition-colors">
                    GRO Console
                  </Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <Link to="/v2/gro-dashboard" className="hover:text-secondary transition-colors">
                    Active Queue
                  </Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="font-code-tracking text-code-tracking text-secondary font-semibold">
                    {mockDossier.id}
                  </span>
                </nav>
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Docket Dossier & Review
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-surface-container text-secondary">
                    Statutory Docket
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

            {/* Statutory Appeal Alert Banner */}
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
                      <span className="text-error font-semibold">Citizen Statement:</span> “{mockDossier.appealStatement}”
                    </p>
                    <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant font-label-sm text-label-sm pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-error">calendar_today</span>
                        Lodged: {mockDossier.appealDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-error">assignment_return</span>
                        Escalation Tier: GRO Oversight
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-error">star</span>
                        Citizen Prior Rating: <strong className="text-on-surface">★ 2/5 Stars</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-space-xs flex-shrink-0 bg-surface-container-lowest/80 backdrop-blur-sm p-space-sm rounded-lg shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Appeal Window SLA
                  </span>
                  <span className="font-headline-sm text-headline-sm text-error font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">timer</span> 18h 42m
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Expedite mandated</span>
                </div>
              </div>
            </section>

            {/* Main Dual-Column Master-Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column: Dossier Details & Timeline (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-code-tracking text-code-tracking bg-surface-container px-2.5 py-1 rounded-md text-secondary font-bold">
                        {mockDossier.id}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span> In Progress
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-error text-on-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">flag</span> High Priority
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> Filed: {mockDossier.filedDate}
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      Incident Headline
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                      {mockDossier.subject}
                    </h2>
                  </div>

                  {/* Description Box */}
                  <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-secondary uppercase tracking-wider">
                        Citizen Testimonial & Grievance Context
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{mockDossier.ward}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                      {mockDossier.statement}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="flex flex-col p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Designated Department
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-base text-secondary">power</span>
                        {mockDossier.department}
                      </span>
                    </div>
                    <div className="flex flex-col p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Geographic Asset Tag
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-base text-secondary">pin_drop</span>
                        {mockDossier.location}
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
                    <span className="font-code-tracking text-code-tracking text-on-surface-variant">3 Events Recorded</span>
                  </div>

                  <div className="relative pl-6 space-y-space-lg before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                    {/* Event 3: Appeal Reopening */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-error ring-4 ring-error-container" />
                      <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            Appeal Initiated & Case Reopened
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-error-container text-on-error-container">
                            Milestone #03
                          </span>
                        </div>
                        <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                          Oct 03, 2024 • 04:32 PM
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Lodged by Citizen via Central Web Portal. Assigned directly to GRO Redressal Desk for secondary review.
                      </p>
                      <div className="text-xs text-on-surface-variant mt-1 p-2 bg-surface-container-low rounded">
                        <span className="font-semibold text-on-surface">System Note:</span> Ticket transitioned from <em className="text-secondary font-semibold">Resolved</em> → <em className="text-error font-semibold">In Progress (Appealed)</em>.
                      </div>
                    </div>

                    {/* Event 2: Initial Field Action */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary-fixed" />
                      <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            Field Workorder Executed & Closed
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-surface-container text-secondary">
                            Milestone #02
                          </span>
                        </div>
                        <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                          Oct 01, 2024 • 02:15 PM
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        <strong>Officer:</strong> Marcus Vance (Lineman Supervisor, Zone 3)
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        <strong>Remarks:</strong> Replaced burned sodium ballast on mast pole L-42. Energized junction circuit and verified terminal voltage.
                      </p>
                    </div>

                    {/* Event 1: Grievance Registration */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-surface-container" />
                      <div className="flex flex-wrap items-baseline justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            Grievance Intake & Auto-Routing
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                            Milestone #01
                          </span>
                        </div>
                        <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                          Sep 28, 2024 • 09:14 AM
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        <strong>Intake Channel:</strong> Mobile Redressal App (Verified Citizen ID #CTZ-88219)
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Auto-classified under Public Lighting Infrastructure, high accident risk threshold met.
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
                        <strong className="text-on-surface font-mono">{mockDossier.id}</strong>.
                      </p>

                      <form className="flex flex-col gap-space-md" onSubmit={handleDeterminationSubmit}>
                        {/* Action Taken */}
                        <div className="flex flex-col gap-space-xs">
                          <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between" htmlFor="action-taken">
                            <span>Action Taken</span>
                            <span className="font-body-sm text-body-sm text-outline">Optional</span>
                          </label>
                          <input
                            id="action-taken"
                            name="action-taken"
                            type="text"
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                            placeholder="e.g. Emergency dispatch sent to replace luminaire..."
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
                            <span className="font-body-sm text-body-sm text-outline">Optional</span>
                          </label>
                          <textarea
                            id="officer-remarks"
                            name="officer-remarks"
                            rows={4}
                            value={officerRemarks}
                            onChange={(e) => setOfficerRemarks(e.target.value)}
                            placeholder="e.g. Field team acknowledged secondary pole miscommunication..."
                            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 p-space-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary font-body-md text-body-md transition-all resize-none border border-surface-container-high"
                          />
                          <span className="font-body-sm text-body-sm text-outline">
                            Detailed commentary visible in citizen dossier and audit trail.
                          </span>
                        </div>

                        {/* Required Status-Update Radio: In Progress | Resolved | Rejected */}
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
                              onClick={() => setSelectedStatus('in_progress')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'in_progress'
                                  ? 'bg-surface-container-lowest shadow-sm text-secondary font-semibold'
                                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg mb-1">pending</span>
                              <span className="font-label-md text-label-md">In Progress</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatus('resolved')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'resolved'
                                  ? 'bg-surface-container-lowest shadow-sm text-secondary font-semibold'
                                  : 'text-on-surface-variant hover:text-on-surface font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg mb-1">check_circle</span>
                              <span className="font-label-md text-label-md">Resolved</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatus('rejected')}
                              className={`flex flex-col items-center py-3 px-2 rounded-lg text-center transition-all ${
                                selectedStatus === 'rejected'
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
                            Determination will be digitally signed by <strong className="text-on-surface">Sarah Jenkins (GRO Grade-I)</strong> and broadcast via National SMS Gateway.
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
                          Appending signed resolution payload to Central Public Ledger & triggering SMS gateway...
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
                            Docket {mockDossier.id} Marked as {selectedStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm text-on-surface">
                        <div className="flex items-start gap-space-xs font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">history_edu</span>
                          <span>Timeline entry <strong>#04</strong> appended to statutory record with GRO Grade-I cryptographic timestamp.</span>
                        </div>
                        <div className="flex items-start gap-space-xs font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-secondary text-base flex-shrink-0 mt-0.5">sms</span>
                          <span>Notification SMS dispatched to citizen mobile <strong>+91 ••••• 8912</strong>.</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-space-sm text-center">
                        <div className="p-space-sm bg-surface-container rounded-lg">
                          <span className="font-label-sm text-label-sm text-outline uppercase">Total Turnaround</span>
                          <div className="font-headline-sm text-headline-sm text-on-surface font-bold">5d 07h</div>
                        </div>
                        <div className="p-space-sm bg-surface-container rounded-lg">
                          <span className="font-label-sm text-label-sm text-outline uppercase">SLA Compliance</span>
                          <div className="font-headline-sm text-headline-sm text-secondary font-bold">100% (Met)</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-space-sm pt-space-xs">
                        <button
                          type="button"
                          onClick={() => setEvaluatorState('active')}
                          className="flex-1 py-3 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-all text-center"
                        >
                          Re-edit Determination
                        </button>
                        <Link
                          to="/v2/gro-dashboard"
                          className="flex-1 py-3 px-space-md rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold transition-all text-center flex items-center justify-center gap-1"
                        >
                          <span>Back to Queue</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* STATE 4: ERROR */}
                  {evaluatorState === 'error' && (
                    <div className="flex flex-col gap-space-md">
                      <div className="p-space-md bg-error-container text-on-error-container rounded-xl flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-xl">wifi_off</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-label-lg text-label-lg font-bold">Transmission Failure</span>
                          <p className="font-body-sm text-body-sm">
                            Unable to commit determination to central ledger. Network handshake with National Grievance Node timed out.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvaluatorState('active')}
                        className="w-full py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold"
                      >
                        Retry Determination Input
                      </button>
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
