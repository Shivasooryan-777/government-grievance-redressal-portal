import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * SubmitNewGrievancePage (v2)
 * Converted faithfully from Stitch export: submit_new_grievance
 * 
 * Features:
 * - Citizen persona top bar with breadcrumb & state switcher pills
 * - Interactive states: Active Form, Validation Error, Submitting Loader, Success Celebration
 * - Real-time character counters for Subject (max 100) and Description (min 20)
 * - File upload drop-zone with file preview & removal
 * - SLA Protocol & Escalation Ladder context sidebar
 */
export default function SubmitNewGrievancePage() {
  const navigate = useNavigate();
  const [screenState, setScreenState] = useState('active'); // 'active' | 'error' | 'loading' | 'success'
  const [subject, setSubject] = useState('Broken water main causing street flooding on 5th Ave');
  const [category, setCategory] = useState('water');
  const [description, setDescription] = useState(
    'Fresh drinking water has been gushing from the junction manhole since early morning today.'
  );
  const [copied, setCopied] = useState(false);

  // MOCK DATA - replaced with real API data in a later session
  const mockGeneratedDocketId = 'GRV-E89240M1';

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || description.trim().length < 20) {
      setScreenState('error');
      return;
    }

    setScreenState('loading');
    // MOCK DATA - replaced with real API data in a later session
    setTimeout(() => {
      setScreenState('success');
    }, 1500);
  };

  const copyDocketID = () => {
    navigator.clipboard?.writeText(mockGeneratedDocketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/v2/submit-grievance"
              className="flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-surface-container text-secondary font-label-lg rounded-lg"
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
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Citizen ID Card</span>
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
              <span className="font-label-sm text-label-sm">Citizen Grievance Lodgement</span>
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
                <span className="font-label-sm text-label-sm text-on-surface-variant">Verified Citizen</span>
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

        {/* Page Main Content */}
        <main className="w-full pt-20 bg-background flex-1 px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            {/* Top Citizen Portal Bar */}
            <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <img
                  alt="CivicPulse Official Emblem"
                  className="w-10 h-10 object-contain rounded-lg bg-surface-container-low p-1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface">CivicPulse Citizen Hub</span>
                    <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                      Citizen Portal
                    </span>
                  </div>
                  <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    <Link to="/v2/citizen-dashboard" className="hover:text-secondary transition-colors">
                      Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-on-surface font-semibold">Submit New Grievance</span>
                  </nav>
                </div>
              </div>

              {/* Demo State Switcher */}
              <div className="flex items-center flex-wrap gap-space-md w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                  <span className="font-label-sm text-label-sm text-on-surface-variant px-2">Demo State:</span>
                  <button
                    type="button"
                    onClick={() => setScreenState('active')}
                    className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                      screenState === 'active'
                        ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    1. Active Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenState('error')}
                    className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                      screenState === 'error'
                        ? 'bg-surface-container-lowest text-error shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    2. Validation Error
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenState('loading')}
                    className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                      screenState === 'loading'
                        ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    3. Submitting
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenState('success')}
                    className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                      screenState === 'success'
                        ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    4. Success
                  </button>
                </div>
              </div>
            </div>

            {/* Banner Section */}
            <div className="relative w-full rounded-xl bg-gradient-to-r from-surface-container to-surface-container-low p-space-xl mb-space-lg overflow-hidden shadow-sm">
              <div className="relative z-10 max-w-3xl flex flex-col gap-space-xs">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-lowest/80 text-secondary w-fit font-label-sm text-label-sm uppercase tracking-wider backdrop-blur-sm">
                  <span className="material-symbols-outlined text-sm">assignment_add</span> Direct Public Redress Mechanism
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Lodge a Grievance Docket</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Provide clear information regarding your civic issue. Our automated triage directs tickets directly to the designated department Grievance Redressal Officer (GRO) under official municipal statutory timelines.
                </p>
              </div>
            </div>

            {/* Main Form + Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Primary Form Column (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                {/* STATE: VALIDATION ERROR BANNER */}
                {screenState === 'error' && (
                  <div className="w-full bg-error-container text-on-error-container p-space-md rounded-xl shadow-sm flex items-start gap-space-md">
                    <span className="material-symbols-outlined text-error text-2xl mt-0.5">report_problem</span>
                    <div className="flex flex-col flex-1">
                      <span className="font-label-lg text-label-lg font-bold">Please correct 2 submission discrepancies:</span>
                      <ul className="font-body-sm text-body-sm list-disc list-inside mt-1 space-y-0.5">
                        <li><strong>Subject Line Required:</strong> Grievance summary cannot be empty.</li>
                        <li><strong>Description Too Short:</strong> Minimum 20 characters required.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* STATE: LOADING OVERLAY */}
                {screenState === 'loading' && (
                  <div className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center mb-space-md animate-spin">
                      <span className="material-symbols-outlined text-secondary text-3xl">sync</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
                      Submitting docket to central registry...
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
                      Connecting with the National Civic Grid. Generating cryptographically signed redressal receipt and auto-notifying the zonal nodal supervisor.
                    </p>
                    <div className="w-full max-w-md bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-secondary h-2.5 rounded-full w-3/4 animate-pulse" />
                    </div>
                    <span className="font-code-tracking text-code-tracking text-on-surface-variant mt-space-sm">
                      DISPATCH_PORT_SECURE_9042 // INGESTION 78%
                    </span>
                  </div>
                )}

                {/* STATE: SUCCESS CELEBRATION */}
                {screenState === 'success' && (
                  <div className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-md flex flex-col gap-space-lg">
                    <div className="flex flex-col items-center text-center pb-space-lg border-b border-surface-container-high">
                      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-space-md text-secondary">
                        <span className="material-symbols-outlined text-5xl">task_alt</span>
                      </div>
                      <span className="px-space-sm py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm uppercase mb-space-xs">
                        Official Statutory Lodgement
                      </span>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                        Grievance Lodged Successfully!
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
                        Your civic petition has been officially logged in the Centralized Public Redress Mechanism and provisioned with statutory tracking SLA compliance.
                      </p>
                    </div>

                    {/* Prominent Tracking Docket Pill */}
                    <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-2xl">confirmation_number</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            Permanent Docket Tracking Number
                          </span>
                          <span className="font-code-tracking text-xl font-bold text-on-surface tracking-wider">
                            {mockGeneratedDocketId}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={copyDocketID}
                        className="px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-lg text-label-lg flex items-center gap-space-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">
                          {copied ? 'check' : 'content_copy'}
                        </span>
                        <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                      </button>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-surface-container-low/40 rounded-xl p-space-md flex flex-col gap-space-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md text-left">
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant block">Subject</span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">{subject}</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant block">Assigned Directorate</span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Municipal Water Supply & Sewerage
                          </span>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant block">Lodgement Timestamp</span>
                          <span className="font-code-tracking text-code-tracking text-on-surface block mt-1">
                            24 OCT 2024 • 14:32:09 IST
                          </span>
                        </div>
                      </div>
                      <div className="mt-space-sm pt-space-sm border-t border-surface-container-high flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                        <span className="material-symbols-outlined text-secondary text-base">verified</span>
                        <span>Target Resolution Window: <strong>72 Hours</strong> as per Citizen Charter 2024 Section 4(B).</span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-sm">
                      <Link
                        to="/v2/citizen-dashboard"
                        className="w-full sm:w-auto px-space-xl py-space-md rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold hover:bg-secondary/90 transition-all text-center shadow-md"
                      >
                        Return to Citizen Dashboard
                      </Link>
                      <Link
                        to="/v2/public-tracking"
                        className="w-full sm:w-auto px-space-lg py-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold transition-colors flex items-center justify-center gap-space-xs"
                      >
                        <span className="material-symbols-outlined text-base">track_changes</span>
                        Track Status Anonymously
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSubject('');
                          setDescription('');
                          setScreenState('active');
                        }}
                        className="text-secondary hover:underline font-label-md text-label-md sm:ml-auto"
                      >
                        + File Another Grievance
                      </button>
                    </div>
                  </div>
                )}

                {/* STATE: ACTIVE FORM */}
                {(screenState === 'active' || screenState === 'error') && (
                  <form onSubmit={handleFormSubmit} className="w-full bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                    {/* Field 1: Grievance Subject */}
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="grievance-subject">
                          Grievance Subject <span className="text-error">*</span>
                        </label>
                        <span className="font-code-tracking text-label-sm text-on-surface-variant">
                          {subject.length} / 100
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        State the core issue succinctly. E.g., location and brief failure mode.
                      </p>
                      <div className="relative">
                        <input
                          id="grievance-subject"
                          name="subject"
                          type="text"
                          maxLength={100}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Broken water main causing street flooding on 5th Ave"
                          className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary transition-all shadow-sm border border-surface-container-high"
                        />
                      </div>
                      {!subject.trim() && screenState === 'error' && (
                        <span className="font-label-sm text-label-sm text-error flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">cancel</span> Subject line is mandatory.
                        </span>
                      )}
                    </div>

                    {/* Field 2: Target Department */}
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="grievance-category">
                        Target Department / Category <span className="text-error">*</span>
                      </label>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Select the administrative wing responsible for rectifying this concern.
                      </p>
                      <div className="relative">
                        <select
                          id="grievance-category"
                          name="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer shadow-sm pr-10 border border-surface-container-high"
                        >
                          <option value="water">Municipal Water Supply & Sewerage Directorate</option>
                          <option value="roads">Roads, Bridges & Highway Maintenance Wing</option>
                          <option value="electricity">State Electricity Board & Street Lighting Authority</option>
                          <option value="sanitation">Solid Waste Management & Public Sanitation</option>
                          <option value="transport">Public Urban Transport & Traffic Regulation</option>
                          <option value="parks">Horticulture, Parks & Urban Forest Reserves</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-space-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-lg">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Field 3: Grievance Description */}
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="grievance-desc">
                          Grievance Description <span className="text-error">*</span>
                        </label>
                        <span className={`font-code-tracking text-label-sm ${description.length < 20 ? 'text-error' : 'text-on-surface-variant'}`}>
                          {description.length} / 20 characters minimum
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Detail the exact location, duration, and nature of the civic discrepancy to aid ground inspection teams.
                      </p>
                      <div className="relative">
                        <textarea
                          id="grievance-desc"
                          name="description"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Detail the exact location, duration, and nature of the civic discrepancy..."
                          className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary transition-all shadow-sm border border-surface-container-high"
                        />
                      </div>
                      {description.length < 20 && screenState === 'error' && (
                        <span className="font-label-sm text-label-sm text-error flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">error</span> Description too short — minimum 20 characters required.
                        </span>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm border-t border-surface-container-high">
                      <Link
                        to="/v2/citizen-dashboard"
                        className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface flex items-center gap-space-xs transition-colors order-2 sm:order-1"
                      >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Cancel and return to Dashboard
                      </Link>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-space-xl py-space-md rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold hover:bg-secondary/90 transition-all flex items-center justify-center gap-space-sm shadow-md group order-1 sm:order-2"
                      >
                        <span>Submit Grievance Docket</span>
                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar Context Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-space-lg">
                {/* Visual Showcase Card */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col gap-space-md">
                  <div className="relative h-44 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Inspectors reviewing municipal works"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR5fDpLYBZNrQyZ1FYoTbg58ZAb-jfPtOd5M2L0ADkw28_yPZ9IZNqtLA5fo62fCedaiG4lC36n_NwVxym85kmUMPEL7TOps2J4bYLPEKYan4iXbE2IM7ixav8PYlU14kqZCsKMPWSLgGz7xsFzxTeLS89fnvzA5HWkVBrnb1PToVeyHHn3I1bYFo7YuUdUycDD_D3OSyN8AAYDmvF1nMt8hq10n17LjjAiwBzJ4oz1_xUaLdoIQ7R"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-space-md">
                      <div className="flex items-center gap-space-xs text-on-primary">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="font-label-sm text-label-sm">Standard Resolution: 72 hrs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">Redressal SLA Protocol</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                      Every citizen docket is tracked via the National Citizen Charter. If unaddressed within the designated hours, the case automatically escalates to the District Magistrate.
                    </p>
                  </div>
                </div>

                {/* Filing Best Practices Bento */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-sm text-secondary">
                    <span className="material-symbols-outlined text-xl">lightbulb</span>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">Filing Best Practices</span>
                  </div>
                  <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                    <li className="flex items-start gap-space-xs">
                      <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                      <span><strong>Exact Landmarks:</strong> Include nearby house numbers, street pillars, or GPS tags.</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                      <span><strong>Objective Details:</strong> Clear descriptions speed up jurisdictional triage significantly.</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                      <span><strong>One Issue per Docket:</strong> Avoid mixing unrelated civic issues in one ticket.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
