mport React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MoreVertical, FileText, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useDocuments } from '@/hooks/useDocuments';

export default function DocumentsScreen() {
  const { documents, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteDocument = (id: string, name: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDocument(id),
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => router.push(`/document/${item.id}`)}
    >
      <View style={styles.documentPreview}>
        {item.uri ? (
          <Image source={{ uri: item.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderPreview}>
            <FileText size={32} color="#64748b" />
          </View>
        )}
      </View>
      
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.documentDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.documentSize}>
          {item.pages} {item.pages === 1 ? 'page' : 'pages'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleDeleteDocument(item.id, item.name)}
      >
        <Trash2 size={20} color="#64748b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Documents</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/')}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {filteredDocuments.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Tap the + button to scan your first document'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.documentsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  documentsList: {
    padding: 20,
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentPreview: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#94a3b8',
  },
  moreButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
