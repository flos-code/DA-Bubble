export class Message {
    messageId: string;
    createdBy: string;
    message: string;
    threads: [];
    reactions: [];

    constructor(obj?: any) { // Zuweiseung der Werte des hineingegebenen Objektes zu den Feldern der Klasse.
        this.messageId = obj ? obj.messageId : "";
        this.createdBy = obj ? obj.createdBy : ""; // if else Abfrage schneller geschrieben. Wenn das Objekt existiert, dann obj.firstname und sonst ein leerer String.
        this.message = obj ? obj.message : "";
        this.threads = obj ? obj.threads : "";
        this.reactions = obj ? obj.reactions : "";
    }

    public toJSON() {
        return {
            'messageId': this.messageId,
            'createdBy': this.createdBy,
            'message': this.message,
            'threads': this.threads,
            'reactions': this.reactions
        };
    }
}