import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { Exam } from '../../../service/exam';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-exam-stats',
  imports: [SharedModule],
  templateUrl: './exam-stats.html',
  styleUrl: './exam-stats.scss',
})
export class ExamStats implements OnInit {
  examId: number = 0;
  stats: any = {
    avgScore: 0,
    totalStudents: 0,
    passRate: 0,
  };
  // Danh sách chi tiết từng học sinh (nếu bạn viết thêm API lấy List<Result>)
  studentResults: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private examService: Exam,
  ) {}

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.examService.getStats(this.examId).subscribe({
      next: (res) => {
        this.stats = res;
      },
      error: (err) => console.error('Lỗi lấy thống kê:', err),
    });
  }
}
