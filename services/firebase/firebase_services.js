import { auth, db } from "@/lib/firebase";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, FieldValue, getDoc, getDocs, increment, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";


export default class FirebaseServices {

  //* create a new wait card in the data base
  createNewWaitCardInTheFireBase = async (title, imageUrl, desc, waitToDate) => {
    const userId = auth.currentUser.uid;
    if (!userId) return;
  
    try {
      const titleKeywords = title.toLowerCase().split(" ");
      // Create the actual wait card
      const docRef = await addDoc(collection(db, "items"), {
        title: title,
        description: desc,
        createdAt: new Date(),
        waitToDate: waitToDate,
        image: imageUrl,
        waitingUsers: [],
        ownerId: userId,
        titleKeywords:titleKeywords
      });
  
      // Update the document to include the generated ID (optional)
      await updateDoc(docRef, {
        id: docRef.id, // Save the generated ID into the document
      });
  
      // Fetch the item data
      const itemSnapshot = await getDoc(docRef);
      const itemData = itemSnapshot.exists() ? itemSnapshot.data() : null;
  
      // Fetch the user document using the ownerId
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
  
      // Get the user data (this will include the updated PFP if any)
      let userData = {};
      if (userSnapshot.exists()) {
        userData = userSnapshot.data(); // Get the user data if it exists
      }
  
      // Return the item data along with the user data
      return {
        ...itemData, // Spread the item data
        owner: userData, // Add the owner (user) details
      };
  
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  
  
  //* edit and existing card in the data base
  editExistingWaitCardInTheFirebase = async (editedWaitCard, cardId, ownerId) => {
    const userId = auth.currentUser.uid
    // if somehow it's not the owner doing the request cancel
    if (userId !== ownerId) return;
    if (!db) return;
    try {
      const cardRef = doc(db, "items", cardId);
      const titleKeywords = editedWaitCard.title.toLowerCase().split(" ");
      // if the document doesn't exist it can't be updated
      const cardSnap = await getDoc(cardRef)
      if (!cardSnap.exists()) return;
      
      //* update the doc
      await updateDoc(cardRef, {...editedWaitCard,titleKeywords}, { merge: true })
  
      //* get userDetails
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
  
      let userData = {};
      if (userSnapshot.exists()) {
        userData = userSnapshot.data(); // Get the user data if it exists
      }
  
      const updatedCardSnap = await getDoc(cardRef);
      return {
              ...updatedCardSnap.data(),
              owner: userData, // Add the owner (user) details
            };
    } catch (error) {
      console.error("that what happen : ",error)
    }
  }
  
  //* delete an existing card from the db
  deleteWaitCardFromTheFirebase = async (cardId, ownerId) => {
    const userId = auth.currentUser.uid
    if (userId !== ownerId) return;
    try {
      const waitCardRef = doc(db, "items", cardId)
      await deleteDoc(waitCardRef)
      console.log("deleted")
      return true
    } catch (error) {
      console.error("the error stack : ",error)
      return false
    }
  }
  
  //* create a new user doc in db
  createNewUserDoc = async (user) => {
    if (!user) return;
      // just a reference to the user collection
    const userRef = doc(db, "users", user.uid)
       // User data to store
      const userData = {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: new Date().toISOString(),
      createdWaitCards: [],
      joinedToWaitCards:[]
      };
    try {
       // Check if the document exists
       const userSnap = await getDoc(userRef);
       if (userSnap.exists()) {
         return; // Exit if document already exists
       }
      await setDoc(userRef, userData, { merge: true }); // Create or update the document
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  
  }
  

  //* add a user to a wait list for a specific card
  addUserToWaitListInTheWaitCardField = async (cardId, userId) => {
    if (!cardId || !userId) return;
    try {
      //* get doc reference
      const cardDoc = doc(db, "items", cardId)
  
      //* update the card data
      await setDoc(cardDoc, {
        waitingUsers: arrayUnion(userId),
        waitingUsersCount: increment(1)
      },{merge: true})
      return true
    } catch (error) {
      console.error("the problem is : ",error)
      return false
    }
  }
  
  //* remove a user from wait list in a specific card
  removeUserFromWaitListInTheWaitCardField = async (cardId, userId) => {
    if (!cardId || !userId) return;
    try {
      //* get doc reference
      const cardDoc = doc(db, "items", cardId)
  
      //* update the card data
      await setDoc(cardDoc, {
        waitingUsers: arrayRemove(userId),
        waitingUsersCount: increment(-1)
      },{merge:true})
      return true
    } catch (error) {
      console.error("the problem is : ",error)
      return false
    }
  }
  
  //* search for wait card based on a title or part of it
  searchForWaitCardsBasedOnTitleText = async (searchTerm) => {
    try {
      let q;
      console.log("-------------> ",searchTerm)
      if (searchTerm !== "") {
        console.log("yeb that case")
        //* filter logic
        q = query(
          collection(db, "items"),
          where("titleKeywords", "array-contains",searchTerm.toLowerCase())
        )
      } else {
        //* get all items instead 
        q = query(
          collection(db, "items"),
        )
        
      }
  
  
      //* get the cards meting the condition
      const querySnapshot = await getDocs(q)
  
      //* grab each owner pfp by the id for the card
      const cards = await Promise.all(
        querySnapshot.docs.map(async (docItem) => {
          // get required data
          const itemData = docItem.data()
          const ownerId = itemData.ownerId
          // Fetch the user document using the ownerId
          const userRef = doc(db, "users", ownerId);
          const userSnapshot = await getDoc(userRef);
          
          // Get the user data (this will include the updated PFP if any)
          let userData = {};
          if (userSnapshot.exists()) {
            userData = userSnapshot.data(); // Get the user data if it exists
          }
  
          // Return the item data along with the user data
          return {
            ...itemData,
            owner: userData, 
          };
        })
      )
      return cards
    } catch (error) {
      console.error("couldn't get search result stack was : ",error)
      return null
    }
  }



  // Fetch methods for cards created by the user
  fetchCreatedWaitCards = async (currentUser) => {
    if (!currentUser) return;
  
    try {
      // Query to fetch the items based on ownerId
      const q = query(
        collection(db, "items"), 
        where("ownerId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
  
      // Map through the items and get their data
      const cards = await Promise.all(
        querySnapshot.docs.map(async (docData) => {
          const itemData = docData.data();
          const ownerId = itemData.ownerId;
  
          // Fetch the user document using the ownerId
          const userRef = doc(db, "users", ownerId);
          const userSnapshot = await getDoc(userRef);
          
          // Get the user data (this will include the updated PFP if any)
          let userData = {};
          if (userSnapshot.exists()) {
            userData = userSnapshot.data(); // Get the user data if it exists
          }
  
          // Return the item data along with the user data
          return {
            id: doc.id,
            ...itemData,
            owner: userData, // Add the owner (user) details
          };
        })
      );
  
      // Set the state with the cards and their owner data
      console.log("the cards are : ",cards)
      return cards
  
    } catch (error) {
      console.error("Error fetching created wait cards:", error);
    }
  };


  // fetch cards that the user is join to the wait list of
  fetchJoinedWaitCards = async (currentUser) => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "items"), 
        where("waitingUsers", "array-contains", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);

      const cards = await Promise.all(
        querySnapshot.docs.map(async (docData) => {
          const itemData = docData.data();
          const ownerId = itemData.ownerId;
  
          // Fetch the user document using the ownerId
          const userRef = doc(db, "users", ownerId);
          const userSnapshot = await getDoc(userRef);
          
          // Get the user data, why? why did i did that instead of just shoving the user data there to begin with ? well the pfp can be changed i can't give a pfp url that i already removed from the database 
          let userData = {};
          if (userSnapshot.exists()) {
            userData = userSnapshot.data(); // Get the user data if it exists
          }
  
          // Return the item data along with the user data
          return {
            id: doc.id,
            ...itemData,
            owner: userData, // Add the owner (user) details
          };
        })
      );
      return cards
    } catch (error) {
      console.error("Error fetching joined wait cards:", error);
    }
  };


  //* get popular wait cards list of the server
  getPopularWaitCardsList = async () => {
    try {
      //* get all the popular items reference
      const q = query(
        collection(db, "items"),
        orderBy("waitingUsersCount", "desc"),
        limit(10)
      )
      const querySnapshot = await getDocs(q);

      // get the full card object
      const cards = Promise.all(
        querySnapshot.docs.map(async (docData) => {
          // separate data 
          const cardsDate = docData.data()
          const ownerId = cardsDate.ownerId

          // Fetch the user document using the ownerId
          const userRef = doc(db, "users", ownerId);
          const userSnapshot = await getDoc(userRef);

          let userData = {};
          if (userSnapshot.exists()) {
            userData = userSnapshot.data(); // Get the user data if it exists
          }

          // Return the item data along with the user data
          return {
            id: doc.id,
            ...cardsDate,
            owner: userData, // Add the owner (user) details
          };
        }),
      )
      return cards
    } catch (error) {
      console.error("Error fetching popular wait cards:", error);
    }
  }

  //* get near ending cards (well that's quite stupid i was planing on getting ending today but what if none end today? will i show empty row maybe maybe not i will hate myself for doing it later (T_T))
  getNearEndingWaitCardListOrderedBySooner = async () => {
    try {
      //* get all the popular items reference
      const q = query(
        collection(db, "items"),
        orderBy("waitToDate", "desc"),
        limit(10)
      )
      const querySnapshot = await getDocs(q);

      // get the full card object
      const cards = Promise.all(
        querySnapshot.docs.map(async (docData) => {
          // separate data 
          const cardsDate = docData.data()
          const ownerId = cardsDate.ownerId

          // Fetch the user document using the ownerId
          const userRef = doc(db, "users", ownerId);
          const userSnapshot = await getDoc(userRef);

          let userData = {};
          if (userSnapshot.exists()) {
            userData = userSnapshot.data(); // Get the user data if it exists
          }

          // Return the item data along with the user data
          return {
            id: doc.id,
            ...cardsDate,
            owner: userData, // Add the owner (user) details
          };
        }),
      )
      return cards
    } catch (error) {
      console.error("Error fetching popular wait cards:", error);
    }
  }

  getWaitCardDetailsByCardId = async (cardId) => {
    try {
      // Reference the card
      const cardRef = doc(db, "items", cardId);
  
      // Get the card doc
      const cardSnapshot = await getDoc(cardRef);
      
      if (cardSnapshot.exists()) {
        // In case item exists
        const cardData = cardSnapshot.data();
  
        // Get the users in the waiting list
        const usersData = await Promise.all(
          cardData.waitingUsers.map(async (userId) => {
            // Reference each user and get their details
            const userRef = doc(db, "users", userId);
            const userData = await getDoc(userRef);
            
            if (userData.exists()) {
              return userData.data(); // return user data
            }
            return null; // In case user data does not exist
          })
        );
  
        // Filter out null values (in case some users don't have data)
        const waitingUsersList = usersData.filter(user => user !== null);

        const userRef = doc(db, "users", cardData.ownerId);
        const ownerData = await getDoc(userRef);
        const ownerDetails = ownerData.data()

        console.log({
          ...cardData,
          waitingUsersDetails: waitingUsersList,
          ownerDetails:ownerDetails
        });
  
        return {
          ...cardData,
          ownerDetails:ownerDetails,
          waitingUsersDetails: waitingUsersList
        };
      } else {
        // In case the item is not found
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching card details:", error);
      return null;
    }
  };
  
}
