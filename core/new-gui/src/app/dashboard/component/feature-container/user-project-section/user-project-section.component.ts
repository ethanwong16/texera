import { Component, OnInit } from '@angular/core';
import { DashboardWorkflowEntry } from 'src/app/dashboard/type/dashboard-workflow-entry';
import { UserProjectService } from '../../../service/user-project/user-project.service';
import { Project } from '../../../type/project';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NotificationService } from "src/app/common/service/notification/notification.service"

export const ROUTER_PROJECT_BASE_URL = "/dashboard/project";

@UntilDestroy()
@Component({
  selector: 'user-project-section',
  templateUrl: './user-project-section.component.html',
  styleUrls: ['./user-project-section.component.scss']
})
export class UserProjectSectionComponent implements OnInit {
  public projectEntries: Project[] = [];
  public projectEntriesIsEditingName: number[] = [];
  public createButtonIsClicked: boolean = false;
  public createProjectName: string = "";

  // temporary just to visualize, thinking of creating separate components for workflows/files?
  public projectWorkflows: Map<number, DashboardWorkflowEntry[]> = new Map();

  constructor(
    private userProjectService: UserProjectService,
    private notificationService: NotificationService,
    private router: Router
  ) { 
  }

  ngOnInit(): void {
    this.getProjectArray();
  }

  // public getProjectArray(): ReadonlyArray<Project> {
  //   const projectArray = this.userProjectService.getProjectList();
  //   if (!projectArray) {
  //     return [];
  //   }
  //   // console.log("lookie here");
  //   // console.log(projectArray);
  //   // this.projectEntries = projectArray;
  //   return projectArray;
  // }

  private getProjectArray() {
    // const projectArray = 

    this.userProjectService
      .retrieveProjectList()
      .pipe(untilDestroyed(this))
      .subscribe(projectEntries => {
        this.projectEntries = projectEntries

        // temporary
        // for (let project of this.projectEntries) {
        //   this.getWorkflowsOfProject(project.pid);
        // }
      });

    // if (projectArray) {
    //   console.log("component: inside here");
    //   this.projectEntries = projectArray;
    // }
    // console.log("lookie here");
    // console.log(projectArray);
    // this.projectEntries = projectArray;
  }

  private getWorkflowsOfProject(pid : number) {

    this.userProjectService
      .retrieveWorkflowsOfProject(pid)
      .pipe(untilDestroyed(this))
      .subscribe(workflows => (this.projectWorkflows.set(pid, workflows)));
  }

  /**
   * navigate to individual project page
   */
  public jumpToProject({ pid }: Project): void {
    // console.log(pid);
    this.router.navigate([`${ROUTER_PROJECT_BASE_URL}/${pid}`]).then(null);
  }

  public removeEditStatus(pid : number): void {
    this.projectEntriesIsEditingName = this.projectEntriesIsEditingName.filter(index => index != pid);
  }

  public saveProjectName(project: Project, newName: string): void {
    this.userProjectService
      .updateProjectName(project.pid, newName)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
      this.removeEditStatus(project.pid);

      // refresh, temporary could probably just do this locally later
      this.getProjectArray();
    });
  }

  public deleteProject(pid: number): void{
    this.userProjectService
      .deleteProject(pid)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
      // refresh, temporary could probably just do this locally later
      this.getProjectArray();
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

    // checks the projects belonging to user to see if this will create duplicate name
    if (this.projectEntries.filter(project => project.name === this.createProjectName).length > 0) {
      // show error message and don't call backend
      console.log("added duplicate");
    }

    else {
      this.userProjectService
       .createProject(this.createProjectName)
       .pipe(untilDestroyed(this))
       .subscribe(
         (response) => {
          // refresh, temporary could probably just do this locally later
          console.log(response);
          this.getProjectArray();
          this.unclickCreateButton();
        }
      );
    }
  }

  public sortByCreationTime(): void {
    this.projectEntries.sort((p1, p2) => 
      p1.creationTime !== undefined && p2.creationTime !== undefined
      ? p1.creationTime - p2.creationTime
      : 0
    )
  }

  public sortByNameAsc(): void {
    this.projectEntries.sort((p1, p2) => 
      p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
    )
  }

  public sortByNameDesc(): void {
    this.projectEntries.sort((p1, p2) => 
      p2.name.toLowerCase().localeCompare(p1.name.toLowerCase())
    )
  }
}
