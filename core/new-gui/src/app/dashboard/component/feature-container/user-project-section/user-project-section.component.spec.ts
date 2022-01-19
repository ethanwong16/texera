import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProjectSectionComponent } from './user-project-section.component';

describe('UserProjectSectionComponent', () => {
  let component: UserProjectSectionComponent;
  let fixture: ComponentFixture<UserProjectSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserProjectSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProjectSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
