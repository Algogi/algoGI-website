"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./client-config";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

// Initialize Firebase app
export function getFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  return app;
}

// Initialize Firebase Analytics
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  // Return cached analytics if already initialized
  if (analytics) {
    return analytics;
  }

  // Check if Analytics is supported (browser environment)
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Analytics is not supported in this environment");
    return null;
  }

  // Get Firebase app
  const firebaseApp = getFirebaseApp();

  // Initialize Analytics
  try {
    analytics = getAnalytics(firebaseApp);
    return analytics;
  } catch (error) {
    console.error("Error initializing Firebase Analytics:", error);
    return null;
  }
}

// Initialize Analytics automatically (call this in a client component)
export async function initFirebaseAnalytics(): Promise<void> {
  if (typeof window === "undefined") {
    return; // Server-side, skip initialization
  }

  try {
    await getFirebaseAnalytics();
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
  }
}


