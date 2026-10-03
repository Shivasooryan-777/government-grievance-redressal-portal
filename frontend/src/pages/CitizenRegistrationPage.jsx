import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * CitizenRegistrationPage
 * Converted faithfully from Stitch export: citizen_registration
 * 
 * Preserves exact layout, trust stature panel, interactive state simulator, and form elements.
 */
export default function CitizenRegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    consent: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setEmailError(false);
    setPasswordError(false);

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setEmailError(true);
      return;
    }
    if (formData.password.length < 6) {
      setPasswordError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: formData.fullname.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        role: 'CITIZEN',
      });

      if (res.data.success) {
        navigate('/citizen-login');
      } else {
        setApiError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      const body = err.response?.data;
      if (body?.data && typeof body.data === 'object') {
        // Field-level validation errors map: { fieldName: message }
        const messages = Object.values(body.data).join(' • ');
        setApiError(messages);
      } else {
        setApiError(body?.message || 'Registration failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setEmailError(false);
    setPasswordError(false);
    setNetworkError(false);
    setApiError('');
    setIsLoading(false);
    setFormData({
      fullname: '',
      email: '',
      phone: '',
      password: '',
      consent: true,
    });
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <img
              alt="CivicPulse Official Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3R89TcoRHsXaXcGA4KhcA8r92xY2ivD7QL32KQ6-haXWc-J9KV53tFlgyKq0rztXr4MVdYqy7M-sBoPtlAdxu5xDSklM2dEd4OZbfWkCmTCLn_M429i0pn7bhiyXJHDGjCnjLN9vXcv1DiiGRc0NQUpABQLxG5vXCqL4eP9f1Gdi02pnG5RZ365A0ZSLIZgSTDXRz0nQ8ja9S8bzvCtfILEKE5D1Zlj3SWXkjqCSFTlRHr-CvSHt5"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                CivicPulse
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs">
                Citizen Grievance Redressal Portal
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-space-lg">
            <Link to="/dashboard" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs">
              Home
            </Link>
            <Link to="/track" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs">
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
          {/* Toast Notification Container for Network Failure Simulation */}
          {networkError && (
            <div className="fixed top-24 right-4 z-50 transition-all duration-300 max-w-md w-full">
              <div className="bg-error-container text-on-error-container p-space-md rounded-xl shadow-xl flex items-start gap-space-sm border-l-4 border-error">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">wifi_off</span>
                <div className="flex-1">
                  <h4 className="font-title-md text-title-md text-on-error-container">Network Connection Alert</h4>
                  <p className="font-body-sm text-body-sm text-on-error-container mt-space-xs">
                    Unable to reach registration server. Please check your connection and retry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNetworkError(false)}
                  className="text-on-error-container/70 hover:text-on-error-container p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Layout Area */}
          <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* Left Narrative & Trust Stature Panel (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg lg:pr-space-md">
                {/* Institutional Badge Header */}
                <div className="inline-flex items-center gap-space-xs self-start px-3 py-1.5 rounded-full bg-surface-container-high text-secondary">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">
                    Official Citizen Credentialing
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Your Direct Voice in Public Governance.
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    Create an authenticated citizen profile to lodge formal grievances, participate in verified redressing audits, and monitor government response dockets in real-time.
                  </p>
                </div>

                {/* System Architecture Trust Metrics & Guarantees */}
                <div className="flex flex-col gap-space-md mt-space-sm">
                  {/* Card 1 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined">track_changes</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block">Immutable Docket IDs</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block mt-space-xs">
                        Every grievance receives a cryptographic reference tracking number recognized by state oversight departments.
                      </span>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block">Automated Dispatch Updates</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block mt-space-xs">
                        Instant milestone notifications delivered via verified SMS alerts and secure e-mail relays.
                      </span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined">policy</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block">SLA Escalation Guarantee</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block mt-space-xs">
                        Automatic escalation to senior Redressal Officers if complaints exceed designated resolution windows.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Testing Simulation Toolbox (Interactive State Controls) */}
                <div className="p-space-md rounded-xl bg-surface-container-highest/60 backdrop-blur-sm mt-space-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                      <span className="material-symbols-outlined text-sm">tune</span>
                      <span>Interactive State Simulator</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Prototype Mode</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Toggle field validation errors and server timeout states to evaluate UI feedback mechanisms.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEmailError(!emailError)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-error">priority_high</span>
                      Simulate Invalid Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordError(!passwordError)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-error">lock_clock</span>
                      Simulate Short Pwd
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetworkError(!networkError)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-error">cloud_off</span>
                      Simulate 503 Outage
                    </button>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs">restart_alt</span>
                      Reset All
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Registration Card Layout (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="bg-surface-container-lowest rounded-xl shadow-xl p-space-lg lg:p-space-xl flex flex-col gap-space-lg">
                  {/* Card Header */}
                  <div className="flex flex-col gap-space-xs pb-space-sm border-b border-surface-container">
                    <div className="flex items-center justify-between">
                      <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                        Create Citizen Account
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        Official Gateway
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Register once to lodge civic grievances, receive SMS/email docket updates, and track resolution timelines.
                    </p>
                  </div>

                  {/* Dynamic Registration Error Alert */}
                  {apiError && (
                    <div className="p-space-md bg-error-container text-on-error-container rounded-lg flex items-start gap-space-sm border-l-4 border-error">
                      <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">error</span>
                      <div className="flex-1">
                        <p className="font-label-md text-label-md font-semibold text-error">Registration Alert</p>
                        <p className="font-body-sm text-body-sm text-on-error-container mt-0.5">{apiError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApiError('')}
                        className="text-on-error-container hover:opacity-75"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  )}

                  {/* Registration Form */}
                  <form className="flex flex-col gap-space-md" onSubmit={handleSubmit} noValidate>
                    {/* 1. Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="reg-fullname">
                        Full Name <span className="text-error">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                          person
                        </span>
                        <input
                          id="reg-fullname"
                          name="fullname"
                          type="text"
                          required
                          value={formData.fullname}
                          onChange={handleChange}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-11 pr-4 text-on-surface font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Legal name as it appears on state identification or voter roll.
                      </span>
                    </div>

                    {/* 2. Email Address */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="reg-email">
                          Email Address <span className="text-error">*</span>
                        </label>
                        {emailError && (
                          <span className="inline-flex items-center gap-1 text-error font-label-sm text-label-sm bg-error-container px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">error</span> Invalid Format
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className={`material-symbols-outlined absolute left-3.5 text-lg pointer-events-none ${emailError ? 'text-error' : 'text-on-surface-variant'}`}>
                          mail
                        </span>
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => {
                            handleChange(e);
                            if (emailError) setEmailError(false);
                          }}
                          placeholder="eleanor.vance@example.com"
                          className={`w-full bg-surface-container-lowest rounded-lg py-2.5 pl-11 pr-4 text-on-surface font-body-md text-body-md shadow-sm focus:outline-none transition-all ${
                            emailError ? 'ring-2 ring-error bg-error-container/20' : 'focus:ring-2 focus:ring-secondary'
                          }`}
                        />
                      </div>
                      {!emailError ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Redressal notifications and verification tokens will be transmitted here.
                        </p>
                      ) : (
                        <p className="font-body-sm text-body-sm text-error flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm shrink-0">report</span>
                          Please enter a valid email address (e.g. name@domain.com)
                        </p>
                      )}
                    </div>

                    {/* 3. Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="reg-phone">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1 pointer-events-none text-on-surface-variant font-label-sm text-label-sm pr-2 border-r border-surface-container-high">
                          <span className="material-symbols-outlined text-sm">phone</span>
                          <span>+1</span>
                        </div>
                        <input
                          id="reg-phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 234-5678"
                          className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-16 pr-4 text-on-surface font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Required for emergency field officer contact and two-factor dispatch code.
                      </span>
                    </div>

                    {/* 4. Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1" htmlFor="reg-password">
                          Password <span className="text-error">*</span>
                        </label>
                        {passwordError && (
                          <span className="inline-flex items-center gap-1 text-error font-label-sm text-label-sm bg-error-container px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">warning</span> Password Insecure
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className={`material-symbols-outlined absolute left-3.5 text-lg pointer-events-none ${passwordError ? 'text-error' : 'text-on-surface-variant'}`}>
                          lock
                        </span>
                        <input
                          id="reg-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => {
                            handleChange(e);
                            if (passwordError) setPasswordError(false);
                          }}
                          placeholder="••••••••••••"
                          className={`w-full bg-surface-container-lowest rounded-lg py-2.5 pl-11 pr-12 text-on-surface font-body-md text-body-md shadow-sm focus:outline-none transition-all ${
                            passwordError ? 'ring-2 ring-error bg-error-container/20' : 'focus:ring-2 focus:ring-secondary'
                          }`}
                        />
                        <button
                          type="button"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      {!passwordError ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Minimum 8 characters with at least one number
                        </p>
                      ) : (
                        <p className="font-body-sm text-body-sm text-error flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm shrink-0">report</span>
                          Password too short — must contain at least 8 characters
                        </p>
                      )}
                    </div>

                    {/* Regulatory Consent Checkbox */}
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm mt-1">
                      <input
                        id="reg-consent"
                        name="consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={handleChange}
                        required
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <label className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none" htmlFor="reg-consent">
                        I attest that the information provided is accurate under penalty of civil misrepresentation. I agree to receive official notices regarding my filed petitions.
                      </label>
                    </div>

                    {/* Submit Action with Dynamic Loading State */}
                    <div className="flex flex-col gap-space-sm mt-space-xs">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-space-md rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-secondary-container transition-all shadow-md flex items-center justify-center gap-2 group relative cursor-pointer disabled:opacity-75"
                      >
                        {!isLoading ? (
                          <span className="flex items-center gap-2">
                            <span>Create Citizen Account</span>
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                              arrow_forward
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-on-secondary" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                fill="currentColor"
                              />
                            </svg>
                            <span>Processing Credentials...</span>
                          </span>
                        )}
                      </button>

                      {/* Secondary Navigation Link back to Login */}
                      <div className="text-center pt-space-xs">
                        <Link
                          to="/citizen-login"
                          className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:text-secondary-container transition-colors py-1"
                        >
                          <span>Already have an account? Sign in to Citizen Portal</span>
                          <span className="material-symbols-outlined text-sm">login</span>
                        </Link>
                      </div>
                    </div>
                  </form>

                  {/* Security and Privacy Reassurance Note */}
                  <div className="mt-space-xs pt-space-md border-t border-surface-container flex items-start gap-space-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">verified</span>
                    <p className="font-body-sm text-body-sm leading-relaxed">
                      <strong>Institutional Data Sovereignty:</strong> Your personal data is encrypted and strictly protected under Citizen Privacy Regulations. Information is shared solely with assigned departmental grievance officers for redressal execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-surface-container-high py-space-md px-margin-mobile lg:px-margin-desktop text-center text-on-surface-variant font-body-sm text-body-sm">
        <p>© 2026 CivicPulse National Redressal Network. Secure e-Governance Infrastructure.</p>
      </footer>
    </div>
  );
}
