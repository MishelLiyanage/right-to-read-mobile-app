import { DownloadProgress, PullBooksResponse, PullBooksService } from '@/services/pullBooksService';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from './ThemedText';

interface PullBooksDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PullBooksDialog({ visible, onClose, onSuccess }: PullBooksDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [zipInfo, setZipInfo] = useState<PullBooksResponse | null>(null);
  const [stage, setStage] = useState<'initial' | 'downloading' | 'extracting' | 'complete'>('initial');

  const handlePullBooks = async () => {
    setIsLoading(true);
    setStage('downloading');
    
    try {
      // Use the new combined download and extract method
      const result = await PullBooksService.downloadAndExtractZipWithProgress((progress) => {
        setDownloadProgress(progress);
        // Update stage based on progress
        if (progress.progress >= 0.9) {
          setStage('extracting');
        }
      });

      if (result.success && result.zipFileUri) {
        setZipInfo(result);
        setStage('complete');
        
        Alert.alert(
          'Success!',
          'Books have been successfully downloaded and processed.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess();
                handleClose();
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      console.error('Error in pull books process:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to download books',
        [{ text: 'OK' }]
      );
      setStage('initial');
    } finally {
      setIsLoading(false);
      setDownloadProgress(null);
    }
  };

  const handleClose = () => {
    setStage('initial');
    setDownloadProgress(null);
    setZipInfo(null);
    setIsLoading(false);
    onClose();
  };

  const getProgressPercentage = () => {
    if (!downloadProgress) return 0;
    return Math.round(downloadProgress.progress * 100);
  };

  const getStageText = () => {
    switch (stage) {
      case 'downloading':
        return 'Downloading books...';
      case 'extracting':
        return 'Extracting files...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Ready to download';
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>📚 Pull Books</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.description}>
              Download the latest books from the server
            </ThemedText>

            {zipInfo && (
              <View style={styles.fileInfo}>
                <ThemedText style={styles.fileName}>📁 {zipInfo.fileName}</ThemedText>
                {zipInfo.fileSize && (
                  <ThemedText style={styles.fileSize}>
                    Size: {PullBooksService.formatFileSize(zipInfo.fileSize)}
                  </ThemedText>
                )}
              </View>
            )}

            <View style={styles.statusContainer}>
              <ThemedText style={styles.statusText}>{getStageText()}</ThemedText>
              
              {isLoading && (
                <View style={styles.progressContainer}>
                  <ActivityIndicator size="large" color="#4A90E2" />
                  
                  {downloadProgress && stage === 'downloading' && (
                    <View style={styles.progressInfo}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
                        />
                      </View>
                      <ThemedText style={styles.progressText}>
                        {getProgressPercentage()}% ({PullBooksService.formatFileSize(downloadProgress.totalBytesWritten)} / {PullBooksService.formatFileSize(downloadProgress.totalBytesExpectedToWrite)})
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.downloadButton,
                isLoading && styles.downloadButtonDisabled,
              ]}
              onPress={handlePullBooks}
              disabled={isLoading}
            >
              <ThemedText style={styles.downloadButtonText}>
                {isLoading ? 'Processing...' : 'Download Books'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 15,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressInfo: {
    width: '100%',
    marginTop: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
