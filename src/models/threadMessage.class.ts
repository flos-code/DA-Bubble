export class ThreadMessage {
    createdBy: string;
    creationDate: number;
    message: string;
    constructor(obj?: any) { // Zuweiseung der Werte des hineingegebenen Objektes zu den Feldern der Klasse.
        this.createdBy = obj ? obj.createdBy : ""; // if else Abfrage schneller geschrieben. Wenn das Objekt existiert, dann obj.firstname und sonst ein leerer String.
        this.creationDate = obj ? obj.creationDate : "";
        this.message = obj ? obj.message : "";
    }

    public toJSON() {
        return {
            'createdBy': this.createdBy,
            'creationDate': this.creationDate,
            'message': this.message,
        };
    }
}