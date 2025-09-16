import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface School {
  school_id: string;
  name: string;
  location?: string;
  username: string; 
}

interface SchoolState {
  schools: School[];
  addSchool: (school: School) => void;
  removeSchool: () => void;
  // Optional: Add a method to get the current school's username
  getSchoolUsername: () => string | null;
}

const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      schools: [],

      addSchool: (school: School) =>
        set({
          schools: [school], // overwrite everything with new school
        }),

      removeSchool: () =>
        set({
          schools: [],
        }),

      // Helper method to get the current school's username
      getSchoolUsername: () => {
        const { schools } = get();
        return schools.length > 0 ? schools[0].username : null;
      }
    }),
    {
      name: "school-storage",
    }
  )
);

export default useSchoolStore;