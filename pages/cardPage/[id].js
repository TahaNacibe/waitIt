import React, { useEffect, useState, useCallback } from "react";
import { Clock, User, Calendar,ArrowLeft,LogIn,LogOut, Share} from 'lucide-react';
import FirebaseServices from "@/services/firebase/firebase_services";
import { getUserNameFirstLettersForErrorWidget } from "@/lib/userName_for_pfpWidget";
import { useRouter } from "next/router";
import getDisplayDate from "@/lib/date_geter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ShareWaitCardButton } from "@/components/dialog/share_card";
import NumberFlow from '@number-flow/react'


const ProfileAvatar = ({ user, size = "w-12 h-12" }) => {
  const [isErrorOnPfpLoad, setIsErrorOnPfpLoad] = useState(false);
  const { photoURL, displayName } = user;

  const handleImageError = () => {
    setIsErrorOnPfpLoad(true);
  };

  return (
    <div className={`${size} rounded-full overflow-hidden border-2 border-neutral-700`}>
      {photoURL && !isErrorOnPfpLoad ? (
        <img
          src={photoURL}
          alt={`${displayName}'s profile`}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
          <span className="text-neutral-300 font-medium">
            {getUserNameFirstLettersForErrorWidget(displayName)}
          </span>
        </div>
      )}
    </div>
  );
};

const CountdownTimer = ({ waitToDate }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeRemaining = useCallback(() => {
    const result = getDisplayDate(waitToDate);
    
    if (result.case === "0") {
      setIsExpired(true);
      return result.data;
    }

    setIsExpired(false);
    return result.data;
  }, [waitToDate]);

  useEffect(() => {
    const updateTime = () => {
      const result = calculateTimeRemaining();
      
      if (typeof result === 'string') {
        setIsExpired(true);
        return;
      }

      setTimeRemaining({
        years: result.years || 0,
        months: result.months || 0,
        days: result.days || 0,
        hours: result.hours || 0,
        minutes: result.minutes || 0,
        seconds: result.seconds || 0
      });
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [calculateTimeRemaining]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-md">
        <Clock />
        <span className="font-medium">Expired</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
      {[
        { value: timeRemaining.years, label: "Years" },
        { value: timeRemaining.months, label: "Months" },
        { value: timeRemaining.days, label: "Days" },
        { value: timeRemaining.hours, label: "Hours" },
        { value: timeRemaining.minutes, label: "Minutes" },
        { value: timeRemaining.seconds, label: "Seconds" }
      ].map(({ value, label }) => (
        <div key={label} className="bg-neutral-800 p-2 rounded-md">
          <div className="text-2xl font-bold text-neutral-200 border rounded-lg mb-1 border-white/5 bg-white/10">
            <NumberFlow value={value.toString().padStart(2, '0')} />
          </div>
          <div className="text-xs font-light text-neutral-500 uppercase">{label}</div>
        </div>
      ))}
    </div>
  );
};

const WaitingUsersList = ({ users }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-3">
        {users.slice(0, 4).map((user, index) => (
          <ProfileAvatar 
            key={index} 
            user={user} 
            size="w-8 h-8 border-2 border-white" 
          />
        ))}
        {users.length > 4 && (
          <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-xs text-neutral-300">
            +{users.length - 4}
          </div>
        )}
      </div>
      <span className="text-neutral-500 text-sm ml-2">
        {users.length} Waiting
      </span>
    </div>
  );
};


//* action buttons widget
const ActionButtonWidgetRow = ({ waitingIdsList, onWaitingIdsListUpdate,currentCardLink }) => {
  const [user, setUser] = useState()
  const [isUserWaitingForEvent, setIsUserWaitingForEvent] = useState(false)

    useEffect(() => {
        // listen to the changes in the user session
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser)
          setIsUserWaitingForEvent(waitingIdsList.includes(currentUser.uid))
        })
        return () => unsubscribe(); // Cleanup subscription on unmount

    }, [waitingIdsList])
  //* check if the user is in the waiting list
   
  
  //* ui tree
  return (
    <div className="flex gap-4">
      {/* join / leave buttons */}
      <div
        onClick={() => onWaitingIdsListUpdate(user.uid,isUserWaitingForEvent,user)}
        className="rounded-lg bg-black/50 text-white flex gap-2 px-3 py-2 cursor-pointer hover:bg-black/80 transition-all duration-300">
        {isUserWaitingForEvent ? <LogOut /> : < LogIn />}
        <h1> {isUserWaitingForEvent? "Leave waitList" : "Join WaitList"} </h1>
      </div>

      {/* copy button */}
      <ShareWaitCardButton waitCardLink={currentCardLink} />
    </div>
  )
}



