
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useJobSites } from '@/contexts/JobSiteContext';
import { calculateProgress, getDueDateStatus } from '@/utils/jobsiteUtils';
import { ProgressRing } from '@/components/ProgressRing';

export default function HomeScreen() {
  const { jobSites } = useJobSites();

  const stats = useMemo(() => {
    const totalJobs = jobSites.length;
    const completedJobs = jobSites.filter(job => calculateProgress(job.stages) === 100).length;
    const inProgressJobs = jobSites.filter(job => {
      const progress = calculateProgress(job.stages);
      return progress > 0 && progress < 100;
    }).length;
    const notStartedJobs = jobSites.filter(job => calculateProgress(job.stages) === 0).length;
    
    const overdueJobs = jobSites.filter(job => getDueDateStatus(job.dueDate) === 'overdue').length;
    const urgentJobs = jobSites.filter(job => getDueDateStatus(job.dueDate) === 'urgent').length;
    
    const totalProgress = jobSites.reduce((sum, job) => sum + calculateProgress(job.stages), 0);
    const averageProgress = totalJobs > 0 ? totalProgress / totalJobs : 0;

    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      notStartedJobs,
      overdueJobs,
      urgentJobs,
      averageProgress,
    };
  }, [jobSites]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Job Site Dashboard</Text>
        <Text style={styles.subtitle}>Track all your construction projects</Text>
      </View>

      <View style={styles.overallProgressCard}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <View style={styles.progressRingContainer}>
          <ProgressRing 
            progress={stats.averageProgress} 
            size={120} 
            strokeWidth={12}
            color={colors.accent}
          />
        </View>
        <Text style={styles.progressLabel}>Average Completion</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>
            {stats.completedJobs}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#007AFF' }]}>
            {stats.inProgressJobs}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#8E8E93' }]}>
            {stats.notStartedJobs}
          </Text>
          <Text style={styles.statLabel}>Not Started</Text>
        </View>
      </View>

      <View style={styles.alertsCard}>
        <Text style={styles.cardTitle}>Alerts</Text>
        <View style={styles.alertRow}>
          <View style={[styles.alertDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.alertText}>
            {stats.overdueJobs} {stats.overdueJobs === 1 ? 'job' : 'jobs'} overdue
          </Text>
        </View>
        <View style={styles.alertRow}>
          <View style={[styles.alertDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.alertText}>
            {stats.urgentJobs} {stats.urgentJobs === 1 ? 'job' : 'jobs'} due within 7 days
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 Tap on the Job Sites tab to view and search all projects
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
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
  overallProgressCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  progressRingContainer: {
    marginVertical: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  alertsCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  alertText: {
    fontSize: 15,
    color: colors.text,
  },
  infoCard: {
    backgroundColor: 'rgba(100, 181, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
