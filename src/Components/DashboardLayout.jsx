import React from "react";
import DashBoard from "../Pages/DashBoard";
import RecentGroup from "../Components/RecentGroup";
import RecentTransactions from "../Components/RecentTransactions";
import GroupListPage from "../Pages/GroupListPage";
import useAuthStore from "../Store/Auth";

const DashboardLayout = () => {
  const { user } = useAuthStore();

  return (
    <>
      <DashBoard welcomeOnly={true} />
      {/* // for dark mode dark:bg-gray-900 */}
      <div className="w-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 dark:bg-gray-900 min-h-screen">
        {/* Main dashboard content */}
        <div className="flex flex-col xl:flex-row flex-wrap gap-4">
          {/* Dashboard section - takes full width on mobile, 2/3 on desktop */}
          <div className="flex-3/6">
            <div className="w-full ">
              <DashBoard />
            </div>
            <div className="w-full ">
              <GroupListPage titleInside={true} />
            </div>
          </div>

          {/* Recent transactions - stacks below on mobile, side panel on desktop */}
          <div className="w-full flex-2/6 min-w-[250px] ">
            <RecentTransactions />
          </div>
        </div>

        {/* Conditional group section */}
        <div className="mt-6 mb-8 w-full">
          {/* {user?.userType === "affiliate" ? <RecentGroup /> : <GroupListPage />} */}
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
