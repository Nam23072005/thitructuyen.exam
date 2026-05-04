import { Component } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';

@Component({
  selector: 'app-student-dashboard',
  imports: [SharedModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard {}
