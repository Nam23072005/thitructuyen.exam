import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [SharedModule, RouterModule, HttpClientModule, NzEmptyModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard implements OnInit {
  // Mảng chứa danh sách các bài thi động lấy từ CSDL
  openExams: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActiveExams();
  }

  loadActiveExams(): void {
    // Gọi đến API Endpoint Backend để lấy danh sách đề thi
    this.http.get<any[]>('http://localhost:8080/api/user-exams').subscribe({
      next: (res) => {
        // Lọc lấy những đề thi đang ở trạng thái active = true (Đang mở)
        this.openExams = res.filter(exam => exam.active === true);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách bài thi cho học sinh:', err);
      }
    });
  }
}