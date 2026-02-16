import { createContext, useContext, useState } from "react";

const ServiceDraftContext = createContext();

export const ServiceDraftProvider = ({ children }) => {
  const [draft, setDraft] = useState({
    date: null,
    serviceType: "",
    lead: null,
    backups: {
      tenor: [],
      alto: [],
      soprano: []
    }
  });

  const updateDraft = (updates) => {
    setDraft((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const resetDraft = () => {
    setDraft({
      date: null,
      serviceType: "",
      lead: null,
      backups: {
        tenor: [],
        alto: [],
        soprano: []
      }
    });
  };

  return (
    <ServiceDraftContext.Provider
      value={{ draft, updateDraft, resetDraft }}
    >
      {children}
    </ServiceDraftContext.Provider>
  );
};

export const useServiceDraft = () => useContext(ServiceDraftContext);
