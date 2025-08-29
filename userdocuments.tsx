import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface Document {
  id: string;
  name: string;
  uri: string;
  createdAt: string;
  pages: number;
  type: 'scan' | 'pdf';
}

const DOCUMENTS_KEY = 'camscanner_documents';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const stored = await AsyncStorage.getItem(DOCUMENTS_KEY);
      if (stored) {
        const parsedDocuments = JSON.parse(stored);
        setDocuments(parsedDocuments);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocuments = async (newDocuments: Document[]) => {
    try {
      await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(newDocuments));
      setDocuments(newDocuments);
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const addDocument = async (uri: string, name: string): Promise<Document> => {
    try {
      let finalUri = uri;
      
      if (Platform.OS !== 'web') {
        const documentDir = `${FileSystem.documentDirectory}camscanner/`;
        await FileSystem.makeDirectoryAsync(documentDir, { intermediates: true });

        const fileName = `${Date.now()}.jpg`;
        const newUri = `${documentDir}${fileName}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });
        
        finalUri = newUri;
      }
      // On web, we keep the original URI (blob URL or data URL)

      const newDocument: Document = {
        id: Date.now().toString(),
        name: name || `Scan ${new Date().toLocaleDateString()}`,
        uri: finalUri,
        createdAt: new Date().toISOString(),
        pages: 1,
        type: 'scan',
      };

      const updatedDocuments = [newDocument, ...documents];
      await saveDocuments(updatedDocuments);
      
      return newDocument;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const documentToDelete = documents.find(doc => doc.id === id);
      if (documentToDelete && Platform.OS !== 'web') {
        await FileSystem.deleteAsync(documentToDelete.uri, { idempotent: true });
      }
      // On web, we don't need to delete files from filesystem as they're blob URLs
      
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      await saveDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDocuments = documents.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      );
      await saveDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  return {
    documents,
    isLoading,
    addDocument,
    deleteDocument,
    updateDocument,
    loadDocuments,
  };
}
