import { Routes } from '@angular/router';
import { Signup } from './auth/signup/signup';
import { Login } from './auth/login/login';
import { StudentDashboard } from './pages/student/student-dashboard/student-dashboard';
import { TeacherDashboard } from './pages/teacher/teacher-dashboard/teacher-dashboard';
import { ManageExams } from './pages/teacher/manage-exams/manage-exams';
import { AddQuestion } from './pages/teacher/add-question/add-question';
import { ExamStats } from './pages/teacher/exam-stats/exam-stats';
import { StudentExamComponent } from './pages/student/student-exam/student-exam.component';
import { StudentHistory } from './pages/student/student-history/student-history.component';
import { ManageClassesComponent } from './pages/teacher/manage-classes/manage-classes';
import { ClassDetails } from './pages/teacher/class-details/class-details';

export const routes: Routes = [
  // --- HỆ THỐNG AUTH ---
  { path: 'login', component: Login },
  { path: 'register', component: Signup },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'teacher/dashboard', component: TeacherDashboard },
  { path: 'teacher/manage-exams', component: ManageExams },
  { path: 'teacher/add-question/:id', component: AddQuestion },
  { path: 'teacher/stats/:id', component: ExamStats },
  { path: 'teacher/classes', component: ManageClassesComponent },       
  { path: 'teacher/class-details/:id', component: ClassDetails },    
  { path: 'student/dashboard', component: StudentDashboard },
  { path: 'student/exam/:id', component: StudentExamComponent },
  { path: 'student/history', component: StudentHistory },               
  { path: '**', redirectTo: '/login' }
];