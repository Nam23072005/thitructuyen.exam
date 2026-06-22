import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { Exam } from '../../../service/exam';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-manage-exams',
  standalone: true, 
  imports: [SharedModule, NzTooltipModule],
  templateUrl: './manage-exams.html',
  styleUrl: './manage-exams.scss',
})
export class ManageExams implements OnInit {
  isVisible = false;
  isConfirmLoading = false;
  isEditMode = false;
  editingExamId: number | null = null;
  exams: any[] = [];
  teacherId = localStorage.getItem('user_id') || '';

  newExam = {
    title: '',
    description: '',
    duration: 60,
    maxAttempts: 1, 
    teacherId: localStorage.getItem('user_id'),
  };

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
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  onDelete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) {
      this.examService.deleteExam(id).subscribe(() => {
        this.message.success('Đã xóa đề thi');
        this.loadExams();
      });
    }
  }

  showModal(): void {
    this.isEditMode = false;
    this.editingExamId = null;
    
    // 1. Mở modal rỗng trước
    this.isVisible = true;
    this.cdr.detectChanges();

    // 2. Nạp dữ liệu mặc định sau để tránh lỗi kiểm tra chu kỳ (NG0100)
    setTimeout(() => {
      this.newExam = {
        title: '',
        description: '',
        duration: 60,
        maxAttempts: 1,
        teacherId: localStorage.getItem('user_id'),
      };
      this.cdr.detectChanges();
    });
  }

  onEdit(exam: any): void {
    this.isEditMode = true;
    this.editingExamId = exam.id;
    
    // 1. Mở khung modal trước
    this.isVisible = true;
    this.cdr.detectChanges();

    // 2. Đổ dữ liệu của đề cần sửa vào form ở chu kỳ tiếp theo
    setTimeout(() => {
      this.newExam = {
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        maxAttempts: exam.maxAttempts || 1,
        teacherId: localStorage.getItem('user_id'),
      };
      this.cdr.detectChanges();
    }, 10); // delay 10ms để dứt khoát chu kỳ render modal của Ng-Zorro
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleOk(): void {
    this.isConfirmLoading = true;

    if (this.isEditMode && this.editingExamId) {
      const updatedData = { id: this.editingExamId, ...this.newExam };
      
      this.examService.saveExam(updatedData).subscribe({
        next: () => {
          this.isVisible = false;
          this.isConfirmLoading = false;
          this.message.success('Cập nhật đề thi thành công!');
          this.loadExams();
        },
        error: (err) => {
          this.isConfirmLoading = false;
          this.message.error('Lỗi khi cập nhật đề thi');
        }
      });
    } else {
      this.examService.saveExam(this.newExam).subscribe({
        next: (res) => {
          this.isVisible = false;
          this.isConfirmLoading = false;
          this.message.success('Tạo đề thành công!');
          this.router.navigate(['/teacher/add-question', res.id]);
        },
        error: (err) => {
          this.isConfirmLoading = false;
          this.message.error('Lỗi khi tạo đề');
        },
      });
    }
  }

  onToggleStatus(exam: any): void {
    this.examService.toggleStatus(exam.id).subscribe({
      next: (res) => {
        this.message.success('Cập nhật trạng thái thành công!');
        this.loadExams();
      },
      error: (err) => {
        this.message.error('Lỗi khi khóa/mở khóa đề thi');
      },
    });
  }
}