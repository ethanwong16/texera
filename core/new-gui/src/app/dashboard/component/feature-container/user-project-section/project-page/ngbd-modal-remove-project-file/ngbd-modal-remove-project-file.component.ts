import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, forkJoin } from 'rxjs';
import { UserProjectService } from '../../../../../service/user-project/user-project.service';
import { DashboardUserFileEntry } from '../../../../../type/dashboard-user-file-entry';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'ngbd-modal-remove-project-file',
  templateUrl: './ngbd-modal-remove-project-file.component.html',
  styleUrls: ['./ngbd-modal-remove-project-file.component.scss']
})
export class NgbdModalRemoveProjectFileComponent implements OnInit {
  @Input() addedFiles!: DashboardUserFileEntry[];
  @Input() projectId!: number;

  public checkedFiles: boolean[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private userProjectService: UserProjectService
  ) { }

  ngOnInit(): void {
    this.checkedFiles = new Array(this.addedFiles.length).fill(false);
  }

  public submitForm() {
    let observables: Observable<Response>[] = [];

    for (let index = this.checkedFiles.length - 1; index >= 0; --index) {
      if (this.checkedFiles[index]) {
        observables.push(this.userProjectService.removeFileFromProject(this.projectId, this.addedFiles[index].file.fid!));
        this.addedFiles.splice(index, 1); // for updating frontend cache
      }
    }

    forkJoin(observables)
       .pipe(untilDestroyed(this))
       .subscribe(response => {
         this.activeModal.close(this.addedFiles);
        })
  }

  public isAllChecked() {
    return this.checkedFiles.length > 0 && this.checkedFiles.every(isChecked => isChecked);
  }

  public changeAll() {
    if (this.isAllChecked()) {
      this.checkedFiles.fill(false);
    } else {
      this.checkedFiles.fill(true);
    }
  }

}
