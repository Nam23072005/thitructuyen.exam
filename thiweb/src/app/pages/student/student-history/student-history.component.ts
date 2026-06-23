import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-history',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './student-history.component.html',
  styleUrl: './student-history.component.scss',
})
export class StudentHistory implements OnInit {
  history: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    this.http.get<any[]>(`http://localhost:8080/api/user-exams/history/${userId}`).subscribe({
      next: (res) => {
        this.history = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải lịch sử thi:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}