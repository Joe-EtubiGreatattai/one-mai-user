// Run this once when your app loads
function enforceThemeColors() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const isDark = document.documentElement.classList.contains('dark');
      
      // Force text colors
      document.querySelectorAll('*').forEach(el => {
        if (!['input', 'textarea', 'select', 'button'].includes(el.tagName.toLowerCase())) {
          el.style.color = isDark ? 'white' : '#111827';
        }
        
        // Force backgrounds on main containers
        if (['div', 'section', 'main', 'article'].includes(el.tagName.toLowerCase())) {
          el.style.backgroundColor = isDark ? '#111827' : 'white';
        }
      });
    }, 100);
  }
  
  // Call this whenever theme changes
  window.enforceThemeColors = enforceThemeColors;