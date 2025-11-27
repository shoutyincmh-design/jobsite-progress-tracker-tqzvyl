
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobSite } from '@/types/jobsite';
import { mockJobSites } from '@/data/jobsites';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JobSiteContextType {
  jobSites: JobSite[];
  setJobSites: (jobSites: JobSite[]) => void;
  addJobSites: (newJobSites: JobSite[]) => void;
  clearJobSites: () => void;
  isLoading: boolean;
}

const JobSiteContext = createContext<JobSiteContextType | undefined>(undefined);

const STORAGE_KEY = '@jobsites_data';

export function JobSiteProvider({ children }: { children: React.ReactNode }) {
  const [jobSites, setJobSitesState] = useState<JobSite[]>(mockJobSites);
  const [isLoading, setIsLoading] = useState(true);

  // Load job sites from storage on mount
  useEffect(() => {
    loadJobSites();
  }, []);

  const loadJobSites = async () => {
    try {
      console.log('Loading job sites from storage...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Loaded ${parsed.length} job sites from storage`);
        setJobSitesState(parsed);
      } else {
        console.log('No stored job sites, using mock data');
      }
    } catch (error) {
      console.error('Error loading job sites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJobSites = async (sites: JobSite[]) => {
    try {
      console.log(`Saving ${sites.length} job sites to storage...`);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
      console.log('Job sites saved successfully');
    } catch (error) {
      console.error('Error saving job sites:', error);
    }
  };

  const setJobSites = (sites: JobSite[]) => {
    setJobSitesState(sites);
    saveJobSites(sites);
  };

  const addJobSites = (newJobSites: JobSite[]) => {
    const updated = [...jobSites, ...newJobSites];
    setJobSitesState(updated);
    saveJobSites(updated);
  };

  const clearJobSites = () => {
    setJobSitesState(mockJobSites);
    saveJobSites(mockJobSites);
  };

  return (
    <JobSiteContext.Provider
      value={{
        jobSites,
        setJobSites,
        addJobSites,
        clearJobSites,
        isLoading,
      }}
    >
      {children}
    </JobSiteContext.Provider>
  );
}

export function useJobSites() {
  const context = useContext(JobSiteContext);
  if (context === undefined) {
    throw new Error('useJobSites must be used within a JobSiteProvider');
  }
  return context;
}
