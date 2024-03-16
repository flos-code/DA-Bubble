import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc, setDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { RouterModule } from '@angular/router';
import { DirectMessage } from '../../models/directMessage.class';

const firebaseConfig = {
  apiKey: "AIzaSyC520Za3P8qTUGvWM0KxuYqGIMaz-Vd48k",
  authDomain: "da-bubble-87fea.firebaseapp.com",
  projectId: "da-bubble-87fea",
  storageBucket: "da-bubble-87fea.appspot.com",
  messagingSenderId: "970901942782",
  appId: "1:970901942782:web:56b67253649b6206f290af"
};

const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', 'login.component.animations.scss']
})

export class LoginComponent implements OnInit {
  auth = getAuth(app);

  startTextAnimation: boolean = false;
  removeDNone: boolean = false;
  removeAnimatedContainer: boolean = false;
  startLogoAnimation: boolean = false;
  removeMainDiv: boolean = false;

  signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })
  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.startTheAnimation();
  }

  startTheAnimation() {
    setTimeout(() => {
      this.startLogoAnimation = true;
    }, 1375);
    setTimeout(() => {
      this.removeDNone = true;
    }, 1500);
    setTimeout(() => {
      this.startTextAnimation = true;
    }, 1500);
    setTimeout(() => {
      this.removeAnimatedContainer = true;
    }, 3100);
  }

  async signInWithGoogle() {
    await signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            isOnline: true,
          });
          this.router.navigateByUrl('');
        } else {
          this.createUserDetailsDoc(result);
          await this.addUserToGeneralChannel();
          await this.createWelcomeMessage();
          this.router.navigateByUrl('');
        };
      })
  }

  async createWelcomeMessage() {
    const welcomeMessage = new DirectMessage({
      yourMessage: false,
      createdBy: 'gZrReha096XBbzYewrjt1cP8AZB2a',
      creationDate: Date.now(),
      message:
        'Herzlich willkommen auf dem Code Learning Server 👋 ich hoffe, du hast hergefunden',
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/da-bubble-87fea.appspot.com/o/userImages%2FwelcomeGif.gif?alt=media&token=91f0cf99-d5d8-47ad-be89-15ca36856c35',
    });
    const newUserRef = doc(
      db,
      `users/${this.auth.currentUser.uid}/allDirectMessages`,
      'gZrReha096XBbzYewrjt1cP8AZB2'
    );

    try {
      await setDoc(newUserRef, {}, { merge: true });

      const directMessagesCollection = collection(
        db,
        `users/${this.auth.currentUser.uid}/allDirectMessages/gZrReha096XBbzYewrjt1cP8AZB2/directMessages`
      );

      const docRefNewUser = await addDoc(
        directMessagesCollection,
        welcomeMessage.toJSON()
      );

      await updateDoc(
        doc(
          db,
          `users/${this.auth.currentUser.uid}/allDirectMessages/gZrReha096XBbzYewrjt1cP8AZB2/directMessages`,
          docRefNewUser.id
        ),
        {
          messageId: docRefNewUser.id,
        }
      );
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht: ', error);
    }
  }

  async createUserDetailsDoc(result) {
    await setDoc(doc(db, 'users', result.user.uid), {
      name: result.user.displayName,
      email: result.user.email,
      imgUrl: result.user.photoURL,
      isOnline: false,
      id: result.user.uid,
    });
  }

  async addUserToGeneralChannel() {
    const channelRef = doc(db, 'channels', 'allgemein');
    await updateDoc(channelRef, {
      members: arrayUnion(this.auth.currentUser.uid),
    });
  }

  async signIn() {
    await signInWithEmailAndPassword(this.auth, this.signInForm.value.email, this.signInForm.value.password);
    let userRef = doc(db, "users", this.auth.currentUser.uid)
    await updateDoc(userRef, {
      isOnline: true,
    });
    this.router.navigateByUrl('');
  }

  async signInAsGuest() {
    await signInWithEmailAndPassword(this.auth, 'guest@dabubble77.com', '123456');
    this.router.navigateByUrl('');
  }

  goToPasswordReset() {
    this.router.navigateByUrl('/reset_password')
  }

}
