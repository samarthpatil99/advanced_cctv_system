import React, { createContext, useContext, useState, useEffect } from 'react';

interface PresentationContextType {
  isPresentationMode: boolean;
  setPresentationMode: (val: boolean) => void;
  togglePresentationMode: () => void;
}

const PresentationContext = createContext<PresentationContextType>({
  isPresentationMode: false,
  setPresentationMode: () => {},
  togglePresentationMode: () => {},
});

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPresentationMode, setIsPresentationModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pres = searchParams.get('presentation')?.toLowerCase();
      const mode = searchParams.get('mode')?.toLowerCase();
      if (pres === 'true' || pres === '1' || pres === 'yes' || mode === 'presentation') {
        return true;
      }
      return localStorage.getItem('drishti_presentation_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setPresentationMode = (val: boolean) => {
    setIsPresentationModeState(val);
    try {
      localStorage.setItem('drishti_presentation_mode', val ? 'true' : 'false');
      const url = new URL(window.location.href);
      if (val) {
        url.searchParams.set('presentation', 'true');
      } else {
        url.searchParams.delete('presentation');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.warn('Could not sync presentation mode with URL', e);
    }
  };

  const togglePresentationMode = () => {
    setPresentationMode(!isPresentationMode);
  };

  // Keyboard shortcut: Alt+P to quickly toggle Presentation Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

  return (
    <PresentationContext.Provider
      value={{
        isPresentationMode,
        setPresentationMode,
        togglePresentationMode,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentationMode = () => useContext(PresentationContext);
