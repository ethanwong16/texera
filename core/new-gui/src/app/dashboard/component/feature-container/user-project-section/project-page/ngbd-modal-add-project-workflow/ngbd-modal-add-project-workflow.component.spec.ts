import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdModalAddProjectWorkflowComponent } from './ngbd-modal-add-project-workflow.component';

describe('NgbdModalAddProjectWorkflowComponent', () => {
  let component: NgbdModalAddProjectWorkflowComponent;
  let fixture: ComponentFixture<NgbdModalAddProjectWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdModalAddProjectWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdModalAddProjectWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
