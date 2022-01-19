import { TestBed } from '@angular/core/testing';

import { UserProjectService } from './user-project.service';

describe('UserProjectService', () => {
  let service: UserProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
