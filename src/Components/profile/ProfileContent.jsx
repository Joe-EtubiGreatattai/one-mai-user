import React from "react";
import BankDetailsForm from "./BankDetailsForm";
import WalletDetails from "./Wallet";
import SecuritySettings from "./PasswordSecurity";
import NotificationSettings from "./NotificationSettings";
import ProfileInfo from "./ProfileForm";

const ProfileContent = ({
  activeTab,
  user,
  updateProfile,
  darkMode,
  setError,
  setSuccess,
  walletBalance,
  userWallet,
  accounts,
  transactions
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileInfo 
            user={user} 
            updateProfile={updateProfile}
            darkMode={darkMode}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      case "security":
        return (
          <SecuritySettings 
            updateProfile={updateProfile}
            darkMode={darkMode}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      case "notifications":
        return <NotificationSettings darkMode={darkMode} />;
      case "bank":
        return (
          <BankDetailsForm 
            darkMode={darkMode}
            accounts={accounts}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      case "wallet":
        return (
          <WalletDetails
            darkMode={darkMode}
            balance={walletBalance}
            wallet={userWallet}
            transactions={transactions}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      default:
        return (
          <ProfileInfo 
            user={user} 
            updateProfile={updateProfile}
            darkMode={darkMode}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
    }
  };

  return (
    <div
      id="profile-content-scroll"
      className={`flex-1 p-4 md:p-6 lg:p-8 rounded-lg shadow-md transition-all ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="min-h-[60vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileContent;
