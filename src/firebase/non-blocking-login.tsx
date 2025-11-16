'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';


export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return new Promise((resolve, reject) => {
    signInAnonymously(authInstance).then(resolve).catch(reject);
  });
}

export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
   return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(authInstance, email, password).then(resolve).catch(reject);
  });
}

export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(authInstance, email, password).then(resolve).catch(reject);
  });
}

export function signOutUser(authInstance: Auth): Promise<void> {
    return signOut(authInstance);
}
