import * as FileSystem from 'expo-file-system';

// Conditional import for react-native-zip-archive (only works in development builds)
let unzip: any = null;
try {
  const zipArchive = require('react-native-zip-archive');
  unzip = zipArchive.unzip;
} catch (error) {
  console.log('react-native-zip-archive not available - running in Expo Go');
}

export interface PullBooksResponse {
  success: boolean;
  zipFileUri?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number;
}

export class PullBooksService {
  // Using your computer's IP address since localhost won't work from mobile device
  private static readonly PULL_BOOKS_ENDPOINT = 'http://192.168.1.200:8000/api/pull_books';
  
  /**
   * Call the Pull Books service to get books data as ZIP file
   */
  static async pullBooks(): Promise<PullBooksResponse> {
    try {
      console.log('Calling Pull Books service to pull books...');

      const response = await fetch(this.PULL_BOOKS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/zip',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get content length for file size
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Generate a unique filename
      const fileName = `books_${Date.now()}.zip`;
      const zipFileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the ZIP file
      const downloadResult = await FileSystem.downloadAsync(
        this.PULL_BOOKS_ENDPOINT,
        zipFileUri
      );

      if (downloadResult.status === 200) {
        return {
          success: true,
          zipFileUri: downloadResult.uri,
          fileName,
          fileSize,
        };
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error pulling books:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Download ZIP file with progress tracking
   */
  static async downloadZipWithProgress(
    onProgress: (progress: DownloadProgress) => void
  ): Promise<PullBooksResponse> {
    try {
      const fileName = `books_${Date.now()}.zip`;
      const zipFileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        this.PULL_BOOKS_ENDPOINT,
        zipFileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress({
            totalBytesWritten: downloadProgress.totalBytesWritten,
            totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
            progress: progress,
          });
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        
        return {
          success: true,
          zipFileUri: result.uri,
          fileName,
          fileSize: fileInfo.exists ? fileInfo.size : 0,
        };
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading ZIP with progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  /**
   * Combined method: Download ZIP file with progress tracking AND extract immediately
   * This ensures the file is properly handled in a single operation
   */
  static async downloadAndExtractZipWithProgress(
    onProgress: (progress: DownloadProgress) => void
  ): Promise<PullBooksResponse> {
    try {
      const fileName = `books_${Date.now()}.zip`;
      const zipFileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log('Starting combined download and extraction process...');

      // Step 1: Download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        this.PULL_BOOKS_ENDPOINT,
        zipFileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress({
            totalBytesWritten: downloadProgress.totalBytesWritten,
            totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
            progress: progress,
          });
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (!result || result.status !== 200) {
        throw new Error('Download failed');
      }

      // Verify file was downloaded successfully
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (!fileInfo.exists) {
        throw new Error('Downloaded file does not exist');
      }

      console.log('Download completed, starting extraction...');

      // Step 2: Extract immediately after download
      const extractionSuccess = await this.extractZipImmediately(result.uri);
      
      if (!extractionSuccess) {
        console.warn('Extraction failed, but download was successful');
        // Don't fail the entire operation - the ZIP file is still available
      }

      return {
        success: true,
        zipFileUri: result.uri,
        fileName,
        fileSize: fileInfo.size || 0,
      };

    } catch (error) {
      console.error('Error in combined download and extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download and extraction failed',
      };
    }
  }

  /**
   * Internal method to extract ZIP immediately after download
   * This works better than the separate extraction method
   */
  private static async extractZipImmediately(zipFileUri: string): Promise<boolean> {
    try {
      console.log('Attempting immediate extraction of:', zipFileUri);
      
      // Create data directory if it doesn't exist
      const dataDir = `${FileSystem.documentDirectory}data/`;
      const dataDirInfo = await FileSystem.getInfoAsync(dataDir);
      
      if (!dataDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dataDir, { intermediates: true });
        console.log('Created data directory:', dataDir);
      }

      // Check if we're in Expo Go or development build
      const isExpoGo = !(global as any).HermesInternal;
      
      if (isExpoGo) {
        console.log('Expo Go detected - using file copy method');
        // In Expo Go, copy the ZIP file to data directory
        const targetPath = `${dataDir}downloaded_books.zip`;
        await FileSystem.copyAsync({
          from: zipFileUri,
          to: targetPath
        });
        console.log('ZIP file copied to data directory successfully');
        return true;
      } else {
        console.log('Development build detected - attempting native extraction');
        // Try native ZIP extraction in development builds
        try {
          if (!unzip) {
            throw new Error('react-native-zip-archive not available');
          }
          console.log('Starting native ZIP extraction...');
          await unzip(zipFileUri, dataDir);
          console.log('Native ZIP extraction completed successfully');
          return true;
        } catch (zipError) {
          console.log('Native extraction failed, falling back to copy method:', zipError);
          // Fallback to copying
          const targetPath = `${dataDir}downloaded_books.zip`;
          await FileSystem.copyAsync({
            from: zipFileUri,
            to: targetPath
          });
          console.log('Fallback copy completed successfully');
          return true;
        }
      }
    } catch (error) {
      console.error('Error in immediate extraction:', error);
      return false;
    }
  }

  /**
   * Extract ZIP file to data folder
   */
  static async extractZipToDataFolder(zipFileUri: string): Promise<boolean> {
    try {
      // For now, let's implement a simple approach that works in Expo Go
      // In a real app, you would use native ZIP extraction
      console.log('Attempting to extract ZIP file:', zipFileUri);
      
      // Create data directory if it doesn't exist
      const dataDir = `${FileSystem.documentDirectory}data/`;
      const dataDirInfo = await FileSystem.getInfoAsync(dataDir);
      
      if (!dataDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dataDir, { intermediates: true });
      }

      // For Expo Go compatibility, we'll simulate extraction by copying the ZIP file
      // In a development build, you would use actual ZIP extraction
      const isExpoGo = !(global as any).HermesInternal; // Simple check for Expo Go
      
      if (isExpoGo) {
        console.log('Running in Expo Go - simulating ZIP extraction');
        // Copy the ZIP file to data directory for now
        const targetPath = `${dataDir}downloaded_books.zip`;
        await FileSystem.copyAsync({
          from: zipFileUri,
          to: targetPath
        });
        console.log('ZIP file copied to data directory (extraction simulated)');
        return true;
      } else {
        // Try to use native ZIP extraction in development builds
        try {
          if (!unzip) {
            throw new Error('react-native-zip-archive not available');
          }
          await unzip(zipFileUri, dataDir);
          console.log('ZIP file extracted successfully using native library');
        } catch (zipError) {
          console.log('Native ZIP extraction failed, using fallback');
          // Fallback to copying
          const targetPath = `${dataDir}downloaded_books.zip`;
          await FileSystem.copyAsync({
            from: zipFileUri,
            to: targetPath
          });
        }
      }
      
      // Clean up - delete the original ZIP file after processing
      await FileSystem.deleteAsync(zipFileUri);
      
      return true;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      return false;
    }
  }

  /**
   * Get formatted file size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
