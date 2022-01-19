import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdModalRemoveProjectWorkflowComponent } from './ngbd-modal-remove-project-workflow.component';

describe('NgbdModalRemoveProjectWorkflowComponent', () => {
  let component: NgbdModalRemoveProjectWorkflowComponent;
  let fixture: ComponentFixture<NgbdModalRemoveProjectWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdModalRemoveProjectWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdModalRemoveProjectWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
