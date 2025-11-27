
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useJobSites } from '@/contexts/JobSiteContext';
import { searchJobSites, sortJobSitesByDueDate } from '@/utils/jobsiteUtils';
import { JobSiteCard } from '@/components/JobSiteCard';
import { IconSymbol } from '@/components/IconSymbol';

export default function JobSitesScreen() {
  const { jobSites } = useJobSites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'name'>('dueDate');

  const filteredAndSortedJobs = useMemo(() => {
    let jobs = searchJobSites(jobSites, searchQuery);
    
    if (sortBy === 'dueDate') {
      jobs = sortJobSitesByDueDate(jobs);
    } else {
      jobs = [...jobs].sort((a, b) => a.jobName.localeCompare(b.jobName));
    }
    
    return jobs;
  }, [jobSites, searchQuery, sortBy]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Sites</Text>
        <Text style={styles.subtitle}>
          {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? 'project' : 'projects'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.text}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, locations, coordinators..."
            placeholderTextColor={`${colors.text}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'dueDate' && styles.sortButtonActive]}
            onPress={() => setSortBy('dueDate')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'dueDate' && styles.sortButtonTextActive]}>
              Due Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
              Name
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredAndSortedJobs.length > 0 ? (
          filteredAndSortedJobs.map((jobSite, index) => (
            <React.Fragment key={index}>
              <JobSiteCard jobSite={jobSite} />
            </React.Fragment>
          ))
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={64}
              color={colors.text}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No job sites found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search query
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.7,
  },
  sortButtonTextActive: {
    color: colors.background,
    opacity: 1,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
});
