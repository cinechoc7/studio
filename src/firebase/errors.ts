'use client';
import { getAuth, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  picture?: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, any>;
    sign_in_provider: string;
    tenant?: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a security-rule-compliant auth object from the Firebase User.
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors request.auth in security rules, or null.
 */
async function buildAuthObject(currentUser: User | null): Promise<FirebaseAuthObject | null> {
  if (!currentUser) {
    return null;
  }
  
  const tokenResult = await currentUser.getIdTokenResult();

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    picture: currentUser.photoURL,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    ...tokenResult.claims,
    firebase: {
      identities: tokenResult.claims.firebase?.identities ?? {},
      sign_in_provider: tokenResult.claims.firebase?.sign_in_provider ?? 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object.
 */
async function buildRequestObject(context: SecurityRuleContext): Promise<SecurityRuleRequest> {
  let authObject: FirebaseAuthObject | null = null;
  try {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = await buildAuthObject(currentUser);
    }
  } catch {
    // Fails if Firebase app not initialized, proceed without auth info.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the final, formatted error message for the LLM.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed to be consumed by an LLM for debugging.
 * It structures the error information to mimic the request object
 * available in Firestore Security Rules.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest | null = null;

  constructor(context: SecurityRuleContext, serverError?: Error) {
    // Default message in case async operations fail
    super(serverError?.message || 'Firestore permission error occurred.');
    this.name = 'FirebaseError'; // To match Firebase's error naming
  }
  
  /**
   * Asynchronously initializes the error with full context.
   * This should be called and awaited right after instantiating the error.
   */
  async initialize() {
    try {
      const requestObject = await buildRequestObject(this.context);
      this.request = requestObject;
      this.message = buildErrorMessage(requestObject);
    } catch (e) {
       console.error("Failed to build detailed permission error:", e);
       // The message will fall back to the one set in the constructor
    }
  }
  
  // Store context privately to use in async initialization
  private context: SecurityRuleContext;
}
