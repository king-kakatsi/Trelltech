import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import WorkspaceAccordion from "./WorkspaceAccordion";

export default function WorkspaceList({workspaces,loading, refreshing}) {
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
    <View style={{ flex: 1 }}>
      
      {loading && (
        <View style={styles.loadingContainer} className="mt-10">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}
      {/* <View className="flex w-full">
        <TouchableOpacity
          // onPress={() => setOptions(true)}
          className="px-3 py-2 rounded bg-[#3a3a3a]"
          accessibilityLabel="Options"
        ></TouchableOpacity>
      </View> */}
      <ScrollView
        className="px-4 bg-background flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            // onRefresh={onRefresh}
            colors={["#2563EB"]} // android indicator color
            tintColor="#2563EB"  // ios indicator color
          />
        }
      >
        {
          loading ? "" :
          workspaces.map((ws) => (
            <View key={ws.id} onClick={ok} className="" > 
              <WorkspaceAccordion
              id={ws.id}
              name={ws.displayName}
              boards={ws.idBoards}
            />
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    zIndex: 9999,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
});