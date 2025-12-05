import { Storage } from "@google-cloud/storage";
import { cert } from "firebase-admin/app";

let storage: Storage | null = null;

export function getStorage(): Storage {
  if (!storage) {
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
      throw new Error(
        "Missing Cloud Storage configuration. Please set GCS_PROJECT_ID and GCS_BUCKET_NAME in your environment variables."
      );
    }

    // Use the same credentials as Firebase Admin SDK
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error(
        "Missing Firebase credentials for Cloud Storage. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables."
      );
    }

    // Initialize Storage client with Firebase service account credentials
    const storageOptions: any = {
      projectId: process.env.GCS_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      },
    };

    // If GCS_KEY_FILE_PATH is provided, use it instead
    if (process.env.GCS_KEY_FILE_PATH) {
      storageOptions.keyFilename = process.env.GCS_KEY_FILE_PATH;
      delete storageOptions.credentials;
    }

    storage = new Storage(storageOptions);
  }

  return storage;
}

export function getBucket() {
  const storage = getStorage();
  const bucketName = process.env.GCS_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not set");
  }

  return storage.bucket(bucketName);
}

/**
 * Generate a signed URL for downloading a file
 * @param fileName - Path to the file in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function generateSignedUrl(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(fileName);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresIn * 1000,
  });

  return url;
}

/**
 * Upload a file to Cloud Storage
 * @param fileName - Destination path in the bucket
 * @param buffer - File buffer
 * @param contentType - MIME type
 */
export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType,
    },
  });

  // Note: Files are kept private. Use signed URLs for access.
  // Only make public if explicitly needed (e.g., public images)
  // await file.makePublic();

  // Return the file path (use generateSignedUrl for access)
  return fileName;
}

