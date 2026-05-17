import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-dashboard',
  imports: [SharedModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard implements OnInit {
  exams: any[] = [];
  history: any[] = [];
  isLoading = true;
  isLoadingHistory = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadHistory();
  }

  loadExams(): void {
    this.http.get<any[]>('http://localhost:8080/api/user-exams/active').subscribe({
      next: (res) => {
        this.exams = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải danh sách đề thi:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadHistory(): void {
    const userId = localStorage.getItem('user_id');
    this.http.get<any[]>(`http://localhost:8080/api/user-exams/history/${userId}`).subscribe({
      next: (res) => {
        this.history = res;
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải lịch sử thi:', err);
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
    });
  }
}
