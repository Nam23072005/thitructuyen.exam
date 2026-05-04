import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { RouterLink } from '@angular/router';
import { Exam } from '../../../service/exam';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [SharedModule, RouterLink],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.scss',
})
export class TeacherDashboard implements OnInit {
  // Khai báo biến để thay cho số 15 và 45 đang viết cứng (hardcode)
  totalExams: number = 0;
  totalStudents: number = 0;
  teacherId = localStorage.getItem('user_id') || '';

  constructor(private examService: Exam,
              private cdr: ChangeDetectorRef,) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // Sau này Hòa có thể viết thêm 1 API tổng hợp hoặc lấy từ danh sách đề thi
    this.examService.getMyExams(this.teacherId).subscribe((res) => {
      this.totalExams = res.length;
      // Giả sử tính tổng học sinh từ các đề thi
      this.totalStudents = res.reduce((acc, cur) => acc + (cur.studentCount || 0), 0);
      this.cdr.detectChanges();
    });
  }
}
