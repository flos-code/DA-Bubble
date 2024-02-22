export class Channel {
  type: string;
  name: string;
  description: string;
  creationDate: number;
  createdBy: string;
  isActive: boolean;
  messages: [];
  members: [];

  constructor(obj?: any) {
    // Zuweiseung der Werte des hineingegebenen Objektes zu den Feldern der Klasse.
    this.type = obj ? obj.type : '';
    this.name = obj ? obj.name : ''; // if else Abfrage schneller geschrieben. Wenn das Objekt existiert, dann obj.firstname und sonst ein leerer String.
    this.description = obj ? obj.description : '';
    this.creationDate = obj ? obj.creationDate : '';
    this.createdBy = obj ? obj.createdBy : '';
    this.isActive = obj ? obj.isActive : '';
    this.messages = obj ? obj.messages : '';
    this.members = obj ? obj.members : '';
  }

  public toJSON() {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      creationDate: this.creationDate,
      createdBy: this.createdBy,
      isActive: this.isActive,
      messages: this.messages,
      members: this.members,
    };
  }
}
