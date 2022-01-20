import { Component, OnInit } from '@angular/core';
import { UserProjectService } from '../../../service/user-project/user-project.service';
import { Project } from '../../../type/project';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzMessageService } from 'ng-zorro-antd/message';

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

  constructor(
    private userProjectService: UserProjectService,
    private router: Router,
    private message: NzMessageService
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
        this.projectEntries = projectEntries
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
    }

    // checks the projects belonging to user to see if this will create duplicate name
    else if (this.projectEntries.filter(p => project.pid !== p.pid && p.name === newName).length > 0) {
      // show error message and don't call backend
      this.message.create("error", `Project named: ${newName} already exists`)
    }

    else {
      this.userProjectService
      .updateProjectName(project.pid, newName)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.removeEditStatus(project.pid);
        this.getProjectArray(); // refresh list of projects, name is read only property so can't edit
    });
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
    // checks the projects belonging to user to see if this will create duplicate name
    if (this.projectEntries.filter(project => project.name === this.createProjectName).length > 0) {
      // show error message and don't call backend
      this.message.create("error", `Project named: ${this.createProjectName} already exists`)
    }

    else {
      this.userProjectService
       .createProject(this.createProjectName)
       .pipe(untilDestroyed(this))
       .subscribe(
         (createdProject) => {
          this.projectEntries.push(createdProject); // update local list of projects
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
