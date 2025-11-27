
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { BlurView } from "expo-blur";
import { useTheme } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { parseCSV, generateCSVTemplate } from '@/utils/csvParser';
import { useJobSites } from '@/contexts/JobSiteContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const { jobSites, addJobSites, clearJobSites } = useJobSites();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCSV = async () => {
    try {
      setIsImporting(true);
      console.log('=== IMPORT CSV STARTED ===');
      console.log('Opening document picker...');

      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'application/csv', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Document picker result:', result);

      if (result.canceled) {
        console.log('User cancelled document picker');
        setIsImporting(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        console.error('No assets in result');
        Alert.alert('Error', 'No file was selected');
        setIsImporting(false);
        return;
      }

      const file = result.assets[0];
      console.log('Selected file:', {
        name: file.name,
        uri: file.uri,
        size: file.size,
        mimeType: file.mimeType,
      });

      // Check if file exists
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        console.log('File info:', fileInfo);

        if (!fileInfo.exists) {
          console.error('File does not exist at URI');
          Alert.alert('Error', 'Could not access the selected file. Please try again.');
          setIsImporting(false);
          return;
        }

        if (fileInfo.size === 0) {
          console.error('File is empty (size = 0)');
          Alert.alert('Error', 'The selected file is empty');
          setIsImporting(false);
          return;
        }

        console.log(`File exists, size: ${fileInfo.size} bytes`);
      } catch (fileInfoError) {
        console.error('Error getting file info:', fileInfoError);
        // Continue anyway, try to read the file
      }

      // Read file content
      console.log('Reading file content...');
      let fileContent: string;
      
      try {
        fileContent = await FileSystem.readAsStringAsync(file.uri);
        console.log('File read successfully');
        console.log('Content length:', fileContent.length);
        console.log('First 300 characters:', fileContent.substring(0, 300));
      } catch (readError) {
        console.error('Error reading file:', readError);
        Alert.alert(
          'Read Error',
          'Could not read the file. Please ensure it is a valid CSV file.',
          [{ text: 'OK' }]
        );
        setIsImporting(false);
        return;
      }

      if (!fileContent || fileContent.trim().length === 0) {
        console.error('File content is empty');
        Alert.alert('Error', 'The selected file is empty or could not be read');
        setIsImporting(false);
        return;
      }

      // Parse CSV
      console.log('Parsing CSV...');
      const parseResult = parseCSV(fileContent);
      console.log('Parse result:', {
        success: parseResult.success,
        dataLength: parseResult.data?.length,
        rowsProcessed: parseResult.rowsProcessed,
        error: parseResult.error,
      });

      if (!parseResult.success) {
        console.error('Parse failed:', parseResult.error);
        Alert.alert(
          'Import Failed',
          parseResult.error || 'Failed to parse CSV file',
          [{ text: 'OK' }]
        );
        setIsImporting(false);
        return;
      }

      // Add imported job sites
      if (parseResult.data && parseResult.data.length > 0) {
        console.log(`Adding ${parseResult.data.length} job sites to context...`);
        console.log('Sample job site:', parseResult.data[0]);
        
        addJobSites(parseResult.data);
        console.log('Job sites added successfully');
        
        Alert.alert(
          'Import Successful',
          `Successfully imported ${parseResult.rowsProcessed} job sites!\n\nTotal job sites: ${jobSites.length + parseResult.data.length}`,
          [{ text: 'OK' }]
        );
      } else {
        console.error('No data in parse result');
        Alert.alert('Error', 'No valid data found in CSV file');
      }

      setIsImporting(false);
      console.log('=== IMPORT CSV COMPLETED ===');
    } catch (error) {
      console.error('=== IMPORT ERROR ===');
      console.error('Error type:', error instanceof Error ? error.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      Alert.alert(
        'Import Error',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      );
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    Alert.alert(
      'CSV Template Format',
      'Your CSV file should have these columns:\n\n' +
      'jobName, jobType, location, coordinator, contractor, stage1, stage2, stage3, stage4, stage5, dueDate, notes\n\n' +
      'Stage values: true/false, yes/no, 1/0, x/blank, completed/blank\n' +
      'Date format: YYYY-MM-DD or any standard date format\n\n' +
      'Example:\n' +
      template,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will remove all imported data and restore the sample data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearJobSites();
            Alert.alert('Success', 'Data has been reset to sample data');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <BlurView intensity={20} tint="dark" style={styles.profileHeader}>
          <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="person" size={80} color={theme.colors.primary} />
          <Text style={[styles.name, { color: theme.colors.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>john.doe@example.com</Text>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.section}>
          <View style={styles.infoRow}>
            <IconSymbol ios_icon_name="phone.fill" android_material_icon_name="phone" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol ios_icon_name="location.fill" android_material_icon_name="location-on" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>San Francisco, CA</Text>
          </View>
        </BlurView>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>

        <BlurView intensity={20} tint="dark" style={styles.section}>
          <View style={styles.statsRow}>
            <Text style={[styles.statsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Total Job Sites:</Text>
            <Text style={[styles.statsValue, { color: theme.colors.text }]}>{jobSites.length}</Text>
          </View>
        </BlurView>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleImportCSV}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol ios_icon_name="square.and.arrow.down.fill" android_material_icon_name="file-download" size={20} color="#fff" />
              <Text style={styles.buttonText}>Import from CSV/Excel</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={handleDownloadTemplate}
        >
          <IconSymbol ios_icon_name="doc.text.fill" android_material_icon_name="description" size={20} color={theme.colors.primary} />
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>View CSV Format</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleResetData}
        >
          <IconSymbol ios_icon_name="arrow.counterclockwise" android_material_icon_name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reset to Sample Data</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>How to Import Data</Text>
          <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666', lineHeight: 22 }]}>
            1. Prepare your Excel file with job site data{'\n'}
            2. Save it as CSV format (.csv){'\n'}
            3. Tap &quot;Import from CSV/Excel&quot; above{'\n'}
            4. Select your CSV file{'\n'}
            5. Your data will be imported automatically{'\n'}
            {'\n'}
            Required columns: jobName, jobType, location, coordinator, contractor, stage1-5, dueDate{'\n'}
            {'\n'}
            Check the console logs for detailed import information.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
    overflow: 'hidden',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 16,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
