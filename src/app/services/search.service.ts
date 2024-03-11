import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { debugErrorMap, getAuth } from 'firebase/auth';
import { DocumentData, DocumentSnapshot, QuerySnapshot, collection, getFirestore, where, query, onSnapshot } from 'firebase/firestore';
import { list } from 'firebase/storage';
import { Observable } from 'rxjs';
import { elementAt, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SearchService {

  firebaseConfig = {
    apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
    authDomain: "da-bubble-87fea.firebaseapp.com",
    projectId: "da-bubble-87fea",
    storageBucket: "da-bubble-87fea.appspot.com",
    messagingSenderId: "970901942782",
    appId: "1:970901942782:web:56b67253649b6206f290af"
  };
  app = initializeApp(this.firebaseConfig);
  db = getFirestore(this.app);
  userRef = collection(this.db, 'users');
  channelRef = collection(this.db, 'channels');
  auth = getAuth(this.app);

  searchUserResult = [];
  searchChannelsResult = [];

  constructor() { }

  searchUsers(input: any) {
    this.searchUserResult = [];
    const q = query(this.userRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        if (compare.includes(input.toLowerCase())) {
          this.searchUserResult.push(result);
        }
      })
    })
  }

  searchChannels(input: any) {
    this.searchChannelsResult = [];
    const q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        let members = element.data()['members'];
        if (members.includes(this.auth.currentUser.uid)) {
          if (compare.includes(input.toLowerCase())) {
            this.searchChannelsResult.push(result);
          }
        }
      })
    })
  }

  checkIfUserisInChannel() {

  }

  // searchUsers(input: any): Observable<any[]> {
  //   const q = query(this.userRef, where('name', '<=', input), where('name', '<=', input + '\uf8ff'));
  //   return new Observable<any[]>(observer => {
  //     const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
  //       console.log('HIER::::', q);

  //       const data: any[] = [];
  //       snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
  //         const id = doc.id;
  //         const docData = doc.data();
  //         data.push({ id, ...docData });
  //       });
  //       observer.next(data);
  //     });

  //     // Rückgabewert ist die Unsubscribe-Funktion
  //     return () => unsubscribe();
  //   });
  // }

  // private getSnapshotChanges(q: any): Observable<any[]> {
  //   return new Observable(observer => {
  //     const unsubscribe = q.onSnapshot((snapshot: QuerySnapshot<DocumentData>) => {
  //       const data: any[] = [];
  //       snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
  //         const id = doc.id;
  //         const docData = doc.data();
  //         data.push({ id, ...docData });
  //       });
  //       observer.next(data);
  //     }, err => {
  //       observer.error(err);
  //     });
  //     return () => unsubscribe();
  //   });
  // }

  // searchChannels(query: string): Observable<any[]> {
  //   return this.firestore.collection('channels', ref =>
  //     ref.where('name', '>=', query).where('name', '<=', query + '\uf8ff')
  //   ).snapshotChanges().pipe(
  //     map(actions => {
  //       return actions.map(a => {
  //         const data = a.payload.doc.data();
  //         const id = a.payload.doc.id;
  //         return { id, ...data };
  //       });
  //     })
  //   );
  // }

  // searchChats(query: string): Observable<any[]> {
  //   return this.firestore.collection('chats', ref =>
  //     ref.where('message', '>=', query).where('message', '<=', query + '\uf8ff')
  //   ).snapshotChanges().pipe(
  //     map(actions => {
  //       return actions.map(a => {
  //         const data = a.payload.doc.data();
  //         const id = a.payload.doc.id;
  //         return { id, ...data };
  //       });
  //     })
  //   );
  // }
}
