import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    // Initialize language from localStorage or default to English
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const languageButtonRef = useRef(null);
  const languageDropdownRef = useRef(null);

  // Language translations
  const translations = {
    en: {
      title: "A Community Approach to Saving for all Pocket Sizes",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      contactSupport: "Contact Support"
    },
    pt: {
      title: "Uma Abordagem Comunitária para Poupança para Todos os Bolsos",
      createAccount: "Criar Conta",
      alreadyHaveAccount: "Já tem uma conta?",
      signIn: "Entrar",
      contactSupport: "Contactar Suporte"
    },
    fr: {
      title: "Une Approche Communautaire de l'Épargne pour Toutes les Bourses",
      createAccount: "Créer un Compte",
      alreadyHaveAccount: "Vous avez déjà un compte?",
      signIn: "Se Connecter",
      contactSupport: "Contacter le Support"
    },
    es: {
      title: "Un Enfoque Comunitario para el Ahorro para Todos los Bolsillos",
      createAccount: "Crear Cuenta",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      signIn: "Iniciar Sesión",
      contactSupport: "Contactar Soporte"
    }
  };

  const languageOptions = {
    en: "English",
    pt: "Português", 
    fr: "Français",
    es: "Español"
  };

  const t = (key) => translations[language][key] || key;

  const handleContactSupport = () => {
    console.log("Contact support clicked");
    navigate("/support");
  };

  const handleLanguageChange = (selectedLang) => {
    setLanguage(selectedLang);
    localStorage.setItem('language', selectedLang);
    setShowLanguageDropdown(false);
    console.log("Language selected:", selectedLang);
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  // Handle click outside for language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageButtonRef.current &&
        !languageButtonRef.current.contains(event.target) &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLanguageDropdown]);

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg,rgba(52, 145, 213, 1) 40%, rgba(1, 29, 79, 1) 100%)",
          height: "100%",
          width: "100%",
        }}
      />

      {/* Language Selector + Contact Support */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-3 sm:space-x-4">
        {/* Language Dropdown */}
        <div className="relative">
          <button
            ref={languageButtonRef}
            onClick={toggleLanguageDropdown}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 sm:p-2.5 rounded-full text-sm sm:text-base shadow-lg hover:bg-white/20 transition-all duration-200 cursor-pointer flex items-center space-x-2"
            aria-label="Select language"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <span className="hidden sm:inline">{languageOptions[language]}</span>
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showLanguageDropdown && (
            <div 
              ref={languageDropdownRef} 
              className="absolute right-0 mt-2 w-40 sm:w-44 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 z-50"
            >
              {Object.entries(languageOptions).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`block w-full px-4 py-3 text-sm text-left transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                    language === code 
                      ? 'bg-blue-500/20 text-blue-900 font-medium' 
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support Button */}
        <button
          onClick={handleContactSupport}
          className="bg-white/10 backdrop-blur-sm border border-white/20 
            rounded-full p-3 sm:p-4 
            text-white hover:bg-white/20 transition-all duration-200
            shadow-lg hover:shadow-xl active:scale-95
            flex items-center justify-center group"
          title={t('contactSupport')}
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Content */}
      <div className="relative z-10 w-full max-w-[985px] mx-auto hidden md:flex gap-8 items-center justify-center flex-col">
        <h1 className="text-4xl md:text-[62px] font-normal text-white mb-3 sm:mb-4 md:mb-2 text-center">
          {t('title')}
        </h1>
        <div className="flex items-center justify-center flex-col gap-8">
          <button
            className="h-12 flex items-center justify-center p-4 px-28 rounded-sm font-semibold text-[15px] text-[#1F2937] 
                      text-base sm:text-lg bg-white transition-all 
                      shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            {t('createAccount')}
          </button>

          <div className="flex items-center space-x-2">
            <p className="text-gray-200 text-sm sm:text-base">
              {t('alreadyHaveAccount')}
            </p>
            <button
              className="text-white hover:text-gray-300 font-medium underline transition-colors text-sm sm:text-base"
              onClick={() => navigate("/signin")}
            >
              {t('signIn')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="pt-52 pb-16 h-dvh relative block md:hidden">
        <div className="h-2 rounded-full bg-white min-w-36 absolute bottom-2 left-1/2 -translate-x-1/2"></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-[442px] h-[665px] rounded-[90px] opacity-30"
          style={{
            borderColor: "#fff",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        ></div>
        <div
          className="absolute top-28 right-10 w-[442px] h-[665px] rounded-[90px] opacity-30"
          style={{
            borderColor: "#fff",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        ></div>

        <div className="relative z-10 flex justify-between flex-col h-full">
          <h1 className="text-4xl md:text-[52px] font-normal text-white mb-3 sm:mb-4 md:mb-6 w-[300px]">
            {t('title')}
          </h1>

          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <button
              className="h-12 w-full flex items-center justify-center p-4 rounded-sm font-bold text-[#1F2937] 
                      text-base sm:text-lg bg-white transition-all 
                      shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              {t('createAccount')}
            </button>

            <div className="flex items-center space-x-2">
              <p className="text-gray-200 text-sm sm:text-base">
                {t('alreadyHaveAccount')}
              </p>
              <button
                className="text-white hover:text-gray-300 font-medium underline transition-colors text-sm sm:text-base"
                onClick={() => navigate("/signin")}
              >
                {t('signIn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;