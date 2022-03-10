import { Component } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbdModalFileAddComponent } from "./ngbd-modal-file-add/ngbd-modal-file-add.component";
import { UserFileService } from "../../../service/user-file/user-file.service";
import { DashboardUserFileEntry, UserFile } from "../../../type/dashboard-user-file-entry";
import { UserService } from "../../../../common/service/user/user.service";
import { NgbdModalUserFileShareAccessComponent } from "./ngbd-modal-file-share-access/ngbd-modal-user-file-share-access.component";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NotificationService } from "src/app/common/service/notification/notification.service";
import Fuse from "fuse.js";

@UntilDestroy()
@Component({
  selector: "texera-user-file-section",
  templateUrl: "./user-file-section.component.html",
  styleUrls: ["./user-file-section.component.scss"],
})
export class UserFileSectionComponent {
  constructor(
    private modalService: NgbModal,
    private userFileService: UserFileService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    // this.userFileService.refreshDashboardUserFileEntries();
  }

  ngOnInit() {
    this.registerDashboardFileEntriesRefresh();
  }

  public dashboardUserFileEntries: ReadonlyArray<DashboardUserFileEntry> = [];
  public isEditingName: number[] = [];
  public userFileSearchValue: string = "";
  public filteredFilenames: Set<string> = new Set();
  public isTyping: boolean = false;
  public fuse = new Fuse([] as ReadonlyArray<DashboardUserFileEntry>, {
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: ["file.name"],
  });

  // TODO : should we pass data (instantaenous update) or do it as now?
  public openFileAddComponent() {
    const modalRef = this.modalService.open(NgbdModalFileAddComponent);

    modalRef.dismissed.pipe(untilDestroyed(this)).subscribe(_ => {
      this.refreshDashboardFileEntries();
    });
  }

  public searchInputOnChange(value: string): void {
    this.isTyping = true;
    this.filteredFilenames.clear();
    // const fileArray = this.userFileService.getUserFiles();
    const fileArray = this.dashboardUserFileEntries;
    fileArray.forEach(fileEntry => {
      if (fileEntry.file.name.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        this.filteredFilenames.add(fileEntry.file.name);
      }
    });
  }

  public onClickOpenShareAccess(dashboardUserFileEntry: DashboardUserFileEntry): void {
    const modalRef = this.modalService.open(NgbdModalUserFileShareAccessComponent);
    modalRef.componentInstance.dashboardUserFileEntry = dashboardUserFileEntry;
  }

  // TODO : look into moving this ELSEIF logic into refreshing the user files
  public getFileArray(): ReadonlyArray<DashboardUserFileEntry> {
    // const fileArray = this.userFileService.getUserFiles();
    const fileArray = this.dashboardUserFileEntries;
    if (!fileArray) {
      return [];
    } else if (this.userFileSearchValue !== "" && this.isTyping === false) {
      this.fuse.setCollection(fileArray);
      return this.fuse.search(this.userFileSearchValue).map(item => {
        return item.item;
      });
    }
    return fileArray;
  }

  public deleteUserFileEntry(userFileEntry: DashboardUserFileEntry): void {
    this.userFileService.deleteDashboardUserFileEntry(userFileEntry).subscribe(
      () => this.refreshDashboardFileEntries(),
      // @ts-ignore
      (err: unknown) => this.notificationService.error("Can't delete the file entry: " + err.error.message)
    );
  }

  public disableAddButton(): boolean {
    return !this.userService.isLogin();
  }

  public addFileSizeUnit(fileSize: number): string {
    return this.userFileService.addFileSizeUnit(fileSize);
  }

  public downloadUserFile(userFileEntry: DashboardUserFileEntry): void {
    this.userFileService
      .downloadUserFile(userFileEntry.file)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Blob) => {
          // prepare the data to be downloaded.
          const dataType = response.type;
          const binaryData = [];
          binaryData.push(response);

          // create a download link and trigger it.
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(new Blob(binaryData, { type: dataType }));
          downloadLink.setAttribute("download", userFileEntry.file.name);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          URL.revokeObjectURL(downloadLink.href);
        },
        (err: unknown) => {
          // @ts-ignore
          this.notificationService.error(err.error.message);
        }
      );
  }

  public confirmUpdateFileCustomName(
    dashboardUserFileEntry: DashboardUserFileEntry,
    name: string,
    index: number
  ): void {
    const {
      file: { fid },
    } = dashboardUserFileEntry;
    this.userFileService
      .updateFileName(fid, name)
      .pipe(untilDestroyed(this))
      .subscribe(
        // () => this.userFileService.refreshDashboardUserFileEntries(),
        () => this.refreshDashboardFileEntries(),
        (err: unknown) => {
          // @ts-ignore
          this.notificationService.error(err.error.message);
          // this.userFileService.refreshDashboardUserFileEntries();
          this.refreshDashboardFileEntries();
        }
      )
      .add(() => (this.isEditingName = this.isEditingName.filter(fileIsEditing => fileIsEditing != index)));
  }

  private registerDashboardFileEntriesRefresh(): void {
    this.userService.userChanged().pipe(untilDestroyed(this)).subscribe(() => {
      if (this.userService.isLogin()) {
        this.refreshDashboardFileEntries();
      } else {
        this.clearDashboardFileEntries();
      }
    });
  }

  private refreshDashboardFileEntries(): void {
    // TODO1 : should it check for login / clearing here?
    // if (!this.userService.isLogin()) {
    //   this.clearDashboardFileEntries();
    //   return;
    // }
    
    this.userFileService.retrieveDashboardUserFileEntryList().pipe(untilDestroyed(this)).subscribe(dashboardUserFileEntries => {
      this.dashboardUserFileEntries = dashboardUserFileEntries;
      this.userFileService.updateUserFilesChangedEvent();
    });
  }

  private clearDashboardFileEntries(): void {
    this.dashboardUserFileEntries = [];
    this.userFileService.updateUserFilesChangedEvent();
  }
}
