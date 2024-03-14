import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { User } from '../../../../models/user.class';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UserManagementService } from '../../../services/user-management.service';
import { Thread } from '../../../../models/thread.class';
import { ViewManagementService } from '../../../services/view-management.service';
import { ChatService } from '../../../services/chat.service';
import { DirectMessage } from '../../../../models/directMessage.class';
import { ThreadMessage } from '../../../../models/threadMessage.class';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    PickerComponent,
    EmojiComponent,
    CommonModule,
  ],
  templateUrl: './text-box.component.html',
  styleUrls: [
    './text-box.component.scss',
    './text-box.component-mediaquery.scss',
  ],
})
export class TextBoxComponent {
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @Input() messageType: 'direct' | 'channel' | 'thread' | 'threadMessage';
  @Input() targetId: string; // ID des Nutzers/Kanals/Threads
  @Input() placeholderText: string;

  inputFocused: boolean = false;
  messageModel: string = '';
  showEmojiPicker: boolean = false;
  showMentionUser: boolean = false;
  user = new User();
  allUsers: any = [];

  private firestore: Firestore = inject(Firestore);
  private dbSubscription!: Subscription;

  constructor(
    public userManagementService: UserManagementService,
    private viewManagementService: ViewManagementService,
    private chatService: ChatService
  ) {}

