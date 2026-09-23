import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import BottomDrawer from "../ui/BottomDrawer";
import WorkspaceAccordion from "./WorkspaceAccordion";
import WorkspaceOptions from './WorkspaceOptions';

export default function WorkspaceList({ workspaces, loading, refreshing, onRefresh }) {
  const [isListMenuVisible, setListMenuVisible] = useState(false);
  const [selectedAccordionId, setSelectedAccordionId] = useState(null);

  const selectedWorkspace = workspaces.find(ws => ws.id === selectedAccordionId) ?? null;

  const openDrawerFor = (id) => {
    setSelectedAccordionId(id);
    setListMenuVisible(true);
  };

  return (
    <View style={{ flex: 1 }} className="bg-[#1a1a1a]">
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      <ScrollView
        className="flex-1 bg-[#1a1a1a]"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
            progressBackgroundColor="#1a1a1a"
          />
        }
      >
        {loading && !refreshing ? null : workspaces.map((ws) => (
          <WorkspaceAccordion
            key={ws.id}
            id={ws.id}
            name={ws.displayName}
            boards={ws.idBoards}
            onOpen={() => openDrawerFor(ws.id)}
          />
        ))}
      </ScrollView>
      <BottomDrawer
        visible={isListMenuVisible}
        onClose={() => { setListMenuVisible(false); setSelectedAccordionId(null); }}
      >
        <WorkspaceOptions
          selectedAccordionId={selectedAccordionId}
          setSelectedAccordionId={setSelectedAccordionId}
          setListMenuVisible={setListMenuVisible}
          selectedWorkspace={selectedWorkspace}
          onRefresh={onRefresh}
        />
      </BottomDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
});