import React from 'react';
import { Link } from 'react-router-dom';

/**
 * V2IndexHub
 * Navigation hub for all 9 Stitch-designed screens in pages-v2/
 * Lets the evaluator compare and inspect every converted screen cleanly.
 */
export default function V2IndexHub() {
  const screens = [
    {
      category: 'Citizen Authentication & Onboarding',
      items: [
        {
          name: 'Citizen Login',
          path: '/v2/citizen-login',
          component: 'CitizenLoginPage.jsx',
          source: 'citizen_login/code.html',
          desc: 'Civic-pass digital ID & password login with state sandbox (loading & error simulators).',
        },
        {
          name: 'Citizen Registration',
          path: '/v2/citizen-registration',
          component: 'CitizenRegistrationPage.jsx',
          source: 'citizen_registration/code.html',
          desc: 'Citizen signup form with legal attestation, real-time validation simulator, and network timeout toast.',
        },
      ],
    },
    {
      category: 'Citizen Portal & Grievance Lodgement',
      items: [
        {
          name: 'Citizen Dashboard',
          path: '/v2/citizen-dashboard',
          component: 'CitizenDashboardPage.jsx',
          source: 'citizen_dashboard/code.html',
          desc: 'Dossier table, SLA summary metrics, status pills, and interactive state switcher (Default, Empty, Loading, Error).',
        },
        {
          name: 'Submit New Grievance',
          path: '/v2/submit-grievance',
          component: 'SubmitNewGrievancePage.jsx',
          source: 'submit_new_grievance/code.html',
          desc: 'Department selector, character-counted description, priority triage, and statutory success modal.',
        },
        {
          name: 'Citizen Grievance Detail View',
          path: '/v2/citizen-grievance-detail',
          component: 'CitizenGrievanceDetailPage.jsx',
          source: 'citizen_grievance_detail_view/code.html',
          desc: 'Chronological audit trail, 5-star resolution rating, and statutory appeal escalation workflow.',
        },
      ],
    },
    {
      category: 'Grievance Redressal Officer (GRO) Administration',
      items: [
        {
          name: 'GRO Officer Login',
          path: '/v2/gro-login',
          component: 'GroOfficerLoginPage.jsx',
          source: 'gro_officer_login/code.html',
          desc: 'Level IV security clearance scrim, guilloche security background, official credentials entry, and role mismatch guard.',
        },
        {
          name: 'GRO Officer Dashboard',
          path: '/v2/gro-dashboard',
          component: 'GroOfficerDashboardPage.jsx',
          source: 'gro_officer_dashboard/code.html',
          desc: 'Priority queue with prominent "🔥 RE-OPENED VIA APPEAL" highlighting, SLA metrics, and test harness.',
        },
        {
          name: 'GRO Ticket Detail View',
          path: '/v2/gro-ticket-detail',
          component: 'GroTicketDetailPage.jsx',
          source: 'gro_ticket_detail_view/code.html',
          desc: 'Official determination form (In Progress | Resolved | Rejected), audit trail milestones, and appeal countdown.',
        },
      ],
    },
    {
      category: 'Public Transparency & Tracking',
      items: [
        {
          name: 'Public Tracking Status Lookup',
          path: '/v2/public-tracking',
          component: 'PublicTrackingStatusPage.jsx',
          source: 'public_tracking_status_lookup/code.html',
          desc: 'Anonymous tracking ID search, procedural progress stepper rail, and zero identity disclosure guarantee.',
        },
      ],
    },
  ];

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-surface-container-high pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-tracking text-xs font-bold uppercase">
              Phase 2 • UI Modernization
            </span>
            <span className="font-label-sm text-secondary font-semibold">CivicPulse Design System v2</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Stitch Screen Verification Hub
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl">
            All 9 Google Stitch screens converted into React components under <code className="bg-surface-container px-2 py-0.5 rounded text-sm font-mono">frontend/src/pages-v2/</code>. Both the old Phase 1 screens and these new v2 screens remain accessible side-by-side.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-8">
          {screens.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h2 className="font-title-md text-title-md font-bold text-secondary uppercase tracking-wider">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item, i) => (
                  <Link
                    key={i}
                    to={item.path}
                    className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high hover:border-secondary hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                          {item.name}
                        </span>
                        <span className="material-symbols-outlined text-outline group-hover:text-secondary group-hover:translate-x-1 transition-all">
                          arrow_forward
                        </span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant mb-4">{item.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-surface-container-low flex items-center justify-between text-xs font-mono text-outline">
                      <span>{item.path}</span>
                      <span className="text-secondary font-semibold">{item.component}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Back to v1 link */}
        <div className="mt-4 p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">compare_arrows</span>
            <span className="font-body-sm text-on-surface-variant">
              Want to compare with the original Phase 1 pages? They remain active at <code className="font-mono text-on-surface font-semibold">/login</code>, <code className="font-mono text-on-surface font-semibold">/dashboard</code>, <code className="font-mono text-on-surface font-semibold">/submit</code>, and <code className="font-mono text-on-surface font-semibold">/gro-dashboard</code>.
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md transition-colors whitespace-nowrap shadow-sm"
          >
            Visit Old Phase 1 Login
          </Link>
        </div>
      </div>
    </div>
  );
}
