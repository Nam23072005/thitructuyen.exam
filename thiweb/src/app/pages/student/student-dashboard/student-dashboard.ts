import { ChangeDetectorRef, Component } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { ClassroomService } from '../../../services/classroom';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-student-dashboard',
  imports: [SharedModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard {
  exams: any[] = [];
  loading = false;

  constructor(
    private classroomService: ClassroomService, // Inject Service của bạn vào đây
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Lấy ID học sinh đang đăng nhập từ localStorage
    const studentIdStr = localStorage.getItem('user_id'); 
    if (studentIdStr) {
      this.loadStudentExams(+studentIdStr);
      this.cdr.detectChanges();
    } else {
      this.message.error('Không tìm thấy thông tin tài khoản học sinh!');
    }
  }

  loadStudentExams(studentId: number): void {
    this.loading = true;
    this.classroomService.getStudentExams(studentId).subscribe({
      next: (res) => {
        this.exams = res || [];
        this.loading = false;
        this.cdr.detectChanges(); // Ép Angular cập nhật giao diện ngay lập tức
      },
      error: (err) => {
        this.message.error('Lỗi khi tải danh sách đề thi!');
        this.loading = false;
        this.cdr.detectChanges(); // Ép Angular cập nhật giao diện ngay lập tức
      }
    });
  }
}
