import React from "react";
import DashBoard from "../Pages/DashBoard";
import RecentGroup from "../Components/RecentGroup";
import RecentTransactions from "../Components/RecentTransactions";
import GroupListPage from "../Pages/GroupListPage";
import useAuthStore from "../Store/Auth";

// ✅ Import Language & Support components
import LanguageOptions from "../Components/LanguageOptions";
import ContactSupport from "../Components/ContactSupport";

const DashboardLayout = () => {
  const { user } = useAuthStore();

  return (
    <>
      <DashBoard welcomeOnly={true} />

      <div className="w-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 dark:bg-gray-900 min-h-screen space-y-6">

        {/* ✅ Language and Support section near the top */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <DashBoard />
        
        </div>

        {/* Dashboard main content */}
        <div className="flex flex-col xl:flex-row flex-wrap gap-4">
          <div className="flex-3/6">
            {/* <div className="w-full">
            
                <LanguageOptions />
            </div> */}
            <div className="w-full">
              <GroupListPage titleInside={true} />
            </div>
          
          </div>
          <div className="w-full flex-2/6 min-w-[250px]">
            <RecentTransactions />
          </div>
          
        </div>

     
      </div>
    </>
  );
};

export default DashboardLayout;
