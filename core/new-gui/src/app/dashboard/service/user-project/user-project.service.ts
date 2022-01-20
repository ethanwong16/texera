import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { AppSettings } from "../../../common/app-setting";
import { DashboardWorkflowEntry } from "../../type/dashboard-workflow-entry";
import { DashboardUserFileEntry } from "../../type/dashboard-user-file-entry";
import { Project } from "../../type/project";
import { UserFileService } from "../user-file/user-file.service";

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

export const USER_FILE_BASE_URL = `${AppSettings.getApiEndpoint()}/user/file`;
export const USER_FILE_DELETE_URL = `${USER_FILE_BASE_URL}/delete`;

@Injectable({
  providedIn: "root"
})
export class UserProjectService {
  private files: ReadonlyArray<DashboardUserFileEntry> = [];

  constructor(private http: HttpClient, private userFileService: UserFileService) { 
  }

  public retrieveProjectList() : Observable<Project[]>{
    return this.http.get<Project[]>(`${USER_PROJECT_LIST_URL}`);
  }

  public retrieveWorkflowsOfProject(pid: number) : Observable<DashboardWorkflowEntry[]>{
    return this.http.get<DashboardWorkflowEntry[]>(`${WORKFLOW_OF_PROJECT_URL}/` + pid);
  }

  public retrieveFilesOfProject(pid: number) : Observable<DashboardUserFileEntry[]>{
    return this.http.get<DashboardUserFileEntry[]>(`${FILE_OF_PROJECT_URL}/` + pid );
  }

  public getProjectFiles(): ReadonlyArray<DashboardUserFileEntry> {
    return this.files;
  }

  public refreshFilesOfProject(pid: number): void {
    this.retrieveFilesOfProject(pid)
      .subscribe(files => {
        this.files = files;
      })
  }

  public retrieveProject(pid: number) : Observable<Project>{
    return this.http.get<Project>(`${PROJECT_BASE_URL}/` + pid);
  }

  public updateProjectName(pid: number, name: string) : Observable<Response>{
    return this.http.post<Response>(`${RENAME_PROJECT_URL}/` + pid + "/" + name, {});
  }

  public deleteProject(pid: number): Observable<Response> {
    return this.http.delete<Response>(`${DELETE_PROJECT_URL}/` + pid);
  }

  public createProject(name: string) : Observable<Project>{
    return this.http.post<Project>(`${CREATE_PROJECT_URL}/` + name, {});
  }

  public addWorkflowToProject(pid: number, wid: number): Observable<Response>{
    return this.http.post<Response>(`${ADD_WORKFLOW_TO_PROJECT_URL}/` + pid + "/" + wid, {})
  }

  public removeWorkflowFromProject(pid: number, wid: number): Observable<Response>{
    return this.http.delete<Response>(`${DELETE_WORKFLOW_FROM_PROJECT_URL}/` + pid + "/" + wid, {});
  }

  public addFileToProject(pid: number, fid: number): Observable<Response>{
    return this.http.post<Response>(`${ADD_FILE_TO_PROJECT_URL}/` + pid + "/" + fid, {});
  }

  public removeFileFromProject(pid: number, fid: number): Observable<Response>{
    return this.http.delete<Response>(`${DELETE_FILE_FROM_PROJECT_URL}/` + pid + "/" + fid, {});
  }

  /**
   * same as UserFileService"s deleteDashboardUserFileEntry method, except
   * it is modified to refresh the project"s list of files
   */
   public deleteDashboardUserFileEntry(pid: number, targetUserFileEntry: DashboardUserFileEntry): void {
    this.http
      .delete<Response>(`${USER_FILE_DELETE_URL}/${targetUserFileEntry.file.name}/${targetUserFileEntry.ownerName}`)
      .subscribe(
        () => {
          this.userFileService.refreshDashboardUserFileEntries();
          this.refreshFilesOfProject(pid); // refresh files within project
        },
        // @ts-ignore // TODO: fix this with notification component
        (err: unknown) => alert("Cannot delete the file entry: " + err.error)
      );
  }
}
