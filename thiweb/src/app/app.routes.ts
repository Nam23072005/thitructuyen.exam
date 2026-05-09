import { Routes } from '@angular/router';
import { Signup } from './auth/signup/signup';
import { Login } from './auth/login/login';
import { StudentDashboard } from './pages/student/student-dashboard/student-dashboard';
import { TeacherDashboard } from './pages/teacher/teacher-dashboard/teacher-dashboard';
import { ManageExams } from './pages/teacher/manage-exams/manage-exams';
import { AddQuestion } from './pages/teacher/add-question/add-question';
import { ExamStats } from './pages/teacher/exam-stats/exam-stats';
import { StudentExamComponent } from './pages/student/student-exam/student-exam.component';

export const routes: Routes = [
  { path: 'register', component: Signup },
  { path: 'login', component: Login },
  { path: 'teacher/dashboard', component: TeacherDashboard },
  { path: 'student/dashboard', component: StudentDashboard },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'teacher/manage-exams', component: ManageExams },
  { path: 'teacher/add-question/:id', component: AddQuestion },
  { path: 'teacher/stats/:id', component: ExamStats },
  { path: 'student/exam/:id', component: StudentExamComponent }
];
