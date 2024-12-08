import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import FirebaseServices from "@/services/firebase/firebase_services";

// instances
const firebase_services = new FirebaseServices()
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user; // Authenticated user
    //* create user collection 
    console.log("signed in with google as : ",user.email)
    firebase_services.createNewUserDoc(user)
    return { user };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { error };
  }
};
