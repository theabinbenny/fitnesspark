# Fitness Park

A mobile-first gym workout app. Members log in with **phone + password** and see today's workout. Admins manage exercises and the weekly plan (Monday–Saturday).

Built with plain **HTML, CSS, and JavaScript** — no build step. Host directly on **GitHub Pages**.

---

## Features

- Phone + password login and signup
- Today's workout view (auto-detects day of week)
- Weekly plan browser (Mon–Sat)
- Admin panel: manage exercises + assign weekly workouts
- Sunday shown as rest day
- Firebase Authentication + Cloud Firestore

---

## Quick start (local)

1. Configure Firebase (see below)
2. Serve the folder locally:

```bash
cd Fitness_park
python3 -m http.server 8080
```

3. Open [http://localhost:8080](http://localhost:8080)

> Use a local server — opening `index.html` directly (`file://`) will break Firebase.

---

## Firebase setup (step by step)

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → name it e.g. `fitness-park`
3. Disable Google Analytics if you don't need it → **Create project**

### 2. Enable Authentication

1. In the sidebar: **Build → Authentication → Get started**
2. Under **Sign-in method**, enable **Email/Password**
3. Save

> The app uses phone numbers as login IDs by mapping them to email format internally (`9876543210@fitnesspark.app`). Users still enter their phone number on screen.

### 3. Create Firestore database

1. **Build → Firestore Database → Create database**
2. Choose **Start in production mode** (we'll deploy rules next)
3. Pick a region close to your users → **Enable**

### 4. Register your web app

1. Project **Settings** (gear icon) → **General**
2. Under **Your apps**, click the web icon `</>`
3. App nickname: `Fitness Park Web`
4. Copy the `firebaseConfig` object

### 5. Paste config into the project

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### 6. Deploy Firestore security rules

Install Firebase CLI (one time):

```bash
npm install -g firebase-tools
firebase login
```

From the project folder:

```bash
cd Fitness_park
firebase use --add          # select your project
firebase deploy --only firestore:rules
```

### 7. Add authorized domains

**Authentication → Settings → Authorized domains** — add:

- `localhost` (usually already there)
- `yourusername.github.io` (when you deploy to GitHub Pages)

### 8. Create your admin account

1. Open the site locally and **sign up** with your phone + password
2. In Firebase Console → **Firestore Database**
3. Open `users` → your user document
4. Change `role` from `"member"` to `"admin"`
5. Refresh the app — you'll see the **Admin** tab

---

## GitHub Pages deployment

1. Push this folder to a GitHub repository
2. Go to repo **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` → folder: `/ (root)` → **Save**
5. Your site will be at `https://yourusername.github.io/repo-name/`
6. Add that domain to Firebase **Authorized domains**

---

## Project structure

```
Fitness_park/
├── index.html          # Entry redirect (login or home)
├── login.html
├── signup.html
├── home.html           # Today's workout
├── week.html           # Weekly plan view
├── admin/
│   ├── exercises.html  # Manage exercise library
│   └── plan.html       # Assign exercises per day
├── css/styles.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── db.js
│   ├── utils.js
│   └── ui.js
├── firestore.rules
└── firebase.json
```

---

## Firestore collections

| Collection    | Document ID   | Fields |
|---------------|---------------|--------|
| `users`       | Firebase UID  | `phone`, `name`, `role`, `createdAt` |
| `exercises`   | Auto ID       | `name`, `muscleGroup`, `equipment`, `notes`, `active` |
| `weeklyPlan`  | `monday`…`saturday` | `title`, `exercises[]`, `updatedAt` |

Each `weeklyPlan` exercise entry:

```json
{
  "exerciseId": "abc123",
  "sets": 3,
  "reps": "8-10",
  "restSec": 90,
  "order": 0
}
```

---

## What to send me for Firebase help

If you want help filling in the config, provide:

1. Your `firebaseConfig` object (apiKey is safe to share — it's public)
2. Your GitHub Pages URL (once deployed)
3. Confirm Email/Password auth is enabled
4. Confirm Firestore rules are deployed

---

## License

MIT
