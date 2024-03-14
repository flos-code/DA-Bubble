import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { debugErrorMap, getAuth } from 'firebase/auth';
import { DocumentData, DocumentSnapshot, QuerySnapshot, collection, getFirestore, where, query, onSnapshot, doc } from 'firebase/firestore';
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
  threadsRef = collection(this.db, 'channels');
  auth = getAuth(this.app);

  searchUserResult = [];
  searchChannelsResult = [];
  searchChannelsThreadsResult = [];
  threads = [];

  constructor() { }

  searchUsers(input: any) {
    this.searchUserResult = [];
    let q = query(this.userRef);
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
    let q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        let docId = element.id;
        let members = element.data()['members'];
        if (members.includes(this.auth.currentUser.uid)) {
          if (compare.includes(input.toLowerCase())) {
            this.searchChannelsResult.push({ id: docId, ...result });
          }
        }
      })
    })
  }

  searchThreads(input: string) {
    this.threads = [];
    let q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach((element) => {
        let members = element.data()['members'];
        let docId = element.id;
        let channelName = element.data()['name'];
        if (members.includes(this.auth.currentUser.uid)) {
          this.findThreads(input, docId, channelName)
        }
      });
    });
  }

  findThreads(input: string, docId: string, channelName: string) {
    let channelDocRef = doc(this.channelRef, docId);
    let threadsRef = collection(channelDocRef, 'threads');
    onSnapshot(threadsRef, (threadSnapshot) => {
      threadSnapshot.forEach((threadDoc) => {
        let compare = threadDoc.data()['message'].toLowerCase();
        if (compare.includes(input.toLowerCase())) {
          this.threads.push({ id: docId, channelName: channelName, ...threadDoc.data() });
        }
      });
    });
  }
}
