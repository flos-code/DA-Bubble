import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-channel-edition-dialog',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './channel-edition-dialog.component.html',
  styleUrl: './channel-edition-dialog.component.scss'
})
export class ChannelEditionDialogComponent {
  @Output() channelEditionDialogOpenChild = new EventEmitter();
  channelEditionDialogOpen: boolean;
  showchannelEditionName: boolean = true;
  showchannelEditionDescription: boolean = true;

  closeDialog() {
    this.channelEditionDialogOpen = false;
    this.channelEditionDialogOpenChild.emit(this.channelEditionDialogOpen)
  }

  editChannelName() {
    this.showchannelEditionName = false;
  }

  saveChannelName() {
    // Speichern in Datenbank 
    this.showchannelEditionName = true;
  }

  editChannelDescription() {
    this.showchannelEditionDescription = false;
  }

  saveChannelDescription() {
    // Speichern in Datenbank 
    this.showchannelEditionDescription = true;
  }

  doNotClose($event: any) {
    $event.stopPropagation(); 
  }

}
