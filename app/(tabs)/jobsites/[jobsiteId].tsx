
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { mockJobSites } from '@/data/jobsites';
import { calculateProgress, getProgressColor, formatDate, getDaysUntilDue, getDueDateStatus } from '@/utils/jobsiteUtils';
import { ProgressRing } from '@/components/ProgressRing';
import { StageProgress } from '@/components/StageProgress';
import { IconSymbol } from '@/components/IconSymbol';

export default function JobSiteDetailScreen() {
  const { jobsiteId } = useLocalSearchParams();
  const router = useRouter();
  
  const jobSite = mockJobSites.find(job => job.id === jobsiteId);

  if (!jobSite) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job site not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const progress = calculateProgress(jobSite.stages);
  const progressColor = getProgressColor(progress);
  const daysUntil = getDaysUntilDue(jobSite.dueDate);
  const dueDateStatus = getDueDateStatus(jobSite.dueDate);

  const getDueDateColor = () => {
    switch (dueDateStatus) {
      case 'overdue': return '#FF3B30';
      case 'urgent': return '#FF9500';
      case 'upcoming': return '#007AFF';
      default: return colors.text;
    }
  };

  const getDueDateText = () => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `${daysUntil} days remaining`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButtonIcon}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <ProgressRing 
            progress={progress} 
            size={100} 
            strokeWidth={10}
            color={progressColor}
          />
          <View style={styles.progressInfo}>
            <Text style={styles.jobName}>{jobSite.jobName}</Text>
            <Text style={styles.jobType}>{jobSite.jobType}</Text>
          </View>
        </View>

        <View style={styles.dueDateCard}>
          <View style={styles.dueDateHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={24}
              color={getDueDateColor()}
            />
            <Text style={[styles.dueDateStatus, { color: getDueDateColor() }]}>
              {getDueDateText()}
            </Text>
          </View>
          <Text style={styles.dueDateValue}>
            Due: {formatDate(jobSite.dueDate)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.accent}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{jobSite.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={colors.accent}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Coordinator</Text>
              <Text style={styles.infoValue}>{jobSite.coordinator}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol
                ios_icon_name="hammer.fill"
                android_material_icon_name="construction"
                size={20}
                color={colors.accent}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contractor</Text>
              <Text style={styles.infoValue}>{jobSite.contractor}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion Stages</Text>
          <StageProgress stages={jobSite.stages} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Updates</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{jobSite.notes}</Text>
            <Text style={styles.notesDate}>
              Last updated: {formatDate(jobSite.updatedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Created:</Text>
              <Text style={styles.timelineValue}>{formatDate(jobSite.createdAt)}</Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Last Updated:</Text>
              <Text style={styles.timelineValue}>{formatDate(jobSite.updatedAt)}</Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Due Date:</Text>
              <Text style={styles.timelineValue}>{formatDate(jobSite.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.readOnlyNotice}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.readOnlyText}>
            You have view-only access to this job site
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  progressCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  progressInfo: {
    flex: 1,
    marginLeft: 20,
  },
  jobName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  jobType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  dueDateCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  dueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateStatus: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  dueDateValue: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.8,
    marginLeft: 36,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notesCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notesText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  notesDate: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  timelineCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineLabel: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.7,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  readOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}20`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  readOnlyText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
