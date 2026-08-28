import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Branding from "./components/Branding.jsx";
import LoginCard from "./components/LoginCard.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ApplicationDetail from "./components/ApplicationDetail.jsx";
import LoanApplication from "./components/LoanApplication.jsx";
import SearchFarmers from "./components/SearchFarmers.jsx";
import PortfolioPage from "./components/PortfolioPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import UserProfilePage from "./components/UserProfilePage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminPipelineMonitor from "./components/AdminPipelineMonitor.jsx";
import AdminUserManagement from "./components/AdminUserManagement.jsx";
import AdminMLModelPerformance from "./components/AdminMLModelPerformance.jsx";
import AdminPartnerOnboarding from "./components/AdminPartnerOnboarding.jsx";
import AdminReports from "./components/AdminReports.jsx";
import AdminSystemSettings from "./components/AdminSystemSettings.jsx";
import AdminProfilePage from "./components/AdminProfilePage.jsx";
import AdminFarmersQueue from "./components/AdminFarmersQueue.jsx";
import AdminInstitutionalPartners from "./components/AdminInstitutionalPartners.jsx";
import AdminCommandCenter from "./components/AdminCommandCenter.jsx";
import AdminHelpSupport from "./components/AdminHelpSupport.jsx";
import AdminAddPipeline from "./components/AdminAddPipeline.jsx";
import NotificationsPage from "./components/NotificationsPage.jsx";
import AdminRiskHeatmap from "./components/AdminRiskHeatmap.jsx";
import RegisterFarmerPage from "./components/RegisterFarmerPage.jsx";
import FarmerDisplayData from "./components/FarmerDisplayData.jsx";

const ROUTE_MAP = {
  login: "/login",
  dashboard: "/dashboard",
  applications: "/applications",
  detail: "/applications/detail",
  searchFarmers: "/farmers",
  registerFarmer: "/farmers/register",
  "register-farmer": "/farmers/register",
  farmersQueue: "/admin/farmers-queue",
  riskHeatmap: "/heatmap",
  portfolio: "/portfolio",
  settings: "/settings",
  profile: "/profile",
  notifications: "/notifications",
  admin: "/admin",
  pipelineMonitor: "/admin/pipeline",
  adminAddPipeline: "/admin/add-pipeline",
  "admin-add-pipeline": "/admin/add-pipeline",
  userManagement: "/admin/users",
  mlPerformance: "/admin/ml-performance",
  partnerOnboarding: "/admin/partner-onboarding",
  reports: "/admin/reports",
  systemSettings: "/admin/system-settings",
  adminProfile: "/admin/profile",
  institutionalPartners: "/admin/institutional-partners",
  adminCommand: "/admin/command",
  helpSupport: "/admin/help",
  farmerDisplayData: "/farmers/profile",
  "farmer-display-data": "/farmers/profile"
};

const PATH_TO_PAGE = {
  "/": "dashboard",
  "/login": "login",
  "/dashboard": "dashboard",
  "/applications": "applications",
  "/applications/detail": "detail",
  "/farmers": "searchFarmers",
  "/farmers/profile": "farmerDisplayData",
  "/farmers/register": "registerFarmer",
  "/heatmap": "riskHeatmap",
  "/portfolio": "portfolio",
  "/settings": "settings",
  "/profile": "profile",
  "/notifications": "notifications",
  "/admin": "admin",
  "/admin/pipeline": "pipelineMonitor",
  "/admin/add-pipeline": "adminAddPipeline",
  "/admin/users": "userManagement",
  "/admin/ml-performance": "mlPerformance",
  "/admin/partner-onboarding": "partnerOnboarding",
  "/admin/reports": "reports",
  "/admin/system-settings": "systemSettings",
  "/admin/profile": "adminProfile",
  "/admin/farmers-queue": "farmersQueue",
  "/admin/institutional-partners": "institutionalPartners",
  "/admin/command": "adminCommand",
  "/admin/help": "helpSupport"
};

const BANK_PAGES = {
  searchFarmers: SearchFarmers,
  registerFarmer: RegisterFarmerPage,
  "register-farmer": RegisterFarmerPage,
  farmerDisplayData: FarmerDisplayData,
  "farmer-display-data": FarmerDisplayData,
  portfolio: PortfolioPage,
  settings: SettingsPage,
  profile: UserProfilePage,
  notifications: NotificationsPage
};

