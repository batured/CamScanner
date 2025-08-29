import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Image as ImageIcon,
  FileText,
  Share,
  Shield,
  HelpCircle,
  Star,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [autoEnhance, setAutoEnhance] = React.useState(true);
  const [saveOriginal, setSaveOriginal] = React.useState(false);
  const [highQuality, setHighQuality] = React.useState(true);

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#2563eb" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <ChevronRight size={20} color="#94a3b8" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scanning</Text>
          
          <SettingItem
            icon={Camera}
            title="Auto Enhancement"
            subtitle="Automatically improve scanned documents"
            showArrow={false}
            rightComponent={
              <Switch
                value={autoEnhance}
                onValueChange={setAutoEnhance}
                trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                thumbColor="#ffffff"
              />
            }
          />

          <SettingItem
            icon={ImageIcon}
            title="Save Original"
            subtitle="Keep original photos alongside enhanced versions"
            showArrow={false}
            rightComponent={
              <Switch
                value={saveOriginal}
                onValueChange={setSaveOriginal}
                trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                thumbColor="#ffffff"
              />
            }
          />

          <SettingItem
            icon={FileText}
            title="High Quality Mode"
            subtitle="Use maximum resolution for scanning"
            showArrow={false}
            rightComponent={
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Sharing</Text>
          
          <SettingItem
            icon={FileText}
            title="Default PDF Quality"
            subtitle="High Quality"
            onPress={showComingSoon}
          />

          <SettingItem
            icon={Share}
            title="Default Share Format"
            subtitle="PDF"
            onPress={showComingSoon}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <SettingItem
            icon={Shield}
            title="Password Protection"
            subtitle="Secure your documents with a password"
            onPress={showComingSoon}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={HelpCircle}
            title="Help & FAQ"
            onPress={showComingSoon}
          />

          <SettingItem
            icon={Star}
            title="Rate CamScanner"
            onPress={showComingSoon}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CamScanner v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for document scanning
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
