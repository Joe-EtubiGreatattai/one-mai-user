import React from "react";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="text-white text-lg animate-pulse">
        Loading...
      </div>
    </div>
  );
};

export default FullScreenLoader;
