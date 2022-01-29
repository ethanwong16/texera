export interface Project
  extends Readonly<{
    pid: number;
    name: string;
    ownerID: number;
    creationTime: number;
  }> {}