const ADMIN_PAGES = {
  admin: AdminDashboard,
  pipelineMonitor: AdminPipelineMonitor,
  adminAddPipeline: AdminAddPipeline,
  "admin-add-pipeline": AdminAddPipeline,
  userManagement: AdminUserManagement,
  mlPerformance: AdminMLModelPerformance,
  partnerOnboarding: AdminPartnerOnboarding,
  reports: AdminReports,
  systemSettings: AdminSystemSettings,
  adminProfile: AdminProfilePage,
  farmersQueue: AdminFarmersQueue,
  verificationQueue: AdminFarmersQueue,
  institutionalPartners: AdminInstitutionalPartners,
  adminCommand: AdminCommandCenter,
  helpSupport: AdminHelpSupport,
  notifications: NotificationsPage,
  riskHeatmap: AdminRiskHeatmap,
  searchFarmers: SearchFarmers,
  registerFarmer: RegisterFarmerPage,
  "register-farmer": RegisterFarmerPage,
  farmerDisplayData: FarmerDisplayData,
  "farmer-display-data": FarmerDisplayData,
  portfolio: PortfolioPage
};

const isAdminUser = (u) =>
  u?.role_name === "Platform Admin" ||
  (u?.role || "").toLowerCase() === "admin" ||
  (u?.role_name || "").toLowerCase() === "admin" ||
  u?.email === "admin@agrilend.com";

function Loader() {
  return (
    <div className="min-h-screen w-full bg-[#F4F6EE] flex items-center justify-center font-sans text-gray-600">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1A532E] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold tracking-wide uppercase text-[#1A532E]">Loading AgriLend...</span>
      </div>
    </div>
  );
}

function LoginScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setSessionUser, refreshUser } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdminUser(user) ? "/admin" : "/dashboard"} replace />;
  }

  const handleLoginSuccess = async (userData) => {
    if (userData) {
      localStorage.setItem("agrilend_user", JSON.stringify(userData));
      if (setSessionUser) {
        setSessionUser(userData);
      }
    }
    await refreshUser();
    navigate(isAdminUser(userData) ? "/admin" : "/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F4F6EE] font-sans antialiased">
      <div className="hidden lg:flex w-[42%] xl:w-[38%] bg-gradient-to-br from-[#0B5A22] via-[#0D441D] to-[#061F0F] p-10 xl:p-14 flex-col justify-between text-white shrink-0 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>
        <Branding />
      </div>
      <div className="flex-1 min-h-screen relative flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto">
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={isAdminUser(user) ? "/admin" : "/dashboard"} replace />;
}

function ProtectedArea() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);

  const isAdmin = isAdminUser(user);
  const userRole = isAdmin ? "admin" : "bank";

  const navigateTo = useCallback((pageKey, options = {}, extraData = null) => {
    if (extraData && (pageKey === "farmerDisplayData" || pageKey === "farmer-display-data")) {
      setSelectedFarmerData(extraData);
    } else if (options && typeof options === "object" && options.name) {
      setSelectedFarmerData(options);
    }
    let keyToUse = pageKey;
    if (isAdmin && (pageKey === "dashboard" || !pageKey)) {
      keyToUse = "admin";
    }
    const targetPath = ROUTE_MAP[keyToUse] || (isAdmin ? "/admin" : "/dashboard");
    navigate(targetPath, { replace: Boolean(options && options.replace) });
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigateTo("login", { replace: true });
  };

  const handleViewReport = (application) => {
    setSelectedApplication(application);
    navigateTo("detail");
  };

  const toDashboard = () => (
    <Dashboard currentPage="dashboard" onNavigate={navigateTo} onLogout={handleLogout} onBack={() => navigateTo("dashboard")} currentUser={user} onUpdateUser={updateProfile} />
  );

  const path = location.pathname.toLowerCase();
  const slug = PATH_TO_PAGE[path] || "dashboard";
  const effectiveSlug = isAdmin && slug === "dashboard" ? "admin" : slug;

  const pageProps = {
    currentPage: effectiveSlug,
    onNavigate: navigateTo,
    onLogout: handleLogout,
    currentUser: user,
    user: user,
    onUpdateUser: updateProfile
  };

  if (isAdmin && ADMIN_PAGES[effectiveSlug]) {
    const Page = ADMIN_PAGES[effectiveSlug];
    return <Page {...pageProps} userRole="admin" farmerData={selectedFarmerData} />;
  }

  if (effectiveSlug === "applications") {
    return <LoanApplication {...pageProps} onViewReport={handleViewReport} />;
  }

  if (effectiveSlug === "detail") {
    return (
      <ApplicationDetail
        application={selectedApplication}
        currentPage="applications"
        onNavigate={navigateTo}
        onBack={() => navigateTo("applications")}
        onLogout={handleLogout}
        currentUser={user}
        onUpdateUser={updateProfile}
      />
    );
  }

  if (BANK_PAGES[effectiveSlug]) {
    const Page = BANK_PAGES[effectiveSlug];
    return <Page {...pageProps} userRole={userRole || "bank"} farmerData={selectedFarmerData} />;
  }

  return toDashboard();
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <HomeRedirect /> : <LoginScreen />} />
      <Route path="/" element={isAuthenticated ? <HomeRedirect /> : <Navigate to="/login" replace />} />
      <Route path="*" element={isAuthenticated ? <ProtectedArea /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
