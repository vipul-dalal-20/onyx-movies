import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from "firebase/firestore";

/**
 * Service for managing user watchlist in Firestore.
 */

export const addToWatchlist = async (userId, movie) => {
  const userDocRef = doc(db, "watchlists", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      await updateDoc(userDocRef, {
        movies: arrayUnion(movie)
      });
    } else {
      await setDoc(userDocRef, {
        movies: [movie]
      });
    }
    return true;
  } catch (error) {
    console.error("Error adding to watchlist: ", error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId, movie) => {
  const userDocRef = doc(db, "watchlists", userId);
  try {
    await updateDoc(userDocRef, {
      movies: arrayRemove(movie)
    });
    return true;
  } catch (error) {
    console.error("Error removing from watchlist: ", error);
    throw error;
  }
};

export const getWatchlist = (userId, callback) => {
  const userDocRef = doc(db, "watchlists", userId);
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().movies);
    } else {
      callback([]);
    }
  });
};
