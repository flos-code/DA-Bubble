export class Reaction {
    reactionId: string;
    reactionName: string;
    reactedBy: string;

    constructor(obj?: any) { // Zuweiseung der Werte des hineingegebenen Objektes zu den Feldern der Klasse.
        this.reactionId = obj ? obj.reactionId : "";
        this.reactionName = obj ? obj.reactionName : ""; // if else Abfrage schneller geschrieben. Wenn das Objekt existiert, dann obj.firstname und sonst ein leerer String.
        this.reactedBy = obj ? obj.reactedBy : "";
    }

    public toJSON() {
        return {
            'reactionId': this.reactionId,
            'reactionName': this.reactionName,
            'reactedBy': this.reactedBy,
        };
    }
}