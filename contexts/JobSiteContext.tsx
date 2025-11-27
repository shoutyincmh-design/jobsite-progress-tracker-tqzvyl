
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
      console.log('=== LOADING JOB SITES FROM STORAGE ===');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Loaded ${parsed.length} job sites from storage`);
        console.log('First job site:', parsed[0]?.jobName);
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
      console.log(`=== SAVING ${sites.length} JOB SITES TO STORAGE ===`);
      const jsonString = JSON.stringify(sites);
      console.log('JSON string length:', jsonString.length);
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Job sites saved successfully');
      
      // Verify save
      const verification = await AsyncStorage.getItem(STORAGE_KEY);
      if (verification) {
        const verified = JSON.parse(verification);
        console.log(`Verified: ${verified.length} job sites in storage`);
      }
    } catch (error) {
      console.error('Error saving job sites:', error);
    }
  };

  const setJobSites = (sites: JobSite[]) => {
    console.log(`=== SET JOB SITES: ${sites.length} sites ===`);
    setJobSitesState(sites);
    saveJobSites(sites);
  };

  const addJobSites = (newJobSites: JobSite[]) => {
    console.log(`=== ADD JOB SITES: Adding ${newJobSites.length} new sites ===`);
    console.log('Current job sites:', jobSites.length);
    console.log('New job sites to add:', newJobSites.map(js => js.jobName));
    
    const updated = [...jobSites, ...newJobSites];
    console.log('Updated total:', updated.length);
    
    setJobSitesState(updated);
    saveJobSites(updated);
  };

  const clearJobSites = () => {
    console.log('=== CLEARING JOB SITES - RESETTING TO MOCK DATA ===');
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
