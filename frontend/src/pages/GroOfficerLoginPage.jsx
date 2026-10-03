import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * GroOfficerLoginPage
 * Converted faithfully from Stitch export: gro_officer_login
 * 
 * Features:
 * - Left column: Institutional Security Guilloche background, Level IV clearance notice, statutory audit protocol
 * - Right column: Officer credential form (Government Email, Password)
 * - Interactive test harness: Default, Clearance Check (Loading), Invalid Auth Error, Citizen Account Detected
 */
export default function GroOfficerLoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [demoState, setDemoState] = useState('normal'); // 'normal' | 'loading' | 'invalid' | 'citizen'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auditConsent, setAuditConsent] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDemoState('loading');
    setErrorMessage('');

    try {
      const role = await login(email, password);
      if (role !== 'GRO') {
        logout();
        setDemoState('citizen');
        return;
      }
      navigate('/gro-dashboard');
    } catch (err) {
      setDemoState('invalid');
      setErrorMessage(err.response?.data?.message || 'Authentication failed. Please verify your officer credentials.');
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4">
      <main className="w-full">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-6xl mx-auto px-4 py-8 lg:py-16">
            {/* Atmospheric Ambient Glows */}
            <div className="absolute -top-16 left-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-surface-container-high/40 rounded-full blur-2xl pointer-events-none -z-10" />

            {/* Quick Demo Controller Bar */}
            <div className="w-full mb-8 bg-surface-container-low shadow-sm rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">settings_suggest</span>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Interactive Test Harness (Evaluator State Switcher):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDemoState('normal')}
                  className={`px-3 py-1.5 rounded text-xs font-label-md transition-colors ${
                    demoState === 'normal'
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('loading')}
                  className={`px-3 py-1.5 rounded text-xs font-label-md transition-colors ${
                    demoState === 'loading'
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  1. Clearance Check (Loading)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('invalid')}
                  className={`px-3 py-1.5 rounded text-xs font-label-md transition-colors ${
                    demoState === 'invalid'
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  2. Invalid Auth Error
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('citizen')}
                  className={`px-3 py-1.5 rounded text-xs font-label-md transition-colors ${
                    demoState === 'citizen'
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  3. Citizen Account Detected
                </button>
              </div>
            </div>

            {/* Main Authentication Dossier Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 shadow-xl rounded-2xl overflow-hidden bg-surface-container-lowest">
              {/* Left Column: Official Institutional Verification & Scrim */}
              <div className="lg:col-span-5 bg-primary-container text-on-primary p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                {/* Background Security Guilloche Pattern Decorator */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern height="40" id="guilloche-gro" patternUnits="userSpaceOnUse" width="40">
                        <circle cx="20" cy="20" fill="none" r="18" stroke="currentColor" strokeWidth="1" />
                        <path d="M0,20 Q20,0 40,20 T80,20" fill="none" stroke="currentColor" strokeWidth="0.75" />
                      </pattern>
                    </defs>
                    <rect fill="url(#guilloche-gro)" height="100%" width="100%" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                  {/* Institutional Header Crest */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-lowest/10 p-2 shadow-inner backdrop-blur flex items-center justify-center shrink-0">
                      <img
                        alt="CivicPulse Official Emblem"
                        className="w-full h-full object-contain"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
                      />
                    </div>
                    <div>
                      <span className="font-code-tracking text-on-primary-container text-xs uppercase tracking-widest block">
                        CIVICPULSE SECURE NET
                      </span>
                      <span className="font-headline-sm text-on-primary font-bold tracking-tight">
                        Redressal Directorate
                      </span>
                    </div>
                  </div>

                  {/* Official Classification Notice */}
                  <div className="bg-surface-container-lowest/5 rounded-xl p-5 backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary-fixed text-xl mt-0.5">verified_user</span>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-md text-secondary-fixed uppercase tracking-wider font-semibold">
                          Security Clearance Level IV
                        </span>
                        <p className="font-body-sm text-on-primary-container text-sm leading-relaxed">
                          You are accessing an authenticated departmental network reserved for verified Grievance Redressal Officers (GRO) and Nodal Envoys.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Protocol Audit Checklist */}
                  <div className="space-y-4">
                    <span className="font-label-sm uppercase tracking-wider text-on-primary-container block">
                      Statutory Audit Protocol
                    </span>
                    <div className="flex items-center gap-3 text-on-primary-container">
                      <span className="material-symbols-outlined text-sm text-secondary-container">fingerprint</span>
                      <span className="font-body-sm text-xs">All session attempts logged with IP & Hardware ID</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-primary-container">
                      <span className="material-symbols-outlined text-sm text-secondary-container">lock_clock</span>
                      <span className="font-body-sm text-xs">Mandatory 15-minute token expiry on dormancy</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-primary-container">
                      <span className="material-symbols-outlined text-sm text-secondary-container">gavel</span>
                      <span className="font-body-sm text-xs">Protected under Digital Administrative Act § 412</span>
                    </div>
                  </div>
                </div>

                {/* Left Column Footer */}
                <div className="mt-8 pt-6 border-t border-surface-container-lowest/10 relative z-10 flex items-center justify-between text-on-primary-container">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                    <span className="font-code-tracking text-xs">NODE: PROV-US-EAST-09</span>
                  </div>
                  <span className="font-code-tracking text-xs">SYS_REV: v4.8.1</span>
                </div>
              </div>

              {/* Right Column: Authentication Form Panel */}
              <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
                <div>
                  {/* Institutional Badge Tag */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-secondary font-label-sm uppercase tracking-wider mb-6">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      shield_person
                    </span>
                    <span>Official Civil Servant Access Only • Restricted Portal</span>
                  </div>

                  {/* Headings */}
                  <div className="mb-6">
                    <h1 className="font-headline-lg text-on-surface mb-2 font-bold">Officer Authentication (GRO)</h1>
                    <p className="font-body-md text-on-surface-variant">
                      Authorized access for designated departmental grievance redressal officers and nodal administrators.
                    </p>
                  </div>

                  {/* DYNAMIC ALERT / NOTIFICATION AREA */}
                  {demoState !== 'normal' && (
                    <div className="mb-6">
                      {/* 1. Citizen Account Detected */}
                      {demoState === 'citizen' && (
                        <div className="p-4 rounded-xl bg-error-container text-on-error-container">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-error text-2xl shrink-0">wrong_location</span>
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="font-title-md font-bold block">Access Denied: Citizen Account Detected</span>
                                <span className="font-body-sm block text-on-surface-variant">
                                  These credentials belong to a registered Citizen account. This terminal is strictly isolated for designated administrative grievance adjudicators.
                                </span>
                              </div>
                              <div className="pt-1">
                                <Link
                                  to="/citizen-login"
                                  className="inline-flex items-center gap-2 bg-error text-on-error font-label-md px-4 py-2 rounded-lg shadow-sm hover:opacity-95 transition-all"
                                >
                                  <span>Switch to Citizen Portal</span>
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Invalid Credentials Error */}
                      {demoState === 'invalid' && (
                        <div className="p-4 rounded-xl bg-error-container text-on-error-container">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-error text-2xl shrink-0">error</span>
                            <div>
                              <span className="font-title-md font-bold block">Authentication Failed</span>
                              <span className="font-body-sm text-on-surface-variant">
                                {errorMessage || 'Authentication failed. Please verify your officer email and password.'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Security Clearance Verification */}
                      {demoState === 'loading' && (
                        <div className="p-4 rounded-xl bg-surface-container text-on-surface">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-title-md font-semibold">Verifying Administrative Clearance...</span>
                              <span className="font-body-sm text-on-surface-variant">
                                Validating digital signature against National Departmental Public Key Registry.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credential Input Form */}
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Official Government Email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-on-surface" htmlFor="officerEmail">
                          Official Government Email
                        </label>
                        <span className="font-code-tracking text-xs text-on-surface-variant">Domain: *.dept.gov / *.gov</span>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
                          badge
                        </span>
                        <input
                          id="officerEmail"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name.officer@dept.gov"
                          className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm placeholder:text-outline-variant font-body-md focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-container-high"
                        />
                      </div>
                    </div>

                    {/* Officer Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-on-surface" htmlFor="officerPassword">
                          Officer Password
                        </label>
                        <a href="#" className="font-body-sm text-secondary hover:underline">
                          Forgot Key?
                        </a>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
                          key
                        </span>
                        <input
                          id="officerPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm placeholder:text-outline-variant font-body-md focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-container-high"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Compliance Acknowledgement */}
                    <div className="pt-1 flex items-start gap-3">
                      <input
                        id="auditConsent"
                        type="checkbox"
                        checked={auditConsent}
                        onChange={(e) => setAuditConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 text-secondary rounded focus:ring-secondary"
                      />
                      <label htmlFor="auditConsent" className="font-body-sm text-on-surface-variant select-none">
                        I declare that I am authorized to handle protected citizen grievances and acknowledge automated regulatory oversight of this session.
                      </label>
                    </div>

                    {/* Submission Action */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={demoState === 'loading'}
                        className="w-full bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary py-3.5 px-6 rounded-lg font-label-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-75"
                      >
                        <span className="material-symbols-outlined text-xl">verified</span>
                        <span>
                          {demoState === 'loading'
                            ? 'Verifying Security Clearance...'
                            : demoState === 'invalid'
                            ? 'Re-try Officer Authentication'
                            : 'Authenticate & Open Redressal Docket'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Auxiliary Links */}
                <div className="mt-8 pt-6 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-lg">headset_mic</span>
                    <span className="font-body-sm text-on-surface-variant">Need GRO Authorization?</span>
                    <a href="#" className="font-body-sm text-secondary font-semibold hover:underline">
                      Contact Nodal Administrator
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/citizen-login"
                      className="font-body-sm text-secondary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Citizen Portal Login</span>
                      <span className="material-symbols-outlined text-sm">arrow_outward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Footnote */}
            <div className="mt-6 text-center">
              <p className="font-body-sm text-xs text-outline">
                Official Grievance Redressal System • Internal Directorate Network • Encrypted with TLS 1.3 / AES-256-GCM
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
