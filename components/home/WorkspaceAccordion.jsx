import { Ionicons } from '@expo/vector-icons';
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWorkspaceMembers } from '../../services/workspaces'; // added import
import BoardList from './BoardList';

export default function WorkspaceAccordion({ id, name, boards = [], onOpen }) {
  const [open, setOpen] = useState(false);

  // Added states for members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  // Palette and utilities to match BoardCard design
  const getInitialsColor = (index) => {
    const colors = [
      '#0079BF', '#D29034', '#519839', '#B04632',
      '#89609E', '#CD5A91', '#4BBF6B', '#00AECC'
    ];
    return colors[index % colors.length];
  };

  const getColorFromString = (str) => {
    const colors = [
      '#0079BF', '#D29034', '#519839', '#B04632',
      '#89609E', '#CD5A91', '#4BBF6B', '#00AECC'
    ];
    if (!str) return colors[0];
    const charCode = str.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // toggle on simple press
  const handlePress = () => {
    setOpen(!open);
  };

  // call onOpen on long press only
  const handleLongPress = () => {
    if (typeof onOpen === "function") onOpen(id);
  };

  // Fetch workspace members when opening the accordion
  useEffect(() => {
    let mounted = true;
    const fetchMembers = async () => {
      setMembersError(null);
      setMembersLoading(true);
      try {
        const res = await getWorkspaceMembers(id);
        // handle both helpers that return [success, data] or direct data
        let data;
        if (Array.isArray(res) && typeof res[0] === 'boolean') {
          const [success, payload] = res;
          if (!success) throw payload;
          data = payload;
        } else {
          data = res;
        }
        if (!mounted) return;
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load workspace members', err);
        setMembersError(err);
        setMembers([]);
      } finally {
        if (mounted) setMembersLoading(false);
      }
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
        delayLongPress={500} // optionnel, ajustez la durée si besoin
        className="flex-row items-center justify-between px-3 py-3"
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: getColorFromString(name) }}
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

      {/* LISTE DES BOARDS (reproduit le même design que la page Boards) */}
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
                    {members.slice(0, 8).map((m, index) => {
                      const initials = (m.initials || (m.fullName ? m.fullName.split(' ').map(s => s[0]).join('').slice(0,2) : '?')).toUpperCase();
                      return (
                        <View key={m.id || m.username} className="mr-2 items-center">
                          <View
                            style={{ backgroundColor: getInitialsColor(index) }}
                            className="w-8 h-8 rounded-full justify-center items-center"
                          >
                            <Text className="text-xs font-bold text-white">{initials}</Text>
                          </View>
                        </View>
                      );
                    })}
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
            </View>
          ) : (
            <BoardList boards={boards} />
          )}
        </View>
      )}
    </View>
  );
}