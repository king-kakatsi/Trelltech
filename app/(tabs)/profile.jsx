/* eslint-disable react-hooks/exhaustive-deps */
import {
  View, Text, Pressable, TextInput, Alert,
  ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { updateCurrentUser } from '../../services/trello';
import BottomDrawer from '../../components/ui/BottomDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Zap, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleOpenEdit = () => {
    setEditedName(user?.fullName || '');
    setEditedBio(user?.bio || '');
    setDrawerVisible(true);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await updateCurrentUser({ fullName: editedName, bio: editedBio });
      setDrawerVisible(false);
      Alert.alert('Saved', 'Profile updated! Restart the app to see changes.');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  const initials =
    user?.fullName?.[0]?.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    'U';

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={handleOpenEdit} style={styles.editBtn}>
          <Pencil size={17} color="#0079BF" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 44 }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Avatar Hero ── */}
          <View style={styles.heroSection}>
            <View style={styles.avatarShadow}>
              <LinearGradient
                colors={['#0099EF', '#0079BF', '#004E8C']}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.displayName} numberOfLines={1}>
              {user.fullName || user.username || 'User'}
            </Text>

            {user.username && (
              <Text style={styles.username}>@{user.username}</Text>
            )}

            {user.bio?.trim() ? (
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            ) : (
              <Pressable onPress={handleOpenEdit} style={{ marginTop: 6 }}>
                <Text style={styles.bioEmpty}>Tap to add a bio…</Text>
              </Pressable>
            )}
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Automation section ── */}
          <View style={styles.section}>
            <SectionLabel text="Automation" />
            <ActionCard
              iconBg="rgba(0,121,191,0.12)"
              icon={<Zap size={20} color="#0079BF" />}
              title="Automation Studio"
              subtitle="Build boards, branches & more"
              danger={false}
              onPress={() => router.push('/create-board')}
            />
          </View>

          {/* ── Account section ── */}
          <View style={styles.section}>
            <SectionLabel text="Account" />
            <ActionCard
              iconBg="rgba(235,90,70,0.10)"
              icon={<LogOut size={20} color="#EB5A46" />}
              title="Sign Out"
              subtitle="Log out of your Trello account"
              danger
              onPress={handleLogout}
            />
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── Edit Profile Drawer ── */}
      <BottomDrawer visible={isDrawerVisible} onClose={() => setDrawerVisible(false)}>
        <Text style={styles.drawerTitle}>Edit Profile</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Your name"
            placeholderTextColor="#444"
            style={styles.input}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            value={editedBio}
            onChangeText={setEditedBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#444"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[styles.input, { minHeight: 100 }]}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => setDrawerVisible(false)}
            disabled={isSaving}
            style={[styles.drawerBtn, { backgroundColor: '#242424', flex: 1 }]}
          >
            <Text style={styles.drawerBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.drawerBtn, { backgroundColor: '#0079BF', flex: 1, opacity: isSaving ? 0.65 : 1 }]}
          >
            <Text style={styles.drawerBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </BottomDrawer>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────

function SectionLabel({ text }) {
  return (
    <Text style={{
      color: '#555', fontSize: 11, fontWeight: '700',
      letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12,
    }}>
      {text}
    </Text>
  );
}

function ActionCard({ iconBg, icon, title, subtitle, danger, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 280, friction: 12 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 12 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.actionCard,
          danger && { borderColor: 'rgba(235,90,70,0.2)' },
        ]}
      >
        <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRight size={17} color="#333" />
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────

const styles = {
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#242424',
  },
  headerTitle: {
    color: '#fff', fontSize: 24, fontWeight: '800',
  },
  editBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#242424', borderWidth: 1, borderColor: '#2e2e2e',
    alignItems: 'center', justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24,
  },
  avatarShadow: {
    marginBottom: 18,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48, padding: 3,
  },
  avatarInner: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    color: '#0079BF', fontSize: 36, fontWeight: '800',
  },
  displayName: {
    color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4,
  },
  username: {
    color: '#0079BF', fontSize: 14, fontWeight: '500', marginBottom: 14,
  },
  bioCard: {
    width: '100%', backgroundColor: '#242424', borderRadius: 14,
    borderWidth: 1, borderColor: '#2e2e2e', padding: 14, marginTop: 6,
  },
  bioText: {
    color: '#a1a1aa', fontSize: 14, lineHeight: 21, textAlign: 'center',
  },
  bioEmpty: {
    color: '#444', fontSize: 13, marginTop: 2,
  },
  divider: {
    height: 1, backgroundColor: '#242424', marginHorizontal: 20, marginBottom: 26,
  },
  section: {
    paddingHorizontal: 20, marginBottom: 8,
  },
  actionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#242424', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2e2e2e',
  },
  iconBubble: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  actionTitle: {
    color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2,
  },
  actionSubtitle: {
    color: '#666', fontSize: 13,
  },
  drawerTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 24,
  },
  inputLabel: {
    color: '#666', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff',
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 14, fontSize: 15,
    borderWidth: 1, borderColor: '#2e2e2e',
  },
  drawerBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  drawerBtnText: {
    color: '#fff', fontWeight: '600', fontSize: 15,
  },
};
