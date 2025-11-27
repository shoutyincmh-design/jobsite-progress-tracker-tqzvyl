
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { JobSite } from '@/types/jobsite';
import { calculateProgress, getProgressColor, formatDate, getDaysUntilDue, getDueDateStatus } from '@/utils/jobsiteUtils';
import { ProgressRing } from './ProgressRing';
import { colors } from '@/styles/commonStyles';

interface JobSiteCardProps {
  jobSite: JobSite;
}

export function JobSiteCard({ jobSite }: JobSiteCardProps) {
  const router = useRouter();
  const progress = calculateProgress(jobSite.stages);
  const progressColor = getProgressColor(progress);
  const daysUntil = getDaysUntilDue(jobSite.dueDate);
  const dueDateStatus = getDueDateStatus(jobSite.dueDate);

  const handlePress = () => {
    router.push(`/(tabs)/jobsites/${jobSite.id}`);
  };

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
    return `${daysUntil} days left`;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <ProgressRing 
            progress={progress} 
            size={70} 
            strokeWidth={6}
            color={progressColor}
          />
        </View>
        
        <View style={styles.middleSection}>
          <Text style={styles.jobName} numberOfLines={1}>
            {jobSite.jobName}
          </Text>
          <Text style={styles.jobType}>{jobSite.jobType}</Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {jobSite.location}
          </Text>
          <Text style={styles.coordinator}>
            👤 {jobSite.coordinator}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.dueDate, { color: getDueDateColor() }]}>
            {getDueDateText()}
          </Text>
          <Text style={styles.dueDateValue}>
            {formatDate(jobSite.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    marginRight: 16,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  jobName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 3,
  },
  coordinator: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.8,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  dueDateValue: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
});
