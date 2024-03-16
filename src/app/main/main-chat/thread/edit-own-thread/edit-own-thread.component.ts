import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Firestore, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-own-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PickerComponent, EmojiComponent ],
  templateUrl: './edit-own-thread.component.html',
  styleUrl: './edit-own-thread.component.scss'
})
export class EditOwnThreadComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  @Input() textAreaEditMessage!: string;
  @Input() threadId!: string;
  @Input() activeChannelId!: string;
  @Input() threadMessage!: any;
  @Input() userImg!: string;
  ownMessageEdit: boolean;
  @Output() ownMessageEditChild = new EventEmitter(); 
  inputFocused: boolean = false;
  showEmojiPicker: boolean = false;
  showMentionUser: boolean = false;

  constructor() { }

  ngOnInit(): void {
      this.textAreaEditMessage = this.threadMessage;
  }

  closeEditedMessage() {
    this.ownMessageEdit = false;
    this.ownMessageEditChild.emit(this.ownMessageEdit);
  }

  async saveEditedMessage() {
    if(this.textAreaEditMessage) {
      let currentThreadRef = doc(this.firestore, `channels/${this.activeChannelId}/threads/${this.threadId}`);
      let data = {message: this.textAreaEditMessage };

      await updateDoc(currentThreadRef, data).then(() => {
      });
      this.ownMessageEdit = false;
      this.ownMessageEditChild.emit(this.ownMessageEdit);
    } else {
      await deleteDoc(doc(this.firestore, `channels/${this.activeChannelId}/threads/`, this.threadId));
      this.ownMessageEdit = false;
      this.ownMessageEditChild.emit(this.ownMessageEdit);
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
      this.textAreaEditMessage = before + emoji + after;
  
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

    doNotClose($event: any) {
      $event.stopPropagation();
    }
}
