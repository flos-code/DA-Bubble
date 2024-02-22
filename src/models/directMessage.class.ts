export class DirectMessage {
    messageId: string;
    from: string;
    to: string;
    creationDate: number;
    message: string;
    type: string;
    reactions: [];

    constructor(obj?: any) { // Zuweiseung der Werte des hineingegebenen Objektes zu den Feldern der Klasse.
        this.messageId = obj ? obj.messageId : "";
        this.from = obj ? obj.from : ""; // if else Abfrage schneller geschrieben. Wenn das Objekt existiert, dann obj.firstname und sonst ein leerer String.
        this.to = obj ? obj.to : "";
        this.creationDate = obj ? obj.creationDate : "";
        this.message = obj ? obj.message : "";
        this.type = obj ? obj.type : "";
        this.reactions = obj ? obj.reactions : "";
    }

    public toJSON() {
        return {
            'messageId': this.messageId,
            'from': this.from,
            'to': this.to,
            'creationDate': this.creationDate,
            'message': this.message,
            'type': this.type,
            'reactions': this.reactions
        };
    }
}