import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
  if (app) {
    return db!;
  }

  if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    return db;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    // Don't throw during build time - will fail at runtime when actually used
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "Firebase not initialized. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables."
      );
    }
    return null as any; // Will fail at runtime if used without config
  }

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  db = getFirestore(app);
  return db;
}

export function getDb(): Firestore {
  if (!db) {
    db = initializeFirebase();
  }
  if (!db) {
    throw new Error(
      "Firebase not initialized. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables."
    );
  }
  return db;
}

