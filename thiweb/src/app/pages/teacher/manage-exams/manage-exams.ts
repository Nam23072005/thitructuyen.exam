import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { Exam } from '../../../service/exam';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-manage-exams',
  imports: [SharedModule,NzTooltipModule],
  templateUrl: './manage-exams.html',
  styleUrl: './manage-exams.scss',
})
export class ManageExams implements OnInit {
  isVisible = false;
  isConfirmLoading = false;
  exams: any[] = [];
  teacherId = localStorage.getItem('user_id') || ''; // Lấy ID giáo viên đã lưu khi login

  constructor(
    private examService: Exam,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams() {
    const teacherId = localStorage.getItem('user_id');
    this.examService.getMyExams(teacherId).subscribe({
      next: (res) => {
        this.exams = res;
        // 3. Ép Angular kiểm tra lại giao diện ngay lập tức
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  onDelete(id: number) {
    this.examService.deleteExam(id).subscribe(() => this.loadExams());
  }
  newExam = {
    title: '',
    description: '',
    duration: 60,
    teacherId: localStorage.getItem('user_id'), // Gắn ID của Hòa vào đây
  };

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleOk(): void {
    this.isConfirmLoading = true;

    this.examService.saveExam(this.newExam).subscribe({
      next: (res) => {
        // res chính là đề thi vừa tạo, ví dụ: { id: 10, title: 'sinh', ... }
        this.isVisible = false;
        this.isConfirmLoading = false;

        // ĐÂY LÀ DÒNG LỆNH CHUYỂN TRANG
        // Nó sẽ dẫn Hòa đến URL: /teacher/add-question/10
        this.router.navigate(['/teacher/add-question', res.id]);

        console.log('Đã tạo đề thành công với ID:', res.id);
      },
      error: (err) => {
        this.isConfirmLoading = false;
        console.error('Lỗi khi tạo đề:', err);
      },
    });
  }
  onToggleStatus(exam: any): void {
    this.examService.toggleStatus(exam.id).subscribe({
      next: (res) => {
        this.message.success('Cập nhật trạng thái thành công!');
        this.loadExams(); // Tải lại danh sách để cập nhật giao diện
      },
      error: (err) => {
        this.message.error('Lỗi khi khóa/mở khóa đề thi');
      },
    });
  }
}
