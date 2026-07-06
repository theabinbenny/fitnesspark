async function signUp(phone, password, name) {
  if (!auth || !db) throw new Error("Firebase is not configured.");
  if (!validatePhone(phone)) throw new Error("Enter a valid phone number (at least 10 digits).");
  if (!validatePassword(password)) throw new Error("Password must be at least 6 characters.");
  if (!name.trim()) throw new Error("Please enter your name.");

  const email = phoneToEmail(phone);
  const credential = await auth.createUserWithEmailAndPassword(email, password);
  const uid = credential.user.uid;

  await db.collection("users").doc(uid).set({
    phone: normalizePhone(phone),
    name: name.trim(),
    role: "member",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return credential.user;
}

async function signIn(phone, password) {
  if (!auth) throw new Error("Firebase is not configured.");
  if (!validatePhone(phone)) throw new Error("Enter a valid phone number.");
  if (!password) throw new Error("Please enter your password.");

  const email = phoneToEmail(phone);
  return auth.signInWithEmailAndPassword(email, password);
}

async function signOut() {
  if (!auth) return;
  await auth.signOut();
}

async function adminCreateUser(phone, password, name) {
  if (!auth || !db) throw new Error("Firebase is not configured.");
  if (!validatePhone(phone)) throw new Error("Enter a valid phone number (at least 10 digits).");
  if (!validatePassword(password)) throw new Error("Password must be at least 6 characters.");
  if (!name.trim()) throw new Error("Please enter a name.");

  const email = phoneToEmail(phone);
  const secondaryApp = firebase.apps.find((app) => app.name === "AdminCreate")
    || firebase.initializeApp(firebase.app().options, "AdminCreate");
  const secondaryAuth = secondaryApp.auth();

  const credential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
  const uid = credential.user.uid;

  await db.collection("users").doc(uid).set({
    phone: normalizePhone(phone),
    name: name.trim(),
    role: "member",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await secondaryAuth.signOut();
  return uid;
}

async function getCurrentUserProfile() {
  if (!auth || !db) return null;
  const user = auth.currentUser;
  if (!user) return null;

  const doc = await db.collection("users").doc(user.uid).get();
  if (!doc.exists) return { uid: user.uid, role: "member", name: "", phone: "" };
  return { uid: user.uid, ...doc.data() };
}

function requireAuth(redirectTo) {
  const loginPath = redirectTo || `${getBasePath()}login.html`;
  return new Promise((resolve) => {
    if (!auth) {
      window.location.href = loginPath;
      return;
    }
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = loginPath;
        return;
      }
      const profile = await getCurrentUserProfile();
      resolve({ user, profile });
    });
  });
}

function requireAdmin() {
  return requireAuth().then(({ user, profile }) => {
    if (profile.role !== "admin") {
      window.location.href = `${getBasePath()}home.html`;
      return null;
    }
    return { user, profile };
  });
}

function redirectIfAuthenticated(destination) {
  if (!auth) return;
  const dest = destination || `${getBasePath()}home.html`;
  auth.onAuthStateChanged((user) => {
    if (user) window.location.href = dest;
  });
}
