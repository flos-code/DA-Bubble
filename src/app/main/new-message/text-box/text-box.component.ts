import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

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
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent {
  @ViewChild('message') messageInput: ElementRef<HTMLInputElement>;
  inputFocused: boolean = false;
  messageModel: string = '';
  showEmojiPicker: boolean = false;

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

  closeEmojiPicker() {
    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
  }

  adjustTextareaHeight(event: any) {
    const textarea: HTMLTextAreaElement = event.target;
    textarea.style.height = 'auto'; // Temporarily shrink to auto to get the correct scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match content
  }
}
