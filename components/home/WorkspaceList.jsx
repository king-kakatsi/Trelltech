import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import WorkspaceAccordion from "./WorkspaceAccordion";

export default function WorkspaceList({ workspaces, loading, refreshing, onRefresh }) {
  const { token, user } = useAuth();
  const ok = () =>{
    Alert.alert("ok")
  }
  // const [workspaces, setWorkspaces] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [refreshing, setRefreshing] = useState(false);

  // const fetchWorkspaces = async (currentToken) => {
  //   try {
  //     setLoading(true);
  //     const data = await getAllWorkspaces(currentToken);

  //     // adapter selon la forme renvoyée par l'API
  //     if (Array.isArray(data)) {
  //       if (data[0] === true) {
  //         setWorkspaces(data[1]);
  //       }
  //     } else {
  //       console.warn('Format inattendu des workspaces:', data);
  //       setWorkspaces([]);
  //     }
  //   } catch (err) {
  //     setWorkspaces([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onRefresh = async () => {
  //   if (!token) {
  //     console.log("Pas de token disponible pour rafraîchir.");
  //     return;
  //   }
  //   setRefreshing(true);
  //   try {
  //     await fetchWorkspaces(token);
  //   } catch (err) {
  //     console.warn("Erreur pendant le rafraîchissement :", err);
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  // n'appeler la requête que lorsque token est disponible
  // useEffect(() => {
  //   if (!token) {
  //     console.log('Token pas encore disponible, attente...');
  //     return;
  //   }
  //   fetchWorkspaces(token);
  // }, [token]);

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