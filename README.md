# Expo Productivity + LiveChat App

This cross-platform app was originally built as a **Productivity App** (Assignment 1.8) and later extended into a **LiveChat App with Offline Queued Messages**

### Assignment 1.8:

This is cross-platform personal productivity app built with Expo that works on both mobile (iOS) and web platforms. This app will allow you to create and edit tasks and group them based on priority. The App implements local storage, modern styling, and cross-platform configuration.

### Assignment 2.6:

It works on both **mobile (iOS)** and **web platforms** using Expo + TypeScript.

---

## 🚀 Features

### Productivity (Assignment 1.8)

- Create tasks with title, description, and priority (High, Medium, Low)
- Mark tasks complete/incomplete with visual feedback
- Delete tasks with confirmation
- Filter tasks by status (All / Completed / Open)
- Task list display with priority color coding
- Assign tasks to Categories (Work, Personal, Health)
- Local storage with SQLite
- Secure storage for app settings with Expo SecureStore

### LiveChat (Assignment 2.6)

- Real-time chat using Socket.IO
- Detects client offline/online status
- Queues messages locally while offline
- Automatically sends queued messages once reconnected
- Syncs chat state across multiple clients (cross-platform)
- Demonstrates functionality even when Wi-Fi is turned off and reconnected

### Chat Rooms + @Mentions (Assignment 2.8)

- Multi-room chat ("The OG Chat Room", "Dev-Talk and Rall", "The Tea...")
- Unread badges for inactive channels
- Typing indicators with user names
- Offline outbox (queued messages)
- Presence: join/leave + online status ("X User left... till next time...")
- @mentions parsing w/ csutom highlight (styles for "Pop" in chat)

---

## 🛠 Tech Stack

- **Framework:** Expo (latest)
- **Language:** TypeScript
- **Styling:** React Native `StyleSheet`
- **Database:** SQLite (local task storage)
- **Secure Storage:** Expo SecureStore
- **Navigation:** React Navigation (3 screens)
- **Real-time Messaging:** Socket.IO client + server

---

## Install / Getting Started

1. Clone Repo

```bash
    git clone <repo-url>
    cd ProductivityApp
```

2. Install Dev dependencies

```bash
    npm install
```

3. Run App

- For Mobile (iOs):

```bash
    npx expo start ==ios
```

- For Web:

```bash
    npx expo  start ==web
```

## LiveChat Setup (2.6)

1. Run the Socket.IO server

- Go to the /server folder
- Install server dependencies:

```bash
    npm install
```

2. Start Server

```bash
    npm run dev
```

## Update Client Config

- Inside the App, update the socket URL to match your LAN IP and port (exmple: http://192.168.x.x:3000).

## Test Offline Queue•

- Start app and send a message while connected to WIFI
- TURN OFF WIFI and send more messages- > they should be queued locally
- TURN ON the WIFI -> queued messages will automatically send

### Notes

This project was adapted with help from AI-assisted generation.

- I reviewed and tested all code on both web and iOS.
- Replaced NativeWind with StyleSheet and restructured folders.
- Debugged LAN config and updated client-server socket logic.
- Schema and service logic was extended for presence and offline functionality.
