import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
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
import { ViewManagementService } from '../../../services/view-management.service';
import { ChatService } from '../../../services/chat.service';
import { DirectMessage } from '../../../../models/directMessage.class';

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
  storage = inject(Storage);
  private firestore: Firestore = inject(Firestore);
  private dbSubscription!: Subscription;
  public imageURL: string | undefined;
  public filePath: string | undefined;

  constructor(
    public userManagementService: UserManagementService,
    private viewManagementService: ViewManagementService,
    private cdRef: ChangeDetectorRef,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');
    this.dbSubscription = collectionData(usersCollection, {
      idField: 'id',
    }).subscribe(
      (changes) => {
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

  ngAfterViewInit() {
    this.messageInput.nativeElement.focus();
    this.cdRef.detectChanges();
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
    this.insertTextAtCursor(emoji);
  }

  insertTextAtCursor(text: string, postInsertionAction?: () => void): void {
    const inputEl = this.messageInput.nativeElement;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const before = inputEl.value.substring(0, start);
    const after = inputEl.value.substring(end, inputEl.value.length);
    this.messageModel = before + text + after;
    const newPos = start + text.length;
    setTimeout(() => {
      inputEl.selectionStart = newPos;
      inputEl.selectionEnd = newPos;
      postInsertionAction?.();
    });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  closeEmojiPickerOrMentionUser() {
    this.showEmojiPicker = false;
    this.showMentionUser = false;
  }

  toggleMentionUser() {
    this.showMentionUser = !this.showMentionUser;
  }

  adjustTextareaHeight(event: any) {
    const textarea: HTMLTextAreaElement = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

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

  async sendMessage(): Promise<void> {
    if (!this.messageType || !this.targetId || !this.isMessageNotEmpty()) {
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
