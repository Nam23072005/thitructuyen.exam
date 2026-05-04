import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamStats } from './exam-stats';

describe('ExamStats', () => {
  let component: ExamStats;
  let fixture: ComponentFixture<ExamStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamStats],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
