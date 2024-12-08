import React, { useState } from 'react';
import getDisplayDate from '@/lib/date_geter';
import { CopyPlus, CopyMinus, Clock, User2, AlarmClockPlus,AlarmClockMinus} from "lucide-react";
import { auth } from '@/lib/firebase';
import { DeleteDialog } from './dialog/confirm_delet';
import EditWaitCardDialog from './dialog/edit_dialog';
import { Badge } from "@/components/ui/badge"
import FirebaseServices from '@/services/firebase/firebase_services';
import Link from 'next/link';
import getUserNameFirstLettersForErrorWidget from '@/lib/userName_for_pfpWidget';

export default function WaitCardWidget({ 
  waitCard, 
  onToggleWaitList, 
  onEditWaitCard, 
  onDeleteWaitCard,
  isEditable,
}) {
  //* manage state vars
  const [isErrorSignedOnPfpLoad, setIsErrorSignedOnPfpLoaded] = useState(false)


  //* get user id
  const userId = auth.currentUser?.uid;

  //* get instance
  const firebase_services = new FirebaseServices()

  //* handle the switch operation
  const handleWitListStateChange = (card, removeCase) => {
    if (removeCase) {
      firebase_services.removeUserFromWaitListInTheWaitCardField(card.id, userId)
      const newUsersList = card.waitingUsers.filter((id) => id !== userId)
      card.waitingUsers = newUsersList
    } else {
      firebase_services.addUserToWaitListInTheWaitCardField(card.id, userId)
      card.waitingUsers.push(userId)
    }
    console.log(card)
    onToggleWaitList(card)
  }

  // Date Part Widget (unchanged from previous version)
  const DatePartWidget = ({ value, name }) => {
    if (value <= 0) return null;
    
    return (
      <span className="flex flex-col text-start">
        <strong className="text-2xl font-semibold text-center border rounded-lg border-white/20 px-1 bg-white/10"> 
          {value}
        </strong>
        <span className="text-xs font-light text-gray-400 pl-0.5 pt-0.5"> 
          {name} 
        </span>
      </span>
    );
  }

  // Display Date Text (unchanged from previous version)
  const DisplayDateText = () => {
    const getItemDate = getDisplayDate(waitCard.waitToDate)
    
    if (getItemDate.case === "0") {
      return (
        <h1 className="text-base font-medium text-white bg-white/5 flex items-center gap-2 border  border-gray-800 rounded-full px-2 py-1">
          <Clock className="text-white" size={20} />
          {getItemDate.data}
        </h1>
      );
    } 
    
    return (
      <h1 className="text-sm text-gray-300 flex gap-2">
        <DatePartWidget value={getItemDate.data.years} name={"Years"} />
        <DatePartWidget value={getItemDate.data.months} name={"Months"} />
        <DatePartWidget value={getItemDate.data.days} name={"Days"} />
        <DatePartWidget value={getItemDate.data.minutes} name={"Minutes"} />
      </h1>
    );
  }

  // Handle Wait List Toggle
  const handleWaitListToggle = () => {
    if (onToggleWaitList && userId !== waitCard.ownerId) {
      onToggleWaitList(userId);
    }
  }

  // Handle Edit Dialog Submit
  const handleEditSubmit = (editedCard) => {
    if (onEditWaitCard) {
      onEditWaitCard(editedCard);
      console.log("clicked")
      setIsEditDialogOpen(false);
    }
  }

  // Handle Delete Confirmation
  const handleDeleteConfirmation = () => {
    if (onDeleteWaitCard) {
      firebase_services.deleteWaitCardFromTheFirebase(waitCard.id,waitCard.ownerId)
      onDeleteWaitCard(waitCard.id);
    }
  }

  // Render Waiting List Users
  const WaitingListUsers = () => {
    if (!waitCard.waitingUsers || waitCard.waitingUsers.length === 0) {
      return (
        <Badge>No one waiting?</Badge>
      );
    }

    return (
      <Badge>{waitCard.waitingUsers.length} <User2 size={12} /></Badge>
    );
  }


  return (
    <div className="w-full max-w-xs relative group">
      <div className="relative w-full h-72 rounded-t-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
        {/* Background Image */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${waitCard.image})`,
            filter: 'brightness(0.8)' 
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black p-4 flex flex-col justify-between text-white ">
          {/* Profile Widget */}
          <div className="flex justify-between items-start">
            {waitCard.owner.photoURL && !isErrorSignedOnPfpLoad
              ? < img
              src={waitCard.owner.photoURL}
              onError={(e) => {
                setIsErrorSignedOnPfpLoaded(true)
              }}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white absolute top-2 right-2 object-cover"
              />
              : <div className='w-10 h-10 rounded-full border-2 border-white absolute top-2 right-2 object-cover bg-black/40 text-center flex items-center justify-center'>
                <strong className='text-white font-semibold text-lg'>
                  {getUserNameFirstLettersForErrorWidget(waitCard.owner.displayName)}
                </strong>
              </div>}
          </div>
          
          {/* Date */}
          <div className="flex flex-col space-y-2">
            <DisplayDateText />
          </div>
          
          {/* WaitList Action Button */}
          <div 
            className="z-20 absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/40 to-black"
            onClick={handleWaitListToggle}
          >
            {userId !== waitCard.ownerId || !isEditable && (
              <div>
                {waitCard.waitingUsers.includes(userId) ? (
                  <button
                  onClick={() => handleWitListStateChange(waitCard, true)}
                    className="flex flex-col items-center cursor-pointer gap-2">
                    <AlarmClockMinus size={60} className="text-white border rounded-full px-4" />
                    <h1 className="text-base font-medium text-white mt-2">Leave the WaitList</h1>
                  </button>
                ) : (
                    <button
                  onClick={() => handleWitListStateChange(waitCard, false)}
                      className="flex flex-col items-center cursor-pointer gap-2">
                    <AlarmClockPlus size={60} className="text-white border rounded-full px-4" />
                    <h1 className="text-base font-medium text-white mt-2">Join WaitList</h1>
                  </button>
                )}
              </div>
            )}

            {userId === waitCard.ownerId && isEditable && (
              <div className='flex gap-4'>
                <EditWaitCardDialog
                  titleValue={waitCard.title}
                  descValue={waitCard.description}
                  imageValue={waitCard.image}
                  cardId={waitCard.id}
                  ownerId={waitCard.ownerId}
                  onEditCard={(editedCard) => handleEditSubmit(editedCard)}
                  dateValue={waitCard.waitToDate} />

                <DeleteDialog onDeleteConfirm={() => handleDeleteConfirmation()} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Title and Waiting List */}
      <div className="mt-2 group-hover:scale-105 hover:text-blue-300 bg-black group-hover:top-20 transition-all duration-300">
      <Link
      href={`/cardPage/${waitCard.id}`}>
        <h1 className="text-lg font-medium truncate">
          {waitCard.title}
        </h1>
        <WaitingListUsers />
        </Link>
      </div>
    </div>
  );
}