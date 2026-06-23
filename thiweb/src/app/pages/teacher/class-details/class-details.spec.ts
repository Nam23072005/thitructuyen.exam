import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassDetails } from './class-details';

describe('ClassDetails', () => {
  let component: ClassDetails;
  let fixture: ComponentFixture<ClassDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
