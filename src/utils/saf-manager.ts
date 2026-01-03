import * as FileSystem from 'expo-file-system/legacy';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { Alert } from 'react-native';

export class SAFManager {
  directoryUri: string | null;
  constructor() {
    this.directoryUri = null;
  }

  // Step 1: Request directory access from user
  async requestDirectoryAccess() {
    try {
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        this.directoryUri = permissions.directoryUri;
        console.log('Directory access granted:', this.directoryUri);
        return this.directoryUri;
      } else {
        Alert.alert(
          'Permission Denied',
          'Directory access is required to save files'
        );
        return null;
      }
    } catch (error) {
      console.error('Error requesting directory access:', error);
      Alert.alert('Error', 'Failed to request directory access');
      return null;
    }
  }

  // Step 2: Save a file to the selected directory
  async saveFileToDirectory(
    fileName: string,
    content: string,
    mimeType = 'text/plain'
  ) {
    if (!this.directoryUri) {
      Alert.alert('No Directory', 'Please select a directory first');
      return false;
    }

    try {
      // Create the file in the selected directory
      const fileUri = await StorageAccessFramework.createFileAsync(
        this.directoryUri,
        fileName,
        mimeType
      );

      // Write content to the file
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('File saved successfully:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save file');
      return false;
    }
  }

  // Step 3: Save binary file (like images, PDFs, etc.)
  async saveBinaryFile(
    fileName: string,
    base64Content: string,
    mimeType: string
  ) {
    if (!this.directoryUri) {
      Alert.alert('No Directory', 'Please select a directory first');
      return false;
    }

    try {
      const fileUri = await StorageAccessFramework.createFileAsync(
        this.directoryUri,
        fileName,
        mimeType
      );

      await FileSystem.writeAsStringAsync(fileUri, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Binary file saved successfully:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('Error saving binary file:', error);
      Alert.alert('Error', 'Failed to save binary file');
      return false;
    }
  }

  // Step 4: Read files from the directory
  async readFilesFromDirectory() {
    if (!this.directoryUri) {
      Alert.alert('No Directory', 'Please select a directory first');
      return [];
    }

    try {
      const files = await StorageAccessFramework.readDirectoryAsync(
        this.directoryUri
      );
      return files;
    } catch (error) {
      console.error('Error reading directory:', error);
      Alert.alert('Error', 'Failed to read directory');
      return [];
    }
  }

  // Step 5: Check if we have persistent access
  hasDirectoryAccess() {
    return this.directoryUri !== null;
  }

  // Step 6: Get directory URI for storage (save this in AsyncStorage or SecureStore)
  getDirectoryUri() {
    return this.directoryUri;
  }

  // Step 7: Restore directory access from stored URI
  setDirectoryUri(uri: string) {
    this.directoryUri = uri;
  }

  // Step 8: Move file to the selected directory
  async moveFileToDirectory(
    sourceUri: string,
    fileName: string,
    mimeType: string
  ) {
    if (!this.directoryUri) {
      Alert.alert('No Directory', 'Please select a directory first');
      return false;
    }

    try {
      // Create file in selected directory
      const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
        this.directoryUri,
        fileName,
        mimeType
      );

      // Copy file content
      const fileContent = await FileSystem.readAsStringAsync(sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(destUri, fileContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Delete original file
      await FileSystem.deleteAsync(sourceUri);

      console.log('File moved successfully:', destUri);
      return destUri;
    } catch (error) {
      console.error('Error moving file:', error);
      Alert.alert('Error', 'Failed to move file');
      return false;
    }
  }
}
