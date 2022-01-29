import { Component, OnInit } from "@angular/core";
import { UserProjectService } from "../../../service/user-project/user-project.service";
import { Project } from "../../../type/project";
import { Router } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NotificationService } from "../../../../common/service/notification/notification.service";

export const ROUTER_PROJECT_BASE_URL = "/dashboard/project";

@UntilDestroy()
@Component({
  selector: "texera-user-project-section",
  templateUrl: "./user-project-section.component.html",
  styleUrls: ["./user-project-section.component.scss"]
})
export class UserProjectSectionComponent implements OnInit {
  public projectEntries: Project[] = [];
  public projectEntriesIsEditingName: number[] = [];
  public createButtonIsClicked: boolean = false;
  public createProjectName: string = "";

  constructor(
    private userProjectService: UserProjectService,
    private router: Router,
    private notificationService: NotificationService
  ) { 
  }

  ngOnInit(): void {
    this.getProjectArray();
  }

  private getProjectArray() {
    
    this.userProjectService
      .retrieveProjectList()
      .pipe(untilDestroyed(this))
      .subscribe(projectEntries => {
        this.projectEntries = projectEntries;
      });
  }

  /**
   * navigate to individual project page
   */
  public jumpToProject({ pid }: Project): void {
    this.router.navigate([`${ROUTER_PROJECT_BASE_URL}/${pid}`]).then(null);
  }

  public removeEditStatus(pid : number): void {
    this.projectEntriesIsEditingName = this.projectEntriesIsEditingName.filter(index => index != pid);
  }

  public saveProjectName(project: Project, newName: string, index: number): void {
    // nothing happens if name is the same
    if (project.name === newName) {
      this.removeEditStatus(project.pid);
    } else if (this.isValidNewProjectName(newName, project)) {
      this.userProjectService
      .updateProjectName(project.pid, newName)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.removeEditStatus(project.pid);
        this.getProjectArray(); // refresh list of projects, name is read only property so can"t edit
      });
    } else {
      // show error message and don"t call backend
      this.notificationService.error(`Cannot create project named: "${newName}".  It must be a non-empty, unique name`);
    }
  }

  public deleteProject(pid: number, index: number): void{
    this.userProjectService
      .deleteProject(pid)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.projectEntries.splice(index, 1); // update local list of projects
    });
  }

  public clickCreateButton(): void{
    this.createButtonIsClicked = true;
  }

  public unclickCreateButton(): void{
    this.createButtonIsClicked = false;
    this.createProjectName = "";
  }

  public createNewProject(): void{
    if (this.isValidNewProjectName(this.createProjectName)) {
      this.userProjectService
       .createProject(this.createProjectName)
       .pipe(untilDestroyed(this))
       .subscribe(
         (createdProject) => {
          this.projectEntries.push(createdProject); // update local list of projects
          this.unclickCreateButton();
        }
      );
    } else {
      // show error message and don't call backend
      this.notificationService.error(`Cannot create project named: "${this.createProjectName}".  It must be a non-empty, unique name`);
    }
  }

  private isValidNewProjectName(newName: string, oldProject?: Project): boolean {
    if (typeof oldProject === 'undefined') {
      return newName.length != 0 && this.projectEntries.filter(project => project.name === newName).length === 0;
    } else {
      return newName.length != 0 && this.projectEntries.filter(project => project.pid !== oldProject.pid && project.name === newName).length === 0; 
    }
  }

  public sortByCreationTime(): void {
    this.projectEntries.sort((p1, p2) => 
      p1.creationTime !== undefined && p2.creationTime !== undefined
      ? p1.creationTime - p2.creationTime
      : 0
    );
  }

  public sortByNameAsc(): void {
    this.projectEntries.sort((p1, p2) => 
      p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
    );
  }

  public sortByNameDesc(): void {
    this.projectEntries.sort((p1, p2) => 
      p2.name.toLowerCase().localeCompare(p1.name.toLowerCase())
    );
  }
}
