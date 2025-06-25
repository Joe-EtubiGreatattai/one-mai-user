import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useRegisterSW } from "virtual:pwa-register/react";
import usePWAInstall from "./Components/usePWAInstall";
import useAuthStore from "./Store/Auth";

// Pages Routes
import SignIn from "./Pages/SignIn";
import CreateAccount from "./Pages/CreateAccount";
import OtpVerification from "./Pages/OtpVerification";
import CreatePin from "./Pages/CreatePin";
import ResetPassword from "./Pages/ResetPassword";
import CheckYourMail from "./Pages/CheckYourMail";
import CreateNewPassword from "./Pages/CreateNewPassword";
import HomePage from "./Pages/HomePage";
import Referrals from "./Pages/Referals";
import GroupCreationFlow from "./Pages/GroupCreationFlow";
import GroupListPage from "./Pages/GroupListPage";
import GroupListTable from "./Pages/GroupListPage";
import NotificationPage from "./Pages/NotificationPage";
import AccountTypeSelection from "./Pages/AccountTypeSelection";

// Components
import Layout from "./Components/Layout";
import DashboardLayout from "./Components/DashboardLayout";
import ProfilePage from "./Components/profile/ProfilePage";
import ChatPage from "./Components/ChatPage";
import VerifyPin from "./Components/VerifyPin";
import JoinGroupPage from "./Pages/JoinGroupPage";
import TermAndCondition from "./Pages/TermAndCondition";
import Privacy from "./Pages/Privacy";
// Auth Protected Route Component
const ProtectedRoute = () => {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

// Auth Public Route Component
const PublicRoute = () => {
  const { user } = useAuthStore();
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  // PWA Installation Prompt
  const [isInstallable, triggerInstall] = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let darkMode = localStorage.getItem("darkMode");
    if (darkMode == "true") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Service Worker Update Handling
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("Service Worker registered:", swUrl);
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  useEffect(() => {
    if (!isInstallable) return;
    const timer = setTimeout(() => setShowBanner(true), 5000);
    return () => clearTimeout(timer);
  }, [isInstallable]);

  // Close offline ready/update notifications
  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <Toaster />

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<CreateAccount />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/create-pin" element={<CreatePin />} />
          <Route path="/terms" element={<TermAndCondition />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/check-mail" element={<CheckYourMail />} />
          <Route path="/change-password" element={<CreateNewPassword />} />
          <Route path="/account-type" element={<AccountTypeSelection />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/verify/twoFactor" element={<VerifyPin />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardLayout />} />
             <Route path="/join-group" element={<JoinGroupPage />} />
            <Route path="/refearals" element={<Referrals />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/group" element={<GroupListTable />} />
            <Route path="/groupList" element={<GroupListPage />} />
            <Route path="/groupCreation" element={<GroupCreationFlow />} />
            <Route path="/group/:groupId" element={<ChatPage />} />
            <Route path="/notification" element={<NotificationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
