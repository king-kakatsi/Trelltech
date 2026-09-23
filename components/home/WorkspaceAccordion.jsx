import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWorkspaceMembers } from '../../services/workspaces';
import { getMemberColor } from '../../utils/memberColors';
import MemberAvatar from '../ui/MemberAvatar';
import BoardList from './BoardList';

export default function WorkspaceAccordion({ id, name, boards = [], onOpen }) {
  const [open, setOpen] = useState(false);

  // Added states for members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  const handlePress = () => {
    setOpen((prev) => !prev);
  };

  const handleLongPress = () => {
    if (typeof onOpen === "function") onOpen(id);
  };

  useEffect(() => {
    let mounted = true;

    const fetchMembers = async () => {
      setMembersError(null);
      setMembersLoading(true);

      const response = await getWorkspaceMembers(id);

      if (!mounted) return;

      if (response.success) {
        setMembers(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Failed to load workspace members', response.error);
        setMembersError(response.error || 'Failed to load members');
        setMembers([]);
      }

      setMembersLoading(false);
    };

    if (open) {
      fetchMembers();
    }

    return () => { mounted = false; };
  }, [open, id]);

  return (
    <View className="mb-3 bg-neutral-800 rounded-md shadow-sm border border-neutral-700 overflow-hidden">
      {/* HEADER */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        className="flex-row items-center justify-between px-3 py-3"
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: getMemberColor(name) }}
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
            >
              <Text className="font-bold text-center text-white">
                {(name || '').charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text className="text-white text-base">
              {name}
            </Text>
          </View>
        </View>

        {open ? (
          <ChevronUp size={20} color="#9ca3af" />
        ) : (
          <ChevronDown size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* Board list (matches the workspace boards page design) */}
      {open && (
        <View className="p-3">
          {/* Members section */}
          <View className="mb-3">
            {membersLoading ? (
              <Text className="text-neutral-400">Loading members…</Text>
            ) : membersError ? (
              <Text className="text-red-400">Failed to load members</Text>
            ) : members.length === 0 ? (
              <View className="py-2 flex-row items-center">
                <Ionicons name="people-outline" size={18} color="#6b7280" />
                <Text className="text-neutral-400 ml-2">No members</Text>
              </View>
            ) : (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  <View className="flex-row items-center">
                    {members.slice(0, 8).map((m) => (
                      <View key={m.id || m.username} className="mr-2 items-center">
                        <MemberAvatar member={m} size={32} />
                      </View>
                    ))}
                    {members.length > 8 && (
                      <View className="ml-1 items-center justify-center">
                        <View className="w-8 h-8 rounded-full bg-neutral-700 items-center justify-center">
                          <Text className="text-xs font-bold text-white">+{members.length - 8}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>
                <Text className="text-neutral-400 text-xs">{members.length} member{members.length > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>

          {boards.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="folder-open-outline" size={28} color="#6b7280" />
              <Text className="text-neutral-400 mt-2">No boards in this workspace</Text>
              <Link
              href={`workspace/${id}/boards`}
                className="bg-white mt-3 px-6 py-3 rounded-xl"
              >
                <Text className="text-gray-900 font-semibold">
                  Access to the workspace
                </Text>
              </Link>
            </View>
          ) : (
            <BoardList boards={boards} workspaceId={id} />
          )}
        </View>
      )}
    </View>
  );
}