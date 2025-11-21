import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import WorkspaceAccordion from "./WorkspaceAccordion";

export default function WorkspaceList({ workspaces, loading, refreshing, onRefresh }) {
  const { token, user } = useAuth();

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
          />
        ))}
      </ScrollView>
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