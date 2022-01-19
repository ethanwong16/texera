import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppSettings } from '../../../common/app-setting';
import { DashboardWorkflowEntry } from '../../type/dashboard-workflow-entry';
import { DashboardUserFileEntry } from '../../type/dashboard-user-file-entry';
import { Project } from '../../type/project';

// temporary until user session is set up for backend
// export const USER_ID = '2';

export const PROJECT_BASE_URL = `${AppSettings.getApiEndpoint()}/project`;
export const USER_PROJECT_LIST_URL = `${PROJECT_BASE_URL}/list`;
export const WORKFLOW_OF_PROJECT_URL = `${PROJECT_BASE_URL}/workflows`;
export const FILE_OF_PROJECT_URL = `${PROJECT_BASE_URL}/files`;
export const RENAME_PROJECT_URL = `${PROJECT_BASE_URL}/update`;
export const DELETE_PROJECT_URL = `${PROJECT_BASE_URL}/delete`;
export const CREATE_PROJECT_URL = `${PROJECT_BASE_URL}/create`;
export const ADD_WORKFLOW_TO_PROJECT_URL = `${PROJECT_BASE_URL}/addWorkflow`;
export const DELETE_WORKFLOW_FROM_PROJECT_URL = `${PROJECT_BASE_URL}/deleteWorkflow`;
export const ADD_FILE_TO_PROJECT_URL = `${PROJECT_BASE_URL}/addFile`;
export const DELETE_FILE_FROM_PROJECT_URL = `${PROJECT_BASE_URL}/deleteFile`;

@Injectable({
  providedIn: 'root'
})
export class UserProjectService {
  // private dashboardUserProjectEntries: ReadonlyArray<Project> = [];
  // private dashboardUserProjectEntryChanged = new Subject<null>();

  constructor(private http: HttpClient) { 
  }

  // public getProjectList() : ReadonlyArray<Project>{
  //   // console.log("here before");
  //   // this.testing();
  //   // console.log("here after");
  //   this.testing();
  //   console.log("service/getProjectList : ")
  //   console.log(this.dashboardUserProjectEntries);
  //   return this.dashboardUserProjectEntries;
  // }

  // private testing(){
  //   this.retrieveProjectList().subscribe(projects => {
  //     this.dashboardUserProjectEntries = projects;
  //     this.dashboardUserProjectEntryChanged.next(); // is this even necessary?
  //     console.log("service/testing: ");
  //     console.log(projects);
  //   })
  // }

  public retrieveProjectList() : Observable<Project[]>{
    return this.http.get<Project[]>(`${USER_PROJECT_LIST_URL}`);
  }

  public retrieveWorkflowsOfProject(pid: number) : Observable<DashboardWorkflowEntry[]>{
    // console.log("project-service/retrieveWorkflowsOfProject");
    // return this.http.get<DashboardWorkflowEntry[]>(`${WORKFLOW_OF_PROJECT_URL}/` + pid + '/' + USER_ID);
    return this.http.get<DashboardWorkflowEntry[]>(`${WORKFLOW_OF_PROJECT_URL}/` + pid);
  }

  public retrieveFilesOfProject(pid: number) : Observable<DashboardUserFileEntry[]>{
    // console.log("project-service/retrieveFilesOfProject");
    // return this.http.get<DashboardUserFileEntry[]>(`${FILE_OF_PROJECT_URL}/` + pid + '/' + USER_ID);
    return this.http.get<DashboardUserFileEntry[]>(`${FILE_OF_PROJECT_URL}/` + pid );
  }

  public retrieveProject(pid: number) : Observable<Project>{
    // console.log("project-service/retrieveFilesOfProject");
    return this.http.get<Project>(`${PROJECT_BASE_URL}/` + pid);
  }

  public updateProjectName(pid: number, name: string) : Observable<Response>{
    console.log("updating name");
    return this.http.post<Response>(`${RENAME_PROJECT_URL}/` + pid + '/' + name, {});
  }

  public deleteProject(pid: number): Observable<Response> {
    console.log("deleting project with PID: " + pid);
    return this.http.delete<Response>(`${DELETE_PROJECT_URL}/` + pid);
  }

  public createProject(name: string) : Observable<Project>{
    console.log("creating new project with name: " + name);
    // return this.http.post<Response>(`${CREATE_PROJECT_URL}/` + USER_ID + '/' + name, {});
    return this.http.post<Project>(`${CREATE_PROJECT_URL}/` + name, {});
  }

  public addWorkflowToProject(pid: number, wid: number): Observable<Response>{
    console.log("adding workflow to project");
    return this.http.post<Response>(`${ADD_WORKFLOW_TO_PROJECT_URL}/` + pid + '/' + wid, {})
  }

  public removeWorkflowFromProject(pid: number, wid: number): Observable<Response>{
    console.log("removing workflow from project");
    return this.http.delete<Response>(`${DELETE_WORKFLOW_FROM_PROJECT_URL}/` + pid + '/' + wid, {});
  }

  public addFileToProject(pid: number, fid: number): Observable<Response>{
    console.log("adding file to project");
    return this.http.post<Response>(`${ADD_FILE_TO_PROJECT_URL}/` + pid + '/' + fid, {});
  }

  public removeFileFromProject(pid: number, fid: number): Observable<Response>{
    console.log("removing file from project");
    return this.http.delete<Response>(`${DELETE_FILE_FROM_PROJECT_URL}/` + pid + '/' + fid, {});
  }
}
