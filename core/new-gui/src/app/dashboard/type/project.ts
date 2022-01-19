export interface Project
  extends Readonly<{
    pid: number;
    name: string;
    ownerId: number;
    creationTime: number;
  }> {}