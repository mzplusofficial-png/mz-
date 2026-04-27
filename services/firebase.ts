import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase with explicit config check
const rawConfig = firebaseConfig;
const config = (rawConfig as any).default || rawConfig;

if (!config.apiKey || config.apiKey === 'remixed-api-key') {
  console.warn('Firebase: API Key is missing or using placeholder. Please run set_up_firebase.');
}

const app = initializeApp(config);

// Initialize Firebase Services
export const db = getFirestore(app, config.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Validate Connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
// testConnection();

// Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const requestNotificationPermission = async (vapidKey: string) => {
  if (!messaging) {
    console.error('FCM: Messaging not supported or initialized');
    return { token: null, status: 'unsupported' };
  }

  try {
    if (!('Notification' in window)) {
      console.error('FCM: Notifications not supported by browser');
      return { token: null, status: 'unsupported' };
    }

    let registration;
    if ('serviceWorker' in navigator) {
      try {
        // Ajout d'un paramètre de version pour forcer la mise à jour sur mobile
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=MZ4', { scope: '/' });
        console.log('FCM: Service Worker registered:', registration.scope);
      } catch (swError) {
        console.error('FCM: Service Worker registration failed:', swError);
      }
    }

    // alert('Demande de permission en cours...');
    const permission = await Notification.requestPermission();
    // alert('Résultat permission: ' + permission);
    console.log('FCM: Permission result:', permission);

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration
      });
      return { token, status: 'granted' };
    } else {
      return { token: null, status: permission };
    }
  } catch (error) {
    console.error('FCM: Error in requestNotificationPermission:', error);
    return { token: null, status: 'error' };
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    console.log('FCM: Foreground message received:', payload);
    callback(payload);
  });
};
