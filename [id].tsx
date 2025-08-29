import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Share,
  Download,
  Palette,
  MoreVertical,
  Check,
  X,
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { useDocuments, Document } from '@/hooks/useDocuments';

const { width } = Dimensions.get('window');

const filters = [
  { id: 'original', name: 'Original', style: {} },
  { id: 'grayscale', name: 'Grayscale', style: { tintColor: '#666666' } },
  { id: 'blackwhite', name: 'B&W', style: { tintColor: '#000000' } },
  { id: 'sepia', name: 'Sepia', style: { tintColor: '#8B4513' } },
];

export default function DocumentScreen() {
  const { id } = useLocalSearchParams();
  const { documents, updateDocument, deleteDocument } = useDocuments();
  const [document, setDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('original');

  useEffect(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setDocument(doc);
      setEditedName(doc.name);
    }
  }, [id, documents]);

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Document not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateDocument(document.id, { name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web-specific sharing logic
        if (navigator.share && navigator.canShare) {
          try {
            // For web, we need to convert the image to a blob first
            const response = await fetch(document.uri);
            const blob = await response.blob();
            const file = new File([blob], `${document.name}.jpg`, { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: document.name,
                text: 'Shared from CamScanner',
                files: [file],
              });
            } else {
              // Fallback: download the file
              const url = URL.createObjectURL(blob);
              const a = (global as any).document.createElement('a');
              a.href = url;
              a.download = `${document.name}.jpg`;
              (global as any).document.body.appendChild(a);
              a.click();
              (global as any).document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } catch (webShareError) {
            console.log('Web Share API failed, falling back to download:', webShareError);
            // Fallback: download the file
            const response = await fetch(document.uri);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = (global as any).document.createElement('a');
            a.href = url;
            a.download = `${document.name}.jpg`;
            (global as any).document.body.appendChild(a);
            a.click();
            (global as any).document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } else {
          // Fallback for browsers without Web Share API
          const response = await fetch(document.uri);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = (global as any).document.createElement('a');
          a.href = url;
          a.download = `${document.name}.jpg`;
          (global as any).document.body.appendChild(a);
          a.click();
          (global as any).document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // Native sharing logic - improved for Android compatibility
        try {
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            Alert.alert('Sharing not available', 'Sharing is not available on this device');
            return;
          }

          // For Android, ensure the file exists and is accessible
          let shareUri = document.uri;
          
          // Check if file exists
          const fileInfo = await FileSystem.getInfoAsync(document.uri);
          if (!fileInfo.exists) {
            Alert.alert('Error', 'Document file not found');
            return;
          }

          // For Android, copy to cache directory for better sharing compatibility
          if (Platform.OS === 'android') {
            const fileName = `${document.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
            const cacheUri = `${FileSystem.cacheDirectory}${fileName}`;
            
            await FileSystem.copyAsync({
              from: document.uri,
              to: cacheUri,
            });
            
            shareUri = cacheUri;
          }

          // Share the document
          await Sharing.shareAsync(shareUri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share Document',
            UTI: 'public.jpeg',
          });
          
        } catch (nativeError) {
          console.error('Native sharing error:', nativeError);
          
          // Fallback: Try without copying to cache
          try {
            await Sharing.shareAsync(document.uri, {
              mimeType: 'image/jpeg',
              dialogTitle: 'Share Document',
            });
          } catch (fallbackError) {
            console.error('Fallback sharing error:', fallbackError);
            Alert.alert(
              'Sharing Error', 
              'Unable to share document. Please check if the file exists and try again.'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert('Error', 'Failed to share document. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(document.id);
            router.back();
          },
        },
      ]
    );
  };

  const applyFilter = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilters(false);
  };

  const currentFilter = filters.find(f => f.id === selectedFilter) || filters[0];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleSaveName}
              >
                <Check size={20} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditedName(document.name);
                }}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.headerTitleText} numberOfLines={1}>
                {document.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Share size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: document.uri }}
            style={[styles.documentImage, currentFilter.style]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Document Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(document.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pages:</Text>
            <Text style={styles.infoValue}>{document.pages}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {document.type === 'scan' ? 'Scanned Document' : 'PDF'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowFilters(true)}
        >
          <Palette size={20} color="#2563eb" />
          <Text style={styles.actionButtonText}>Enhance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Download size={20} color="#2563eb" />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <MoreVertical size={20} color="#64748b" />
          <Text style={[styles.actionButtonText, { color: '#64748b' }]}>More</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enhancement Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersContainer}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterOption,
                      selectedFilter === filter.id && styles.selectedFilter,
                    ]}
                    onPress={() => applyFilter(filter.id)}
                  >
                    <View style={styles.filterPreview}>
                      <Image
                        source={{ uri: document.uri }}
                        style={[styles.filterPreviewImage, filter.style]}
                      />
                    </View>
                    <Text style={styles.filterName}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    paddingVertical: 4,
    textAlign: 'center',
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  documentImage: {
    width: width - 40,
    height: (width - 40) * 1.4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  info: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterOption: {
    alignItems: 'center',
    marginRight: 20,
    padding: 8,
    borderRadius: 12,
  },
  selectedFilter: {
    backgroundColor: '#eff6ff',
  },
  filterPreview: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  filterPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  filterName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
});
