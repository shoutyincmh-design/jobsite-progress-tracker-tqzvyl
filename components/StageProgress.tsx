
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobSite } from '@/types/jobsite';
import { STAGE_NAMES } from '@/types/jobsite';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface StageProgressProps {
  stages: JobSite['stages'];
}

export function StageProgress({ stages }: StageProgressProps) {
  const stageArray = [
    { name: STAGE_NAMES[0], completed: stages.stage1 },
    { name: STAGE_NAMES[1], completed: stages.stage2 },
    { name: STAGE_NAMES[2], completed: stages.stage3 },
    { name: STAGE_NAMES[3], completed: stages.stage4 },
    { name: STAGE_NAMES[4], completed: stages.stage5 },
  ];

  return (
    <View style={styles.container}>
      {stageArray.map((stage, index) => (
        <React.Fragment key={index}>
          <View style={styles.stageItem}>
            <View style={styles.stageHeader}>
              <View style={[
                styles.stageIcon,
                stage.completed && styles.stageIconCompleted
              ]}>
                {stage.completed ? (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={20}
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.stageNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stageName,
                stage.completed && styles.stageNameCompleted
              ]}>
                {stage.name}
              </Text>
            </View>
            {index < stageArray.length - 1 && (
              <View style={[
                styles.connector,
                stage.completed && styles.connectorCompleted
              ]} />
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stageItem: {
    marginBottom: 8,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIconCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  stageNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.7,
  },
  stageNameCompleted: {
    opacity: 1,
    color: colors.text,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: colors.grey,
    marginLeft: 17,
    opacity: 0.3,
  },
  connectorCompleted: {
    backgroundColor: '#34C759',
    opacity: 1,
  },
});
