import { ScrollView } from "react-native";
import WorkspaceAccordion from "./WorkspaceAccordion";

export default function WorkspaceList({ workspaces }) {
  return (
    <ScrollView className="px-4 bg-background flex-1">
      {/* <Text className="text-lg font-semibold text-dark mb-4">
        Espaces de travail
      </Text> */}

      {workspaces.map((ws, i) => (
        <WorkspaceAccordion
          key={i}
        //   name={ws.name}
          id={ws.id}
          name={ws.displayName}
          boards={ws.idBoards}
        />
      ))}
    </ScrollView>
  );
}