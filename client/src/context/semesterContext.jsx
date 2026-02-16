import { createContext, useContext, useEffect, useState } from "react";
import { getAllSemesters } from "@/api/semester";

const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const res = await getAllSemesters();

        
        const active = res.data.find(s => s.isActive);
        setSemester(active || null);
      } catch (error) {
        console.error("Failed to load semester");
      } finally {
        setLoading(false);
      }
    };

    fetchSemester();
  }, []);

  return (
    <SemesterContext.Provider value={{ semester, loading }}>
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => useContext(SemesterContext);
