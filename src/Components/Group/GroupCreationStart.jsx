import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiUsers } from "react-icons/fi";

const GroupCreationStart = ({ setCurrentStep }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveringCreate, setIsHoveringCreate] = useState(false);
  const [isHoveringJoin, setIsHoveringJoin] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`bg-white flex items-center justify-center ${
        isMobile ? "p-4 " : "p-6 "
      }`}
    >
      <div
        className={`bg-white rounded-xl overflow-hidden ${
          isMobile ? "w-full p-6" : "max-w-md w-full p-8"
        }`}
      >
        <div className="text-center mb-8">
          <img src="/public/create-group.svg" alt="" className="mb-4" />
          <h1
            className={`font-bold ${
              isMobile ? "text-xl" : "text-2xl"
            } text-gray-800 mb-3`}
          >
            Create New Saving’s Group
          </h1>
          <p className="text-gray-500 text-sm">
            You are about to Join or Create a new group select either of the
            buttons to begin your journey
          </p>
        </div>

        <div className="space-y-4">
          <button
            className={`w-full border-none text-[#3390D5] flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-300 bg-[#3390D524] ${
              isHoveringJoin
                ? "bg-gray-100 shadow-md transform -translate-y-0.5"
                : " border shadow-sm"
            } `}
            onClick={() => navigate("/join-group")}
            onMouseEnter={() => setIsHoveringJoin(true)}
            onMouseLeave={() => setIsHoveringJoin(false)}
            aria-label="Join existing group"
          >
            <FiUsers className="mr-2" size={18} />
            <span className="font-medium">Join Existing Group</span>
          </button>

          <button
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-300 ${
              isHoveringCreate
                ? "bg-blue-600 shadow-md transform -translate-y-0.5"
                : "bg-blue-500 shadow-sm"
            } text-white`}
            onClick={() => setCurrentStep(2)}
            onMouseEnter={() => setIsHoveringCreate(true)}
            onMouseLeave={() => setIsHoveringCreate(false)}
            aria-label="Create new group"
          >
            <FiPlus className="mr-2" size={18} />
            <span className="font-medium">Create New Group</span>
          </button>
        </div>

        {/* <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            How it works:
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Create a group and invite members</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Set savings goals and rules</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Track contributions and withdrawals</span>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default GroupCreationStart;