// full page ui
export default function CardDetailsPage({ cardDetailsResponse }) {
  //* get data
  const router = useRouter();
  const [parsedData, setParsedData] = useState(JSON.parse(cardDetailsResponse));

  //* instances
  const firebase_services = new FirebaseServices();
  const waitCardLink = `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`

  //* handle the wait state change
  const handleWaitingStateChangeForTheUser = async (cardId, userId, isRemove,user) => {
    if (!cardId || !userId) return; // Ensure required fields are provided

    try {
      if (isRemove) {
        const state = await firebase_services.removeUserFromWaitListInTheWaitCardField(cardId, userId);

        if (state) {
          setParsedData((prevData) => ({
            ...prevData,
            waitingUsers: prevData.waitingUsers.filter((id) => id !== userId),
            waitingUsersDetails: prevData.waitingUsersDetails.filter((user) => user.uid !== userId),
          }));
        }
      } else {
        const state = await firebase_services.addUserToWaitListInTheWaitCardField(cardId, userId);

        if (state) {
          setParsedData((prevData) => ({
            ...prevData,
            waitingUsers: [...prevData.waitingUsers, userId],
            waitingUsersDetails:[...prevData.waitingUsersDetails, user]
          }));
        }
      }
    } catch (error) {
      console.error("Error updating waiting state:", error);
    }
  }

  //* ui tree
  return (
    <div
      style={
        {
          backgroundImage: `url(${parsedData.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // opacity:.2
        }
      }
      className="relative min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4 z-50">
       {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80 z-0"></div>
      <div className="relative z-10 max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl scale-110">
        {/* Left Column - Image */}
        <div className="relative">
          <img 
            src={parsedData.image} 
            alt="Card Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
          <button
            onClick={() => {
              console.log('Button clicked');
              router.back()
            }}
            className="m-2 p-1 rounded-full bg-black/80 w-fit z-10">
            < ArrowLeft size={20}/>
            </button>
            <div>
            <h1 className="text-3xl font-bold mb-4">{parsedData.title}</h1>
            <p className="text-neutral-300 mb-6">{parsedData.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="p-8 space-y-8">
          {/* Owner Details */}
          <div className="flex items-center space-x-4">
            <ProfileAvatar user={parsedData.ownerDetails} />
            <div>
              <div className="font-medium">Created By</div>
              <div className="text-neutral-400">
                {parsedData.ownerDetails.displayName}
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-neutral-500" />
              <h2 className="font-medium text-lg">Time Remaining</h2>
            </div>
            <CountdownTimer waitToDate={parsedData.waitToDate} />
          </div>
          {/* actions button */}
          <ActionButtonWidgetRow
            waitingIdsList={parsedData.waitingUsers}
            currentCardLink = {waitCardLink}
            onWaitingIdsListUpdate={(userId, isWaiting,user) => handleWaitingStateChangeForTheUser(parsedData.id, userId, isWaiting,user)} />
          {/* Waiting Users */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
            <User className="text-neutral-500" />
              <h2 className="font-medium text-sm">Who's waiting?</h2>
            </div>
            <WaitingUsersList users={parsedData.waitingUsersDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  const firebaseServices = new FirebaseServices();
  
  try {
    const response = await firebaseServices.getWaitCardDetailsByCardId(id);
    return {
      props: {
        cardDetailsResponse: JSON.stringify(response || null)
      }
    };
  } catch (error) {
    console.error('Failed to fetch card details:', error);
    return {
      props: {
        cardDetailsResponse: JSON.stringify(null)
      }
    };
  }
}