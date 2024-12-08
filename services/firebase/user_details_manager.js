import { db } from "@/lib/firebase";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default class UserDetailsManager {
  /**
   * Updates the user profile (display name and/or profile image).
   *
   * @async
   * @function updateUserProfile
   * @param {Object} params - Parameters for the update.
   * @param {string} [params.newUserName] - The new display name to be set for the user.
   * @param {File} [params.newProfileImage] - The new profile picture to be uploaded (optional).
   * @returns {Promise<Object>} The result of the update operation.
   * @throws {Error} If the update operation fails, returns the stack error to be used on a toast.
   */
    updateUserProfile = async ({ newUserName, newProfileImage }) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // If no user is signed in, cancel the operation
    if (!currentUser) return { state: "error", message: "No User Signed-In! (~_~!)", load: null };

    try {
      let updateData = {};

      // Update the username if a new one is provided
      if (newUserName) {
        updateData.displayName = newUserName;
      }

      // Update the profile image if a new one is provided
      if (newProfileImage && newProfileImage.type.includes("image")) {
        updateData.photoURL = await this.uploadImageToServer(newProfileImage);
      }

      // Update the user profile in Firebase Auth
        const updatedUser = await updateProfile(currentUser, updateData);
        // update the users collection data
        const docRef = doc(db, "users", currentUser.uid)
        const docSnapShot = await getDoc(docRef)
        if (docSnapShot.exists()) {
            await updateDoc(docRef,updateData)
        }

      return {
        state: "success",
        message: "User Profile Updated!",
        load: updatedUser, // Return the updated user data
      };
    } catch (error) {
      return { state: "error", message: "Failed to update the user profile (=u=?)", load: error };
    }
  };

  /**
   * Uploads the image to the server and returns the image URL.
   *
   * @async
   * @function uploadImageToServer
   * @param {File} imageFile - The image file to be uploaded.
   * @returns {Promise<string|null>} The URL of the uploaded image, or null if no image was provided or upload fails.
   */
    uploadImageToServer = async (imageFile) => {
        if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile); // Add the file to the form data

    try {
      const response = await fetch("api/connection/upload/upload", {
        method: "POST",
        body: formData, // Send FormData with the file
      });

      const result = await response.json();

      if (result && result.url) {
        return result.url;
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
}
