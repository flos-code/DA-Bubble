import { Injectable } from '@angular/core';

/* ========== FIREBASE ============ */
import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { ChatService } from './chat.service';
import { Reaction } from '../../models/reaction.class';

const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
/* =============================== */

@Injectable({
  providedIn: 'root'
})
export class ReactionsService {
  reactions = [];
  reactionCollectionPath: string;

  constructor(private chatService: ChatService) { }

/*   getReactions(reactionCollectionPath: string) {
    this.reactionCollectionPath = reactionCollectionPath;
    const q = query(collection(db, reactionCollectionPath));
    return onSnapshot(q, (list) => {
      this.reactions = [];
      list.forEach(element => {
        this.reactions.push(element.data());
      });
    console.log('Reaction data', this.reactions);
    });
  } */

/*   async saveReaction(emoji: string, currentUser: string) {
    if(this.reactions.some(reaction => reaction.emoji === emoji)) {  
      let currentRef = doc(db, this.reactionCollectionPath);
      // `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`
      let data = new Reaction({

      }); //{reactedBy: currentUser, emoji: emoji};
      await updateDoc(currentRef, data.toJSON()).then(() => {
      });
    } else {
      await this.addReaction(emoji, currentUser);
      console.log(currentUser);
    }
  }
   */
/*   async addReaction(emoji: string, currentUser: string) {
    await addDoc(collection(db, `channels/allgemein/threads/bx9TJQdWXkJCZry2AQpm/reactions`), {
      reaction: emoji,
      reactedBy: 'OS9ntlBZdogfRKDdbni6eZ9yop93',
    });  
    console.log('Reactions to thread', this.reactions);
  } */
}
