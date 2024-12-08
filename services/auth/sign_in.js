import { signInWithGoogle } from "@/pages/api/auth/signIn"

{/* sign in with google logic */ }
const handleSignInWithGoogle = async () => {
    const { user, error } = await signInWithGoogle()
    //* if error exist 
    if (error) {
        alert(`something went wrong while signing in with google ${error}`)
    } else {
        //* else handle the rest
        alert(`signed in as ${user.displayName}`)
        console.log("User Info:", user);
    }
}
    
export {handleSignInWithGoogle}