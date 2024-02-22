export class Channel {
  name: string;
  description: string;
  createdBy: string;
  creationDate: number;
  isActive: boolean;

  constructor(obj?: any) {
    this.name = obj ? obj.name : '';
    this.description = obj ? obj.description : '';
    this.createdBy = obj ? obj.createdBy : '';
    this.creationDate = obj ? obj.creationDate : '';
    this.isActive = obj ? obj.isActive : '';
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      createdBy: this.createdBy,
      creationDate: this.creationDate,
      isActive: this.isActive,
    };
  }
}
