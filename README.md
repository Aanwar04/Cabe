# Urban Uplink - Car Dealership 360° Photo App

A React Native mobile application for car dealerships to create 360° photos of vehicles for their inventory.

## 🚗 About

Urban Uplink is a mobile app designed for car dealership administrators to:

- Authenticate securely using Firebase
- Create 360° panoramic photos of vehicles
- Manage car inventory with visual documentation
- Access the app on both iOS and Android platforms

## 📱 Features

- **Secure Authentication**: Firebase email/password login with dealer admin authorization
- **360° Camera**: Capture panoramic photos of cars
- **Project Management**: View and manage car photo projects
- **Profile Management**: User profile settings
- **Cross-Platform**: Works on iOS and Android

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Firebase Authentication** - User authentication
- **React Navigation** - Navigation (Stack + Tabs)
- **react-native-responsive-dimensions** - Responsive UI
- **TypeScript** - Type safety

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- React Native development environment set up
- Firebase project configured

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# OR
yarn install
```

3. Start Metro bundler:

```bash
npm start
# OR
yarn start
```

4. Run on Android:

```bash
npm run android
# OR
yarn android
```

5. Run on iOS:

```bash
npm run ios
# OR
yarn ios
```

## 📁 Project Structure

```
src/
                ├── App.tsx # Main app with auth handling
├── MainPage.tsx            # Dashboard with "Create 360" button
├── LoginPage.tsx           # Firebase authentication login
├── CameraScreen.tsx        # 360° camera capture
├── CameraPreview.tsx       # Preview captured photos
├── MyProjects.tsx          # Projects list view
├── ProfileScreen.tsx       # User profile
├── TabScreens.tsx          # Tab navigation container
├── unAuthorized.tsx        # Unauthorized access screen
├── orientationHook.ts      # Screen orientation handling
└── car.jpg                 # Background image
```

## 🔐 Authentication

The app uses Firebase Authentication with custom claims:

- Only users with the `dealeradmin` claim can access the full app
- Unauthorized users see a restricted access screen
- Email/password authentication method

## 📸 Camera Features

- 360° panoramic photo capture
- Camera preview before saving
- Portrait and landscape orientation support
- Responsive UI for all screen sizes

## 🎨 UI/UX

- Orange (#f56300) primary brand color
- Blue (#0066cc) secondary color
- Dark overlay backgrounds for text readability
- Responsive button sizing with rounded corners

## 📦 Dependencies

Key dependencies include:

- @react-native-firebase/auth
- @react-navigation/native
- @react-navigation/native-stack
- react-native-responsive-dimensions

## 📄 License

This project was bootstrapped with React Native Community CLI.
