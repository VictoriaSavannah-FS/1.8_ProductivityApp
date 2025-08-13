# Welcome to Expo Productivity App

This is cross-platform personal productivity app built with Expo that works on both mobile (iOS) and web platforms. This app will allow you to create and edit tasks and group them based on priority. The App implements local storage, modern styling, and cross-platform configuration.

## Features

- Create tasks with title, description, and priority (High, Medium, Low)
- Mark tasks complete/incomplete with visual feedback
- Delete tasks with confirmation
- Filter Tasks / Task Status (total Tasks / Completed)
- Task list display with priority color coding
- Assign Tasks to Categories (Work, Personal, Health)

## Tech Stack

- Framework: Expo (@latest version)
- Language: TypeScript
- Styling: Stylesheet
- Database: SQLite (store Tasks)
- SecureStore: Expo SecureStore (Storing Settings)
- Navigation: React Navigation (3 screens)

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
    npx start ==ios
```

- For Web:

```bash
    npx start ==web
```
