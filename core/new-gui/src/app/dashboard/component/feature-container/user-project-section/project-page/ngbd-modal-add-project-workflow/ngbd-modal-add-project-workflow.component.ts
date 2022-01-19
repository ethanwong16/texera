import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, forkJoin } from 'rxjs';
import { WorkflowPersistService } from 'src/app/common/service/workflow-persist/workflow-persist.service';
import { DashboardWorkflowEntry } from 'src/app/dashboard/type/dashboard-workflow-entry';
import { UserProjectService } from 'src/app/dashboard/service/user-project/user-project.service';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'ngbd-modal-add-project-workflow',
  templateUrl: './ngbd-modal-add-project-workflow.component.html',
  styleUrls: ['./ngbd-modal-add-project-workflow.component.scss']
})
export class NgbdModalAddProjectWorkflowComponent implements OnInit {
  @Input() addedWorkflows!: DashboardWorkflowEntry[];
  @Input() projectId!: number;

  public unaddedWorkflows: DashboardWorkflowEntry[] = [];
  public checkedWorkflows: boolean[] = [];
  // private checkedWorkflowIndices: Set<number> = new Set<number>();
  private addedWorkflowKeys: Set<number> = new Set<number>();

  constructor(
    public activeModal: NgbActiveModal,
    private workflowPersistService: WorkflowPersistService,
    private userProjectService: UserProjectService
  ) {}

  ngOnInit(): void {
    //TODO : verify that it's ok to force cast to number, since wid may be undefined
    this.addedWorkflows.forEach(workflowEntry => this.addedWorkflowKeys.add(workflowEntry.workflow.wid!));
    this.refreshProjectWorkflowEntries();
  }

  // only closes modal when changes are finished on backend
  /*
  public submitForm() {
    // data structure to track group of updates to make to backend
    let observables: Observable<Response>[] = [];

    // process checked marks, updating local cache then propagating to backend
    // FIRST CHECK IF ALL CHECKBOXES ARE MARKED, THEN HAVE TO ITERATE THROUGH ENTIRE LIST
    this.checkedWorkflowIndices.forEach(index => {
      observables.push(this.userProjectService.addWorkflowToProject(this.projectId, this.unaddedWorkflows[index].workflow.wid!));
      
      // update local cache
      this.addedWorkflows.push(this.unaddedWorkflows[index]);
    });

    // pass back data to update local cache after all changes propagated to backend
    forkJoin(observables).subscribe(response => {
      this.activeModal.close(this.addedWorkflows);
    });
  }*/

  // asynchronous, may be faster but has issues
  /*
  public submitForm() {
    
    // process checked marks, updating local cache then propagating to backend
    // FIRST CHECK IF ALL CHECKBOXES ARE MARKED, THEN HAVE TO ITERATE THROUGH ENTIRE LIST
    this.checkedWorkflowIndices.forEach(index => {
      this.userProjectService
        .addWorkflowToProject(this.projectId, this.unaddedWorkflows[index].workflow.wid!)
        .subscribe();
      
      // update local cache
      this.addedWorkflows.push(this.unaddedWorkflows[index]);
    });

    // TODO : CHECK IF SHOULD BE ASYNCHRONOUS OR SYNCHRONOUS https://stackoverflow.com/questions/48185502/angular-how-to-await-subscribe/48185851
    // https://ostack.cn/?qa=1053184/angular-how-to-wait-for-subscriptions-inside-a-for-loop-to-complete-before-proceeding

    // pass back data to update local cache after all changes propagated to backend
    this.activeModal.close(this.addedWorkflows);
  } */

  /*
  public processCheck(index: number) {
    // box is being unchecked
    if (this.checkedWorkflowIndices.has(index)) {
      this.checkedWorkflowIndices.delete(index);
    } 
    // box is being checked
    else {
      this.checkedWorkflowIndices.add(index);
    }
  } */

  // ------------------------ USING ARRAY INSTEAD OF SET FOR CHECKBOXES

  public submitForm() {
    // data structure to track group of updates to make to backend
    let observables: Observable<Response>[] = [];

    // process any selected workflows, updating backend then frontend cache
    for (let index = 0; index < this.checkedWorkflows.length; ++index) {
      if (this.checkedWorkflows[index]) { // if workflow is checked
        observables.push(this.userProjectService.addWorkflowToProject(this.projectId, this.unaddedWorkflows[index].workflow.wid!));
        this.addedWorkflows.push(this.unaddedWorkflows[index]); // for updating frontend cache
      }
    }
    
    // pass back data to update local cache after all changes propagated to backend
    forkJoin(observables)
       .pipe(untilDestroyed(this))
       .subscribe(response => {
         this.activeModal.close(this.addedWorkflows);
        });
  }

  public changeAll() {
    if (this.isAllChecked()) {
      this.checkedWorkflows.fill(false);
    } else {
      this.checkedWorkflows.fill(true);
    }
  }

  public isAllChecked() {
    return this.checkedWorkflows.length > 0 && this.checkedWorkflows.every(isChecked => isChecked);
  }

  private refreshProjectWorkflowEntries(): void {
    this.workflowPersistService
      .retrieveWorkflowsBySessionUser()
      .pipe(untilDestroyed(this))
      .subscribe(dashboardWorkflowEntries => {
        this.unaddedWorkflows = dashboardWorkflowEntries.filter(workflowEntry => workflowEntry.workflow.wid !== undefined && !this.addedWorkflowKeys.has(workflowEntry.workflow.wid!));
        
        this.checkedWorkflows = new Array(this.unaddedWorkflows.length).fill(false);
      });
  }

}
 