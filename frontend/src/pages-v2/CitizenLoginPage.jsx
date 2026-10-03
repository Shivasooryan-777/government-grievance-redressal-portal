import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * CitizenLoginPage (v2)
 * Converted faithfully from Stitch export: citizen_login
 * 
 * Preserves exact visual structure, Tailwind classes, and styling tokens.
 * Includes interactive state sandbox controls for easy visual testing of errors and loading states.
 */
export default function CitizenLoginPage() {
  // Interactive UI state (replaces raw DOM event listeners from Stitch)
  const [email, setEmail] = useState('citizen@example.gov');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid email or password combination. Please check your credentials or reset your password.');
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    // MOCK DATA - replaced with real API data in a later session
    setTimeout(() => {
      setIsLoading(false);
      // Demo deterministic feedback
      setIsError(true);
      setErrorMessage('Invalid credentials. Please verify your civic registration.');
    }, 1200);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4">
      <main className="w-full">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-space-xl flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            {/* Atmospheric Ambient Glow Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[480px] bg-secondary-fixed opacity-40 blur-[130px] pointer-events-none rounded-full -z-10" />
            <div className="absolute bottom-12 right-1/4 w-[380px] h-[380px] bg-surface-variant opacity-50 blur-[100px] pointer-events-none rounded-full -z-10" />

            {/* Interactive Debug / Inspector Controls (To toggle required states) */}
            <div className="w-full max-w-md mb-space-md p-space-sm bg-surface-container-low rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  State Sandbox
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setIsError(!isError)}
                  className="px-2.5 py-1 rounded bg-surface text-secondary hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-secondary' : 'bg-error'}`} />
                  {isError ? 'Clear Error' : 'Toggle Error'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-surface text-secondary hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Simulate Loading
                </button>
              </div>
            </div>

            {/* Main Authentication Container */}
            <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden relative">
              {/* Top Civic Stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-secondary-container to-secondary-fixed" />
              <div className="p-space-lg md:p-space-xl flex flex-col">
                {/* Portal Emblem & Identity Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-space-md bg-surface-container-low rounded-xl flex items-center justify-center shadow-sm">
                    <img
                      alt="CivicPulse Official Emblem"
                      className="w-16 h-16 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary p-0.5 rounded-full flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full text-secondary mb-space-xs">
                    <span className="material-symbols-outlined text-[16px]">account_balance</span>
                    <span className="font-label-sm text-label-sm tracking-wide font-bold uppercase">
                      National Redressal Network
                    </span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Citizen Access Portal
                  </h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs max-w-xs">
                    Sign in to monitor grievances, submit appeals, and provide resolution feedback.
                  </p>
                </div>

                {/* Dynamic Error Alert Banner */}
                {isError && (
                  <div className="mt-space-lg p-space-md bg-error-container text-on-error-container rounded-lg flex items-start gap-space-sm transition-all duration-200">
                    <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">error</span>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md font-semibold text-error">Authentication Failed</p>
                      <p className="font-body-sm text-body-sm text-on-error-container mt-0.5">{errorMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsError(false)}
                      className="text-on-error-container hover:opacity-75"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}

                {/* Authentication Form */}
                <form className="mt-space-lg flex flex-col gap-space-md" onSubmit={handleSubmit}>
                  {/* Email Input Group */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-lg text-label-lg text-on-surface" htmlFor="citizen-email">
                        Digital ID or Email
                      </label>
                      <span className="font-code-tracking text-code-tracking text-on-surface-variant text-[11px]">
                        CIVIC-PASS
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                        mail
                      </span>
                      <input
                        id="citizen-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="citizen@example.gov"
                        required
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-11 pr-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                      />
                    </div>
                  </div>

                  {/* Password Input Group */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-lg text-label-lg text-on-surface" htmlFor="citizen-password">
                        Secret Access Code
                      </label>
                      <a href="#" className="font-label-sm text-label-sm text-secondary hover:underline font-semibold">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                        lock
                      </span>
                      <input
                        id="citizen-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security passcode"
                        required
                        className={`w-full font-body-md text-body-md pl-11 pr-11 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline ${
                          isError ? 'bg-error-container text-on-error-container' : 'bg-surface-container-lowest text-on-surface'
                        }`}
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-outline hover:text-on-surface p-1 rounded transition-colors focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {isError && (
                      <p className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Password does not meet authorization registry requirements.
                      </p>
                    )}
                  </div>

                  {/* Remember Device & MFA Note */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary/40 accent-secondary cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                        Remember this device
                      </span>
                    </label>
                    <div className="flex items-center gap-1 text-on-surface-variant" title="Encrypted session preserved for 14 calendar days">
                      <span className="material-symbols-outlined text-[15px]">timer</span>
                      <span className="font-code-tracking text-code-tracking text-[11px]">14D SECURE</span>
                    </div>
                  </div>

                  {/* Primary Submit Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full mt-space-sm bg-secondary text-on-secondary font-label-lg text-label-lg py-3.5 px-space-md rounded-lg shadow-md hover:bg-secondary-container hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {!isLoading ? (
                      <span className="flex items-center gap-2">
                        <span>Sign In to Citizen Portal</span>
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <svg className="animate-spin h-5 w-5 text-on-secondary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                          />
                        </svg>
                        <span>Verifying Dossier Credentials...</span>
                      </span>
                    )}
                  </button>
                </form>

                {/* Divider with Registry Indicator */}
                <div className="relative my-space-lg flex items-center justify-center">
                  <div className="w-full h-px bg-surface-container-high" />
                  <span className="absolute px-3 bg-surface-container-lowest font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                    New Citizen?
                  </span>
                </div>

                {/* Registration Link */}
                <div className="text-center">
                  <Link
                    to="/v2/citizen-registration"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors font-label-lg text-label-lg"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">person_add</span>
                    <span>
                      Don't have an account? <strong className="text-secondary font-semibold">Register as a Citizen</strong>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Trust Badges and Security Safeguards */}
              <div className="bg-surface-container-low px-space-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    256-Bit SSL Encryption
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Official Digital Identity Guard
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Footer Metadata & Helpdesk Anchor */}
            <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-md text-on-surface-variant">
              <Link to="/v2/public-tracking" className="font-body-sm text-body-sm hover:text-secondary flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">track_changes</span>
                <span>Public Tracking Lookup</span>
              </Link>
              <span className="text-outline-variant">•</span>
              <a href="#" className="font-body-sm text-body-sm hover:text-secondary flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">help_outline</span>
                <span>Public Redressal Helpdesk</span>
              </a>
              <span className="text-outline-variant">•</span>
              <a href="#" className="font-body-sm text-body-sm hover:text-secondary flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">policy</span>
                <span>Citizen Privacy Charter</span>
              </a>
              <span className="text-outline-variant">•</span>
              <span className="font-code-tracking text-code-tracking text-[11px]">GATEWAY v4.12-SEC</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
