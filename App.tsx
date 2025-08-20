import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import Index from "./app/index";
import AddTask from "./app/add-Task";
import Settings from "./app/settings";
// nneed to add Chat page ----
import ChatScreen from "./app/chat";
// CollabPaige --
import CollaborativeTasksScreen from "./app/collaborative";

const Stack = createNativeStackNavigator();

// const CURRENT_USER = { id: user, userName: "Demo", name: "Demo" }; // <-- mock user

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Tasks" component={Index} />
        <Stack.Screen
          name="AddTask"
          component={AddTask}
          options={{ title: "Add Task" }}
        />
        {/* ChatScreen ...  */}
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          // // give Chat what it needs without touching other screens
          // initialParams={{ currentUser: CURRENT_USER, roomId: "general" }}
          // initialParams={{ roomId: "general" }}
        />

        {/* <Stack.Screen name="Chat" component={ChatScreen} />
        v */}
        {/* CollabScreen ...  */}
        <Stack.Screen name="Collab" component={CollaborativeTasksScreen} />
        {/* settings page herer ....  */}
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
