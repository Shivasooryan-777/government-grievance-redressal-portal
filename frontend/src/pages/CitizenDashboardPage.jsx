import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

/**
 * CitizenDashboardPage
 * Converted faithfully from Stitch export: citizen_dashboard
 * 
 * Features:
 * - Fixed Left Sidebar navigation
 * - Top header with user profile & role chip
 * - Evaluator State Switcher (Default, Empty, Loading, Error)
 * - Grievance status metric summary cards
 * - Rich Dossier Table with badges for Status, Priority, and Appeal tracking
 * - Statutory guidance cards
 */
export default function CitizenDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeState, setActiveState] = useState('loading'); // 'default' | 'empty' | 'loading' | 'error'
  const [grievances, setGrievances] = useState([]);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGrievances = async () => {
    setIsLoading(true);
    setError(null);
    setActiveState('loading');
    try {
      const res = await api.get('/api/grievances/mine');
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        setGrievances(list);
        if (list.length === 0) {
          setActiveState('empty');
        } else {
          setActiveState('default');
        }
      } else {
        setError(res.data?.message || 'Failed to load grievances');
        setActiveState('error');
      }
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
      setError(
        err.response?.data?.message ||
        'Failed to load grievance records from the Central Grievance Monitoring Registry.'
      );
      setActiveState('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/citizen-login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDeptIcon = (deptName) => {
    const name = (deptName || '').toLowerCase();
    if (name.includes('water')) return 'water_drop';
    if (name.includes('light') || name.includes('electric') || name.includes('power')) return 'lightbulb';
    if (name.includes('road') || name.includes('highway')) return 'edit_road';
    if (name.includes('waste') || name.includes('sanitation')) return 'delete_sweep';
    if (name.includes('transport') || name.includes('traffic')) return 'directions_bus';
    if (name.includes('park') || name.includes('forest')) return 'park';
    return 'account_balance';
  };

  const totalFiled = grievances.length;
  const inProgressCount = grievances.filter((g) => g.status === 'IN_PROGRESS').length;
  const resolvedCount = grievances.filter((g) => g.status === 'RESOLVED').length;
  const pendingCount = grievances.filter((g) => g.status === 'PENDING' || g.status === 'SUBMITTED').length;

  const filteredGrievances = grievances.filter((g) => {
    const q = searchQuery.toLowerCase();
    const tId = (g.trackingId || '').toLowerCase();
    const subj = (g.subject || '').toLowerCase();
    const dept = (g.departmentName || '').toLowerCase();
    return tId.includes(q) || subj.includes(q) || dept.includes(q);
  });

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
              <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Citizen Desk</span>
            </div>
          </div>
          <div className="px-space-md mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Citizen Modules</span>
          </div>
          <nav className="flex flex-col px-space-sm gap-space-xs">
            <Link
              to="/dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-surface-container text-secondary font-label-lg rounded-lg"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>My Grievances</span>
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
              <span>Track Public ID</span>
            </Link>
          </nav>
        </div>
        <div className="px-space-md pt-space-md border-t border-surface-container-high">
          <div className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Citizen ID Card</span>
              <span className="font-code-tracking text-code-tracking text-on-surface-variant">
                {user?.userId ? `UID-CIT-00${user.userId}` : 'UID-VNC-7821'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container Offset by Left Sidebar */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high z-40 flex items-center justify-between px-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xs">shield_person</span>
              <span className="font-label-sm text-label-sm">Citizen Resident Portal</span>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-xs">location_city</span>
              <span className="font-label-sm text-label-sm">Metro Civic Jurisdiction</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>
            <div className="h-8 w-px bg-surface-container-high" />
            <div className="flex items-center gap-space-sm">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              />
              <div className="hidden md:flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                  {user?.email ? user.email.split('@')[0] : 'Citizen Resident'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Verified Resident</span>
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

        {/* Content Body */}
        <main className="w-full pt-20 bg-background flex-1 px-space-lg py-space-lg">
          <div className="flex flex-col w-full gap-space-lg">
            {/* Evaluator State Interactive Controller Bar */}
            <aside aria-label="Dev State Controls" className="bg-surface-container-high rounded-xl p-space-sm flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-secondary">tune</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Evaluator Interactive State Switcher:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setActiveState('default')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-all ${
                    activeState === 'default'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">format_list_bulleted</span>
                  <span>1. Default Dossier List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveState('empty')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-all ${
                    activeState === 'empty'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">inbox</span>
                  <span>2. Empty Citizen State</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveState('loading')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-all ${
                    activeState === 'loading'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">hourglass_top</span>
                  <span>3. Skeleton Loader</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveState('error')}
                  className={`px-space-sm py-1 rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-all ${
                    activeState === 'error'
                      ? 'bg-error text-on-error shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">cloud_off</span>
                  <span>4. Network Error Banner</span>
                </button>
              </div>
            </aside>

            {/* Citizen Portal Header Card */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-gradient-to-br from-surface-variant/40 to-transparent rounded-full pointer-events-none blur-2xl" />
              <div className="flex flex-col gap-space-xs z-10">
                <div className="flex items-center gap-space-xs">
                  <div className="flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-xs">shield_person</span>
                    <span className="font-label-sm text-label-sm uppercase">Role: Citizen</span>
                  </div>
                  <span className="font-code-tracking text-code-tracking text-on-surface-variant bg-surface-container-low px-space-xs py-0.5 rounded">
                    UID-VNC-7821
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
                  Citizen Grievance Overview
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                  Manage and track your submitted grievances, monitor resolution milestones, inspect public authority response logs, and file statutory appeals.
                </p>
              </div>
              <div className="flex items-center gap-space-sm z-10">
                <Link
                  to="/submit"
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant transition-all font-label-lg text-label-lg shadow-md hover:shadow-lg active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-90 duration-300">
                    add
                  </span>
                  <span>Submit New Grievance</span>
                </Link>
              </div>
            </section>

            {/* Quick Metrics Bar */}
            <section aria-label="Grievance Statistics" className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Total Filed</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">{totalFiled}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Lifetime dossiers
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">folder_shared</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">In Progress</span>
                  <span className="font-headline-md text-headline-md text-secondary font-bold mt-0.5">{inProgressCount}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" /> Active investigations
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">autorenew</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Resolved</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">{resolvedCount}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" /> {totalFiled > 0 ? Math.round((resolvedCount / totalFiled) * 100) : 0}% success rate
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">task_alt</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Pending</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">{pendingCount}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" /> Awaiting officer intake
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-low text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
                </div>
              </div>
            </section>

            {/* Error Banner State */}
            {activeState === 'error' && (
              <div className="bg-error-container rounded-xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-error-container">
                <div className="flex items-center gap-space-sm">
                  <div className="p-space-xs rounded-full bg-error text-on-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">sync_problem</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-bold">Portal Synchronization Interrupted</span>
                    <span className="font-body-sm text-body-sm">
                      {error || 'Failed to load grievance records from the Central Grievance Monitoring Registry.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchGrievances}
                  className="px-space-md py-space-xs rounded-lg bg-on-error-container text-error-container hover:opacity-90 transition-all font-label-md text-label-md flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Retry Query</span>
                </button>
              </div>
            )}

            {/* Loading State Skeleton */}
            {activeState === 'loading' && (
              <div className="flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-48 bg-surface-container-high rounded-md animate-pulse" />
                    <div className="h-8 w-32 bg-surface-container-high rounded-md animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-space-sm pt-space-md">
                    <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                    <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                    <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                    <div className="h-16 w-full bg-surface-container-low rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {activeState === 'empty' && (
              <div className="flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl p-space-xl shadow-sm gap-space-md relative overflow-hidden py-16">
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-space-xs">
                  <span className="material-symbols-outlined text-5xl">folder_off</span>
                </div>
                <div className="flex flex-col gap-space-xs max-w-md">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">No Grievances Filed Yet</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Your citizen docket is currently clear. When you encounter civic infrastructure, environmental, or public administrative discrepancies, lodge a formalized grievance here for guaranteed legal turnaround.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm mt-space-sm">
                  <Link
                    to="/submit"
                    className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg shadow-md hover:bg-on-secondary-fixed-variant transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    <span>Lodge Your First Grievance</span>
                  </Link>
                  <button
                    type="button"
                    onClick={fetchGrievances}
                    className="px-space-md py-space-sm rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            )}

            {/* Default State: Main Grievances Table */}
            {(activeState === 'default' || activeState === 'error') && (
              <section className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
                {/* Table Header Toolbar */}
                <div className="p-space-md md:p-space-lg bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-title-md text-title-md text-on-surface font-bold">Active Citizen Dossiers</h2>
                      <span className="px-space-xs py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-semibold">
                        {filteredGrievances.length} Active Records
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Click any grievance row to open its complete audit trail and official dispatch notes.
                    </span>
                  </div>
                  {/* Filters & Quick Search Toolbar */}
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base">search</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by ID or keyword..."
                        className="pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-body-sm focus:outline-none focus:bg-surface-container-lowest transition-colors w-48 sm:w-60"
                      />
                    </div>
                    <button
                      type="button"
                      title="Filter columns"
                      className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">filter_list</span>
                    </button>
                    <button
                      type="button"
                      title="Export as PDF Dossier"
                      className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                  </div>
                </div>

                {/* Grievances Table Content */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Tracking ID</th>
                        <th className="py-space-sm px-space-md font-semibold min-w-[280px]">Subject Line</th>
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Department Name</th>
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Status</th>
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Priority</th>
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Date Submitted</th>
                        <th className="py-space-sm px-space-md font-semibold whitespace-nowrap">Appeal Status / Action</th>
                        <th className="py-space-sm pr-space-md text-right">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm font-body-sm text-on-surface divide-y-0">
                      {filteredGrievances.map((item) => (
                        <tr
                          key={item.id || item.trackingId}
                          onClick={() => navigate('/grievance-detail', { state: { grievanceId: item.id, trackingId: item.trackingId, grievance: item } })}
                          className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                        >
                          <td className="py-space-md px-space-md font-code-tracking text-code-tracking text-secondary font-semibold whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-secondary">tag</span>
                              <span>{item.trackingId || `GRV-${item.id}`}</span>
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-body-md text-body-md font-medium text-on-surface max-w-sm">
                            <div className="flex flex-col">
                              <span className="group-hover:text-secondary transition-colors font-semibold">{item.subject}</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{item.description}</span>
                            </div>
                          </td>
                          <td className="py-space-md px-space-md whitespace-nowrap text-on-surface-variant font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-on-surface-variant">{getDeptIcon(item.departmentName)}</span>
                              {item.departmentName || 'General Grievance Directorate'}
                            </span>
                          </td>
                          <td className="py-space-md px-space-md whitespace-nowrap">
                            {item.status === 'IN_PROGRESS' && (
                              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                In Progress
                              </span>
                            )}
                            {item.status === 'RESOLVED' && (
                              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                                Resolved
                              </span>
                            )}
                            {(item.status === 'SUBMITTED' || item.status === 'PENDING') && (
                              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-variant text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-secondary" />
                                Pending
                              </span>
                            )}
                            {item.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-error" />
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-space-md px-space-md whitespace-nowrap">
                            {item.priority === 'HIGH' && (
                              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                                <span className="material-symbols-outlined text-xs">priority_high</span>
                                High
                              </span>
                            )}
                            {item.priority === 'MEDIUM' && (
                              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                                <span className="material-symbols-outlined text-xs">drag_handle</span>
                                Medium
                              </span>
                            )}
                            {item.priority === 'LOW' && (
                              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                                <span className="material-symbols-outlined text-xs">arrow_downward</span>
                                Low
                              </span>
                            )}
                          </td>
                          <td className="py-space-md px-space-md whitespace-nowrap font-code-tracking text-code-tracking text-on-surface-variant">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-space-md px-space-md whitespace-nowrap">
                            {item.isAppealed ? (
                              <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold shadow-sm">
                                <span className="material-symbols-outlined text-xs">bolt</span>
                                <span>⚡ Appealed (Under Re-Review)</span>
                              </span>
                            ) : item.feedback ? (
                              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
                                Feedback Submitted (★ {item.feedback.rating}/5)
                              </span>
                            ) : item.status === 'RESOLVED' ? (
                              <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-space-xs py-0.5 rounded font-semibold">
                                Rate Resolution
                              </span>
                            ) : (
                              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
                                Standard Docket
                              </span>
                            )}
                          </td>
                          <td className="py-space-md pr-space-md text-right whitespace-nowrap">
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary group-hover:translate-x-1 transition-all">
                              chevron_right
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="px-space-md py-space-sm bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Showing 1 to {filteredGrievances.length} of {filteredGrievances.length} registered grievances
                  </span>
                  <div className="flex items-center gap-space-xs">
                    <button type="button" disabled className="px-space-sm py-1 rounded bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed font-label-sm text-label-sm">
                      Previous
                    </button>
                    <button type="button" className="px-space-sm py-1 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">
                      1
                    </button>
                    <button type="button" disabled className="px-space-sm py-1 rounded bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed font-label-sm text-label-sm">
                      Next
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Guidance Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                  </div>
                  <h3 className="font-title-md text-title-md font-bold text-on-surface mt-1">Guaranteed SLA Turnaround</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Under Citizen Charter 2024, municipalities must triage submissions within 48 hours and provide formalized closure within 15 working days.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold hover:underline cursor-pointer">
                  <span>Read Statutory Timeline Guidelines</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">gavel</span>
                  </div>
                  <h3 className="font-title-md text-title-md font-bold text-on-surface mt-1">First Appellate Tribunal</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Dissatisfied with a resolution? You hold the legal prerogative to invoke a First Appellate Re-Review within 30 days of closure with an appeal statement.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold hover:underline cursor-pointer">
                  <span>Appellate Procedure Documentation</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                  </div>
                  <h3 className="font-title-md text-title-md font-bold text-on-surface mt-1">24/7 Redressal Assistance</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Need real-time telephonic guidance filing or citing an emergency municipal hazard? Dial toll-free national dispatch <span className="font-code-tracking text-code-tracking text-on-surface font-bold">1800-419-8900</span>.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold hover:underline cursor-pointer">
                  <span>View Local Ward Centers</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high py-space-md px-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div>Administrative Console • Centralized Public Grievance Redress and Monitoring System</div>
          <div className="flex items-center gap-space-lg">
            <span className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-sm text-secondary">lock</span>
              ISO 27001 Certified System
            </span>
            <span>Logged in from IP: 10.42.18.91</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
