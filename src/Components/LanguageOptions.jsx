import React, { useState } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

const LanguageOptions = ({ onChange }) => {
  const [selectedLang, setSelectedLang] = useState("en");

  const handleChange = (e) => {
    const selectedCode = e.target.value;
    setSelectedLang(selectedCode);
    if (onChange) onChange(selectedCode);
  };

  return (
    <div className="w-full sm:max-w-md bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <GlobeAltIcon className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Language Preference</h3>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Select your preferred language for using the platform.
      </p>

      <select
        value={selectedLang}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageOptions;
