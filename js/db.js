async function getAllExercises() {
  if (!db) return [];
  const snapshot = await db.collection("exercises").orderBy("name").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addExercise(data) {
  if (!db) throw new Error("Firebase is not configured.");
  const ref = await db.collection("exercises").add({
    name: data.name.trim(),
    muscleGroup: data.muscleGroup.trim(),
    equipment: data.equipment.trim() || "None",
    notes: data.notes.trim() || "",
    imageUrl: (data.imageUrl || "").trim(),
    youtubeUrl: (data.youtubeUrl || "").trim(),
    active: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function updateExercise(id, data) {
  if (!db) throw new Error("Firebase is not configured.");
  await db.collection("exercises").doc(id).update({
    name: data.name.trim(),
    muscleGroup: data.muscleGroup.trim(),
    equipment: data.equipment.trim() || "None",
    notes: data.notes.trim() || "",
    imageUrl: (data.imageUrl || "").trim(),
    youtubeUrl: (data.youtubeUrl || "").trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function deleteExercise(id) {
  if (!db) throw new Error("Firebase is not configured.");
  await db.collection("exercises").doc(id).delete();
}

// --- Workouts (templates) ---

async function getAllWorkouts() {
  if (!db) return [];
  const snapshot = await db.collection("workouts").orderBy("name").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getWorkout(workoutId) {
  if (!db || !workoutId) return null;
  const doc = await db.collection("workouts").doc(workoutId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function addWorkout(data) {
  if (!db) throw new Error("Firebase is not configured.");
  const ref = await db.collection("workouts").add({
    name: data.name.trim(),
    focus: data.focus,
    type: data.type,
    exercises: data.exercises || [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function updateWorkout(id, data) {
  if (!db) throw new Error("Firebase is not configured.");
  await db.collection("workouts").doc(id).update({
    name: data.name.trim(),
    focus: data.focus,
    type: data.type,
    exercises: data.exercises || [],
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function deleteWorkout(id) {
  if (!db) throw new Error("Firebase is not configured.");
  await db.collection("workouts").doc(id).delete();
}

async function resolveWorkoutExercises(workout) {
  if (!workout) return { ...workout, resolvedExercises: [] };

  const allExercises = await getAllExercises();
  const exerciseMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const resolvedExercises = (workout.exercises || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item, index) => ({
      ...item,
      order: index + 1,
      exercise: exerciseMap[item.exerciseId] || null,
    }))
    .filter((item) => item.exercise);

  return { ...workout, resolvedExercises };
}

// --- Users ---

async function getAllUsers() {
  if (!db) return [];
  const snapshot = await db.collection("users").orderBy("name").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getMemberUsers() {
  const users = await getAllUsers();
  return users.filter((u) => u.role !== "admin");
}

// --- User schedules (workout assignments per day) ---

async function getUserSchedule(userId) {
  if (!db) return {};
  const doc = await db.collection("userSchedules").doc(userId).get();
  if (!doc.exists) return {};
  return doc.data().days || {};
}

async function saveUserScheduleDay(userId, dayId, workoutId) {
  if (!db) throw new Error("Firebase is not configured.");
  const ref = db.collection("userSchedules").doc(userId);
  const doc = await ref.get();
  const days = doc.exists ? doc.data().days || {} : {};

  if (workoutId) {
    days[dayId] = workoutId;
  } else {
    delete days[dayId];
  }

  await ref.set({
    days,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function saveUserFullSchedule(userId, days) {
  if (!db) throw new Error("Firebase is not configured.");
  await db.collection("userSchedules").doc(userId).set({
    days,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function getUserWorkoutForDay(userId, dayId) {
  const schedule = await getUserSchedule(userId);
  const workoutId = schedule[dayId];
  if (!workoutId) {
    return {
      title: "Rest / Not assigned",
      focus: null,
      type: null,
      exercises: [],
      resolvedExercises: [],
    };
  }

  const workout = await getWorkout(workoutId);
  if (!workout) {
    return {
      title: "Workout not found",
      focus: null,
      type: null,
      exercises: [],
      resolvedExercises: [],
    };
  }

  const resolved = await resolveWorkoutExercises(workout);
  return {
    title: resolved.name,
    focus: resolved.focus,
    type: resolved.type,
    exercises: resolved.resolvedExercises,
    resolvedExercises: resolved.resolvedExercises,
  };
}

async function getUserWeeklyOverview(userId) {
  const schedule = await getUserSchedule(userId);
  const workouts = await getAllWorkouts();
  const workoutMap = Object.fromEntries(workouts.map((w) => [w.id, w]));
  const overview = {};

  for (const day of DAYS) {
    const workoutId = schedule[day.id];
    const workout = workoutId ? workoutMap[workoutId] : null;
    overview[day.id] = {
      workoutId: workoutId || null,
      title: workout ? workout.name : "Not assigned",
      focus: workout?.focus || null,
      type: workout?.type || null,
    };
  }

  return overview;
}