  public imageURL: string | undefined;
  public filePath: string | undefined;

  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');
    this.dbSubscription = collectionData(usersCollection, {
      idField: 'id',
    }).subscribe(
      (changes) => {
        console.log('Received Changes from DB', changes);
        this.allUsers = changes;
        this.sortUsers(this.allUsers);
      },
      (error) => {
        console.error('Error fetching changes:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.dbSubscription.unsubscribe();
  }

  focusInput() {
    if (!this.showEmojiPicker) {
      this.messageInput.nativeElement.focus();
    }
  }

  onInputFocus(): void {
    this.inputFocused = true;
  }

  onInputBlur(): void {
    this.inputFocused = false;
  }

  handleClick(event: any) {
    const emoji = event.emoji.native;
    this.insertEmojiAtCursor(emoji);
  }

  insertEmojiAtCursor(emoji: string) {
    const inputEl = this.messageInput.nativeElement;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const text = inputEl.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    this.messageModel = before + emoji + after;

    const newPos = start + emoji.length;
    setTimeout(() => {
      inputEl.selectionStart = inputEl.selectionEnd = newPos;
    });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  closeEmojiPickerOrMentionUser() {
    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
    if (this.showMentionUser) {
      this.showMentionUser = false;
    }
  }

  toggleMentionUser() {
    this.showMentionUser = !this.showMentionUser;
  }

  adjustTextareaHeight(event: any) {
    const textarea: HTMLTextAreaElement = event.target;
    textarea.style.height = 'auto'; // Temporarily shrink to auto to get the correct scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match content
  }

  storage = inject(Storage);

  async onFileSelected(event) {
    const file: File = event.target.files[0];
    if (!file) return;
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
    ];
    if (!validTypes.includes(file.type)) {
      alert('Nur PNG, JPG, GIF und SVG Dateien sind zulässig.');
      return;
    }
    const maxSizeInBytes = 1.5 * 1024 * 1024; // 1,5 MB in Bytes
    if (file.size > maxSizeInBytes) {
      alert('Die Datei ist zu groß. Maximale Dateigröße ist 1,5 MB.');
      return;
    }
    await this.uploadImage(file);
  }

  generateUniqueId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async uploadImage(file: File) {
    try {
      const uniqueId = this.generateUniqueId();
      const uniqueFileName = `${uniqueId}-${file.name}`;
      const filePath = `userUploads/${uniqueFileName}`;
      this.filePath = filePath;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      this.imageURL = downloadUrl;
    } catch (error) {
      console.error('Error uploading file: ', error);
    }
  }

  async removeFileUpload() {
    if (!this.filePath) return;

    try {
      const storageRef = ref(this.storage, this.filePath);
      await deleteObject(storageRef);
      this.imageURL = undefined;
      this.filePath = undefined;
      this.resetFileInput();
    } catch (error) {
      console.error('Error deleting file: ', error);
    }
  }

  private resetFileInput() {
    if (this.fileUpload && this.fileUpload.nativeElement) {
      this.fileUpload.nativeElement.value = '';
    }
  }

  sortUsers(users): void {
    users.sort((a, b) => {
      if (a.id === this.userManagementService.activeUserId.value) return -1;
      if (b.id === this.userManagementService.activeUserId.value) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  insertMentionUserAtCursor(user: string) {
    const inputEl = this.messageInput.nativeElement;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const text = inputEl.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    this.messageModel = before + user + after;

    const newPos = start + user.length;
    setTimeout(() => {
      inputEl.selectionStart = inputEl.selectionEnd = newPos;
    });
  }

  // async sendMessage(): Promise<void> {
  //   if (!this.messageType || !this.targetId || !this.messageModel.trim()) {
  //     console.error('Nachrichtendetails sind unvollständig');
  //     return;
  //   }

  //   const imageUrlToSend = this.imageURL ? this.imageURL : null;

  //   if (this.messageType === 'channel') {
  //     const newThread = new Thread({
  //       createdBy: this.userManagementService.activeUserId.value,
  //       creationDate: Date.now(),
  //       message: this.messageModel.trim(),
  //       imageUrl: imageUrlToSend,
  //     });
  //     try {
  //       const docRef = await addDoc(
  //         collection(this.firestore, `channels/${this.targetId}/threads`),
  //         newThread.toJSON()
  //       );
  //       console.log('Nachricht wurde erfolgreich gesendet mit ID: ', docRef.id);
  //       this.chatService.setActiveChannelId(this.targetId);
  //       this.viewManagementService.setView('channel');

  //       await updateDoc(
  //         doc(this.firestore, `channels/${this.targetId}/threads`, docRef.id),
  //         {
  //           messageId: docRef.id,
  //         }
  //       );
  //     } catch (error) {
  //       console.error('Fehler beim Senden der Nachricht: ', error);
  //     }
  //   } else if (this.messageType === 'direct') {
  //     if (this.userManagementService.activeUserId.value !== this.targetId) {
  //       const newDmSender = new DirectMessage({
  //         yourMessage: true,
  //         createdBy: this.userManagementService.activeUserId.value,
  //         creationDate: Date.now(),
  //         message: this.messageModel.trim(),
  //         imageUrl: imageUrlToSend,
  //       });
  //       const newDmReceiver = new DirectMessage({
  //         yourMessage: false,
  //         createdBy: this.userManagementService.activeUserId.value,
  //         creationDate: Date.now(),
  //         message: this.messageModel.trim(),
  //         imageUrl: imageUrlToSend,
  //       });
  //       const dmSenderRef = doc(
  //         this.firestore,
  //         `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
  //         this.targetId
  //       );
  //       const dmReceiverRef = doc(
  //         this.firestore,
  //         `users/${this.targetId}/allDirectMessages`,
  //         this.userManagementService.activeUserId.value
  //       );

  //       try {
  //         await setDoc(dmSenderRef, {}, { merge: true });
  //         await setDoc(dmReceiverRef, {}, { merge: true });

  //         const directMessagesSenderCollection = collection(
  //           this.firestore,
  //           `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`
  //         );
  //         const directMessagesReceiverCollection = collection(
  //           this.firestore,
  //           `users/${this.targetId}/allDirectMessages/${this.userManagementService.activeUserId.value}/directMessages`
  //         );

  //         const docRefSender = await addDoc(
  //           directMessagesSenderCollection,
  //           newDmSender.toJSON()
  //         );
  //         const docRefReceiver = await addDoc(
  //           directMessagesReceiverCollection,
  //           newDmReceiver.toJSON()
  //         );

  //         console.log(
  //           'Nachricht wurde erfolgreich gesendet mit Sender-ID:',
  //           docRefSender.id,
  //           'und Receiver-ID:',
  //           docRefReceiver.id
  //         );
  //         await updateDoc(
  //           doc(
  //             this.firestore,
  //             `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`,
  //             docRefSender.id
  //           ),
  //           {
  //             messageId: docRefSender.id,
  //           }
  //         );

  //         await updateDoc(
  //           doc(
  //             this.firestore,
  //             `users/${this.targetId}/allDirectMessages/${this.userManagementService.activeUserId.value}/directMessages`,
  //             docRefReceiver.id
  //           ),
  //           {
  //             messageId: docRefReceiver.id,
  //           }
  //         );
  //         this.userManagementService.loadUsers();
  //         this.chatService.setSelectedUserId(this.targetId);
  //         this.viewManagementService.setView('directMessage');
  //       } catch (error) {
  //         console.error('Fehler beim Senden der Nachricht: ', error);
  //       }
  //     } else {
  //       const newDmSender = new DirectMessage({
  //         yourMessage: true,
  //         createdBy: this.userManagementService.activeUserId.value,
  //         creationDate: Date.now(),
  //         message: this.messageModel.trim(),
  //         imageUrl: imageUrlToSend,
  //       });

  //       const dmSenderRef = doc(
  //         this.firestore,
  //         `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
  //         this.targetId
  //       );

  //       try {
  //         await setDoc(dmSenderRef, {}, { merge: true });

  //         const directMessagesSenderCollection = collection(
  //           this.firestore,
  //           `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`
  //         );

  //         const docRefSender = await addDoc(
  //           directMessagesSenderCollection,
  //           newDmSender.toJSON()
  //         );

  //         console.log(
  //           'Nachricht wurde erfolgreich gesendet mit Sender-ID:',
  //           docRefSender.id
  //         );
  //         await updateDoc(
  //           doc(
  //             this.firestore,
  //             `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`,
  //             docRefSender.id
  //           ),
  //           {
  //             messageId: docRefSender.id,
  //           }
  //         );

  //         this.userManagementService.loadUsers();
  //         this.chatService.setSelectedUserId(this.targetId);
  //             this.viewManagementService.setView('directMessage');
  //       } catch (error) {
  //         console.error('Fehler beim Senden der Nachricht: ', error);
  //       }
  //     }
  //   } else if (this.messageType === 'threadMessage') {
  //     const newThread = new ThreadMessage({
  //       createdBy: this.userManagementService.activeUserId.value,
  //       creationDate: Date.now(),
  //       message: this.messageModel.trim(),
  //       imageUrl: imageUrlToSend,
  //     });
  //     try {
  //       const docRefThread = await addDoc(
  //         collection(
  //           this.firestore,
  //           `channels/${this.chatService.getActiveChannelId()}/threads/${
  //             this.targetId
  //           }/messages`
  //         ),
  //         newThread.toJSON()
  //       );
  //       console.log(
  //         'Nachricht wurde erfolgreich gesendet mit ID: ',
  //         docRefThread.id
  //       );

  //       await updateDoc(
  //         doc(
  //           this.firestore,
  //           `channels/${this.chatService.getActiveChannelId()}/threads/${
  //             this.targetId
  //           }/messages`,
  //           docRefThread.id
  //         ),
  //         {
  //           messageId: docRefThread.id,
  //         }
  //       );
  //     } catch (error) {
  //       console.error('Fehler beim Senden der Nachricht: ', error);
  //     }
  //   }
  //   this.messageModel = '';
  //   this.imageURL = undefined;
  //   this.filePath = undefined;
  // }

  ///////////////////////////////////////////////////////////////

  async sendMessage(): Promise<void> {
    if (!this.messageType || !this.targetId || !this.messageModel.trim()) {
      console.error('Nachrichtendetails sind unvollständig');
      return;
    }

    try {
      switch (this.messageType) {
        case 'channel':
          await this.handleChannelMessage();
          break;
        case 'direct':
          await this.handleDirectMessage();
          break;
        case 'threadMessage':
          await this.handleThreadMessage();
          break;
        default:
          console.error('Unbekannter Nachrichtentyp');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht: ', error);
    }

    this.cleanupAfterSend();
  }

  private async handleChannelMessage() {
    const newThread = this.createThread();
    const docRef = await addDoc(
      collection(this.firestore, `channels/${this.targetId}/threads`),
      newThread
    );
    console.log('Nachricht wurde erfolgreich gesendet mit ID: ', docRef.id);
    this.chatService.setActiveChannelId(this.targetId);
    this.viewManagementService.setView('channel');
    await this.updateDocument(`channels/${this.targetId}/threads`, docRef.id, {
      messageId: docRef.id,
    });
  }

  private async handleDirectMessage() {
    const messageData = new DirectMessage({
      yourMessage: true,
      createdBy: this.userManagementService.activeUserId.value,
      creationDate: Date.now(),
      message: this.messageModel.trim(),
      imageUrl: this.imageURL ? this.imageURL : null,
    });

    if (this.userManagementService.activeUserId.value !== this.targetId) {
      await this.sendDirectMessageToOther(this.targetId, messageData);
    } else {
      await this.sendDirectMessageToSelf(this.targetId, messageData);
    }
  }

  private async sendDirectMessageToOther(
    targetId: string,
    messageData: DirectMessage
  ) {
    const dmSenderRef = doc(
      this.firestore,
      `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
      targetId
    );
    const dmReceiverRef = doc(
      this.firestore,
      `users/${targetId}/allDirectMessages`,
      this.userManagementService.activeUserId.value
    );

    try {
      await setDoc(dmSenderRef, {}, { merge: true });
      await setDoc(dmReceiverRef, {}, { merge: true });
      await this.saveDirectMessage(dmSenderRef, messageData, true);
      await this.saveDirectMessage(dmReceiverRef, messageData, false);
      this.afterMessageSent(targetId);
    } catch (error) {
      console.error(
        'Fehler beim Senden der Direktnachricht an anderen:',
        error
      );
    }
  }

  private async sendDirectMessageToSelf(
    targetId: string,
    messageData: DirectMessage
  ) {
    const dmSenderRef = doc(
      this.firestore,
      `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
      targetId
    );
    try {
      await setDoc(dmSenderRef, {}, { merge: true });
      await this.saveDirectMessage(dmSenderRef, messageData, true);
      this.afterMessageSent(targetId);
    } catch (error) {
      console.error('Fehler beim Senden der Selbstnachricht:', error);
    }
  }

  private async saveDirectMessage(
    ref: DocumentReference,
    messageData: DirectMessage,
    isSender: boolean
  ) {
    const collectionRef = collection(ref, 'directMessages');
    const docRef = await addDoc(
      collectionRef,
      isSender
        ? messageData.toJSON()
        : { ...messageData.toJSON(), yourMessage: false }
    );
    await updateDoc(doc(collectionRef, docRef.id), { messageId: docRef.id });
  }

  private afterMessageSent(targetId: string) {
    this.userManagementService.loadUsers();
    this.chatService.setSelectedUserId(targetId);
    this.viewManagementService.setView('directMessage');
  }

  // private async handleDirectMessage() {
  //   if (this.userManagementService.activeUserId.value !== this.targetId) {
  //     const newDmSender = new DirectMessage({
  //       yourMessage: true,
  //       createdBy: this.userManagementService.activeUserId.value,
  //       creationDate: Date.now(),
  //       message: this.messageModel.trim(),
  //       imageUrl: this.imageURL ? this.imageURL : null,
  //     });
  //     const newDmReceiver = new DirectMessage({
  //       yourMessage: false,
  //       createdBy: this.userManagementService.activeUserId.value,
  //       creationDate: Date.now(),
  //       message: this.messageModel.trim(),
  //       imageUrl: this.imageURL ? this.imageURL : null,
  //     });
  //     const dmSenderRef = doc(
  //       this.firestore,
  //       `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
  //       this.targetId
  //     );
  //     const dmReceiverRef = doc(
  //       this.firestore,
  //       `users/${this.targetId}/allDirectMessages`,
  //       this.userManagementService.activeUserId.value
  //     );

  //     try {
  //       await setDoc(dmSenderRef, {}, { merge: true });
  //       await setDoc(dmReceiverRef, {}, { merge: true });

  //       const directMessagesSenderCollection = collection(
  //         this.firestore,
  //         `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`
  //       );
  //       const directMessagesReceiverCollection = collection(
  //         this.firestore,
  //         `users/${this.targetId}/allDirectMessages/${this.userManagementService.activeUserId.value}/directMessages`
  //       );

  //       const docRefSender = await addDoc(
  //         directMessagesSenderCollection,
  //         newDmSender.toJSON()
  //       );
  //       const docRefReceiver = await addDoc(
  //         directMessagesReceiverCollection,
  //         newDmReceiver.toJSON()
  //       );

  //       console.log(
  //         'Nachricht wurde erfolgreich gesendet mit Sender-ID:',
  //         docRefSender.id,
  //         'und Receiver-ID:',
  //         docRefReceiver.id
  //       );
  //       await updateDoc(
  //         doc(
  //           this.firestore,
  //           `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`,
  //           docRefSender.id
  //         ),
  //         {
  //           messageId: docRefSender.id,
  //         }
  //       );

  //       await updateDoc(
  //         doc(
  //           this.firestore,
  //           `users/${this.targetId}/allDirectMessages/${this.userManagementService.activeUserId.value}/directMessages`,
  //           docRefReceiver.id
  //         ),
  //         {
  //           messageId: docRefReceiver.id,
  //         }
  //       );
  //       this.userManagementService.loadUsers();
  //       this.chatService.setSelectedUserId(this.targetId);
  //       this.viewManagementService.setView('directMessage');
  //     } catch (error) {
  //       console.error('Fehler beim Senden der Nachricht: ', error);
  //     }
  //   } else {
  //     const newDmSender = new DirectMessage({
  //       yourMessage: true,
  //       createdBy: this.userManagementService.activeUserId.value,
  //       creationDate: Date.now(),
  //       message: this.messageModel.trim(),
  //       imageUrl: this.imageURL ? this.imageURL : null,
  //     });

  //     const dmSenderRef = doc(
  //       this.firestore,
  //       `users/${this.userManagementService.activeUserId.value}/allDirectMessages`,
  //       this.targetId
  //     );

  //     try {
  //       await setDoc(dmSenderRef, {}, { merge: true });

  //       const directMessagesSenderCollection = collection(
  //         this.firestore,
  //         `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`
  //       );

  //       const docRefSender = await addDoc(
  //         directMessagesSenderCollection,
  //         newDmSender.toJSON()
  //       );

  //       console.log(
  //         'Nachricht wurde erfolgreich gesendet mit Sender-ID:',
  //         docRefSender.id
  //       );
  //       await updateDoc(
  //         doc(
  //           this.firestore,
  //           `users/${this.userManagementService.activeUserId.value}/allDirectMessages/${this.targetId}/directMessages`,
  //           docRefSender.id
  //         ),
  //         {
  //           messageId: docRefSender.id,
  //         }
  //       );

  //       this.userManagementService.loadUsers();
  //       this.chatService.setSelectedUserId(this.targetId);
  //       this.viewManagementService.setView('directMessage');
  //     } catch (error) {
  //       console.error('Fehler beim Senden der Nachricht: ', error);
  //     }
  //   }

  //   // const messageData = {
  //   //   yourMessage: true,
  //   //   createdBy: this.userManagementService.activeUserId.value,
  //   //   creationDate: Date.now(),
  //   //   message: this.messageModel.trim(),
  //   //   imageUrl: this.imageURL ? this.imageURL : null,
  //   // };

  //   // // Für Sender
  //   // await this.addDirectMessage(messageData, this.targetId);

  //   // // Unterscheidung, ob es sich um eine Selbstnachricht handelt
  //   // if (this.userManagementService.activeUserId.value !== this.targetId) {
  //   //   // Für Empfänger
  //   //   const messageDataForReceiver = { ...messageData, yourMessage: false };
  //   //   await this.addDirectMessage(messageDataForReceiver, this.userManagementService.activeUserId.value);
  //   // }

  //   // this.chatService.setSelectedUserId(this.targetId);
  //   // this.viewManagementService.setView('directMessage');
  // }

  // private async addDirectMessage(messageData: any, userId: string) {
  //   const directMessagesCollection = collection(
  //     this.firestore,
  //     `users/${userId}/allDirectMessages/${this.targetId}/directMessages`
  //   );

  //   await addDoc(directMessagesCollection, messageData);
  // }

  private async updateDocument(path: string, docId: string, data: object) {
    await updateDoc(doc(this.firestore, path, docId), data);
  }

  private cleanupAfterSend() {
    this.messageModel = '';
    this.imageURL = undefined;
    this.filePath = undefined;
  }

  private async handleThreadMessage() {
    const newMessage = this.createThreadMessage();
    const docRef = await addDoc(
      collection(
        this.firestore,
        `channels/${this.chatService.getActiveChannelId()}/threads/${
          this.targetId
        }/messages`
      ),
      newMessage
    );
    console.log(
      'Thread-Nachricht wurde erfolgreich gesendet mit ID: ',
      docRef.id
    );

    await this.updateDocument(
      `channels/${this.chatService.getActiveChannelId()}/threads/${
        this.targetId
      }/messages`,
      docRef.id,
      { messageId: docRef.id }
    );
  }

  private createThread(): any {
    return {
      createdBy: this.userManagementService.activeUserId.value,
      creationDate: Date.now(),
      message: this.messageModel.trim(),
      imageUrl: this.imageURL ? this.imageURL : null,
    };
  }

  private createThreadMessage(): any {
    return {
      createdBy: this.userManagementService.activeUserId.value,
      creationDate: Date.now(),
      message: this.messageModel.trim(),
      imageUrl: this.imageURL ? this.imageURL : null,
    };
  }

  ///////////////////////////////////////////////////////////

  onKeydown(event) {
    event.preventDefault();
  }

  isMessageNotEmpty(): boolean {
    return (
      this.messageModel.trim().length > 0 ||
      (this.imageURL && this.imageURL.trim().length > 0)
    );
  }
}
