import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { 
  LogOut, 
  Edit,
  Save,
  X, 
} from "lucide-react";
import WaitCardWidget from "@/components/wait_card";
import NewWaitCardDialog from "@/components/dialog/new_wait_card";
import { handleSignInWithGoogle } from "@/services/auth/sign_in";
import FirebaseServices from "@/services/firebase/firebase_services";
import { Input } from "@/components/ui/input";
import UserDetailsManager from "@/services/firebase/user_details_manager";
import LoadingSpinner from "@/components/animated/loading_spiner";
import { useToast } from "@/hooks/use-toast"
import Image from "next/image";


export default function ProfilePage() {
  // State management
  const [user, setUser] = useState(null);
  const [createdWaitCards, setCreatedWaitCards] = useState([]);
  const [joinedWaitCards, setJoinedWaitCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('created');
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [userDisplayName, setUserDisplayName] = useState()
  const [userPfpImage, setUserPfpImage] = useState()
  const [PfpFile, setPfpFile] = useState()
  const [savingLoading, setSavingLoading] = useState(false)
  
  //* get instance
  const firebase_services = new FirebaseServices()
  const profile_manager = new UserDetailsManager()
  const { toast } = useToast()

  // Authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserDisplayName(currentUser.displayName)
        setUserPfpImage(currentUser.photoURL)
        Promise.all([
          firebase_services.fetchCreatedWaitCards(currentUser).then((created) => setCreatedWaitCards(created)),
          firebase_services.fetchJoinedWaitCards(currentUser).then((joined) => setJoinedWaitCards(joined))
        ]).finally(() => setLoading(false));
      } else {
        setCreatedWaitCards([]);
        setJoinedWaitCards([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = () => {
    auth.signOut();
  };

  // handle cancel
  const cancelEdit = () => {
    setIsEditingProfile(false)
    setUserPfpImage(user.photoURL)
    setUserDisplayName(user.displayName)
  }

  // handle saving changes
  const handleSavingProfileDataChange = async () => {
    setSavingLoading(true)
    // get the class instance
    const response = await profile_manager.updateUserProfile({
      newUserName: userDisplayName, // Pass the user display name here
      newProfileImage: PfpFile, // Pass the user profile image here
    });
    // send notification to user
    toast({
      className:`text-white border-gray-800 ${response.state === "success"? "bg-black" : "bg-red-800"}`,
      title: response.state === "success"? "Profile Updated" : "Failed To Update Profile",
      description: response.state === "success" ? "Your Profile was completely Updated (^u^)/" : response.message,
    })
    // update state
    setIsEditingProfile(!isEditingProfile)
    setSavingLoading(false)
  }

    //* select active section 
    const SectionSelector = () => {
        return (
            <div className="flex mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveSection('created')}
              className={`px-4 py-2 ${
                activeSection === 'created' 
                  ? 'border-b-2 border-white' 
                  : 'text-gray-500'
              }`}
            >
              Created Wait Cards
            </button>
            <button
              onClick={() => setActiveSection('joined')}
              className={`px-4 py-2 transition-all duration-300 ${
                activeSection === 'joined' 
                  ? 'border-b-2 border-white' 
                  : 'text-gray-500'
              }`}
            >
              Joined Wait Cards
            </button>
          </div>
        )
    }

    //* created by me section 
    const CreatedByMe = () => {
        return (
            <div>
                {/* create a card button */}
                <NewWaitCardDialog onCreateWaitCard={(newCard) => setCreatedWaitCards(prev => [...prev,newCard])} />
            {createdWaitCards.length > 0 ? (
                <div className="grid md:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-6 pt-4 pb-4">
                {createdWaitCards.map(card => (
                  <WaitCardWidget
                    key={card.id}
                    waitCard={card}
                    isEditable={true}
                    onToggleWaitList={(updatedCard) => {
                      setCreatedWaitCards(prev => prev.map((oldCard) => {
                        return oldCard.id === updatedCard.id ? updatedCard : oldCard;
                      }))
                    } }
                    onEditWaitCard={(editedCard) => {
                      setCreatedWaitCards(prev => prev.map((oldCard) => {
                        console.log(oldCard.id === editedCard.id, editedCard)
                        return oldCard.id === editedCard.id ? editedCard : oldCard;
                      }))
                    }}
                    onDeleteWaitCard={(removedCardId) => {
                    setCreatedWaitCards(prev => prev.filter((prevCard) => prevCard.id !== removedCardId))
                  }} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                No wait cards created yet
              </p>
            )}
          </div>
        )
    }

    //* joined cards section
    const JoinedToCardsSection = () => {
        return (
            <div>
            {joinedWaitCards.length > 0 ? (
              <div className="grid md:grid-cols-5 grid-cols-1 gap-6 pt-4 pb-4">
                {joinedWaitCards.map(card => (
                  <WaitCardWidget
                    key={card.id}
                    waitCard={card}
                    isEditable={false}
                    onToggleWaitList={(updatedCard) => {
                      setJoinedWaitCards(prev => prev.map((oldCard) => {
                        return oldCard.id === updatedCard.id ? updatedCard : oldCard;
                      }))
                    } }/>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                No wait cards joined yet
              </p>
            )}
          </div>
        )
    }

    const ProfileActionButtons = () => {
      return (
        <div className="flex space-x-3">
          {/* Edit / Save button */}
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Edit className="mr-2 w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => handleSavingProfileDataChange()}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center"
            >
              {savingLoading ? (
                <LoadingSpinner />
              ) : (
                <Save className="mr-2 w-4 h-4" />
              )}
              Save
            </button>
          )}
    
          {/* Cancel / Logout button */}
          {isEditingProfile ? (
            <button
              onClick={cancelEdit}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center"
            >
              <X className="mr-2 w-4 h-4" /> Cancel
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center"
            >
              <LogOut className="mr-2 w-4 h-4" /> Logout
            </button>
          )}
        </div>
      );
    };
    

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <LoadingSpinner />
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center justify-items-center bg-black text-white">
        <Image
          width={500}
          height={500}
          src='ilu/log_in.svg' className="w-1/3 " alt='' />
        <div className="text-center pt-8 flex flex-col items-center">
          <h1 className="text-gray-600 text-xl pb-4">
            Log in to Start creating and managing wait cards
          </h1>
          <div
            onClick={() => handleSignInWithGoogle()}
            className="px-2 py-1 flex w-fit items-center gap-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-white/5 hover:scale-105 transition-all duration-300">
            <Image
              width={150}
              height={150}
              src='google_icon.svg' className="w-10" alt='' />
            <h1 className="text-lg "> Log In with google </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 w-screen h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-10 flex-col gap-4 md:flex-row">
          <div className="flex items-center space-x-6">
           {(isEditingProfile && !savingLoading) && <input
              className="absolute opacity-0 w-20 h-20"
              type="file"
              onChange={(e) => {
              if (e.target.files[0]) {
                setUserPfpImage(URL.createObjectURL(e.target.files[0]))
                setPfpFile(e.target.files[0])
              }
            }}/>}
            <Image
              width={150}
            height={150}  
              src={userPfpImage || "/default-avatar.png"} 
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-white"
            />
            <div>
              {isEditingProfile
                ? <div className="border rounded-xl border-gray-800">
                  {/* edit the user name field */}
                  <Input type=''
                    readOnly={savingLoading}
                    onChange={(e) => setUserDisplayName(e.target.value)}
                    value={userDisplayName} />
                </div>
                : <h1 className="text-2xl font-bold"> {/* user name display */}
                {userDisplayName || "User Profile"}
              </h1>}
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          
          {/* Header Action Buttons */}
          <ProfileActionButtons />
        </div>
        {/* Wait Cards Section Selector */}
        <SectionSelector />
        {/* Wait Cards Display */}
        <div>
          {activeSection === 'created' ? (
           <CreatedByMe />
          ) : (
            <JoinedToCardsSection />
          )}
        </div>
      </div>
    </div>
  );
}

