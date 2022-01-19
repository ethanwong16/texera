import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdModalRemoveProjectFileComponent } from './ngbd-modal-remove-project-file.component';

describe('NgbdModalRemoveProjectFileComponent', () => {
  let component: NgbdModalRemoveProjectFileComponent;
  let fixture: ComponentFixture<NgbdModalRemoveProjectFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdModalRemoveProjectFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdModalRemoveProjectFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
