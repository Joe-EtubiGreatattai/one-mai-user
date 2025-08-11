// DashboardLayout.jsx
import React from "react";
import { Link } from "react-router-dom";

import DashBoard from "../Pages/DashBoard";
import RecentGroup from "../Components/RecentGroup";
import RecentTransactions from "../Components/RecentTransactions";
import useAuthStore from "../Store/Auth";

const DashboardLayout = () => {
  const { user } = useAuthStore();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-screen">
      {/* Main grid: Left (2/3) — Right (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          {/* Heading + Balance card */}
          <DashBoard />

          {/* Investment Groups */}
          <section>
            {/* Use the compact groups component with title suppressed */}
            <RecentGroup titleInside={true} />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="xl:col-span-1 xl:sticky xl:top-6">
          <RecentTransactions />
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
