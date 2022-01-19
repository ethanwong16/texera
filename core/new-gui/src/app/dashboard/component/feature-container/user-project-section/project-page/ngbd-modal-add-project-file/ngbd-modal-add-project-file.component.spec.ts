import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdModalAddProjectFileComponent } from './ngbd-modal-add-project-file.component';

describe('NgbdModalAddProjectFileComponent', () => {
  let component: NgbdModalAddProjectFileComponent;
  let fixture: ComponentFixture<NgbdModalAddProjectFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdModalAddProjectFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdModalAddProjectFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
