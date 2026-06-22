import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { Exam } from '../../../service/exam';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // THÊM: Import HttpClient

@Component({
  selector: 'app-manage-exams',
  standalone: true, 
  imports: [SharedModule, NzTooltipModule, HttpClientModule], // THÊM: HttpClientModule vào imports
  templateUrl: './manage-exams.html',
  styleUrl: './manage-exams.scss',
})
export class ManageExams implements OnInit {
  isVisible = false;
  isConfirmLoading = false;
  exams: any[] = [];
  teacherId = localStorage.getItem('user_id') || '';

  constructor(
    private examService: Exam,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
    private http: HttpClient, // THÊM: Inject HttpClient trực tiếp vào Constructor
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
  onToggleShuffle(exam: any): void {
    this.http.put(`http://localhost:8080/api/user-exams/${exam.id}/toggle-shuffle`, {}).subscribe({
      next: (updatedExam: any) => {
        exam.shuffled = updatedExam.shuffled;
        
        if (exam.shuffled) {
          this.message.success('Đã kích hoạt chế độ đảo đề tự động cho học sinh!');
        } else {
          this.message.info('Đã tắt chế độ đảo đề.');
        }
        
        this.exams = [...this.exams];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message.error('Lỗi khi thay đổi cấu hình đảo đề!');
        console.error('Lỗi chi tiết:', err);
      }
    });
  }
  onShuffle(id: number): void {
    this.examService.shuffleExam(id).subscribe({
      next: (res) => {
        this.message.success('Đã đảo ngẫu nhiên câu hỏi và đáp án thành công!');
        const index = this.exams.findIndex(e => e.id === id);
        if (index !== -1) {
          this.exams[index] = res;
          this.exams[index].expand = true; 
          this.exams = [...this.exams];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.message.error('Lỗi khi thực hiện đảo đề!');
        console.error('Lỗi chi tiết:', err);
      }
    });
  }

  onDelete(id: number) {
    this.examService.deleteExam(id).subscribe(() => {
      this.message.success('Đã xóa đề thi');
      this.loadExams();
    });
  }

  newExam = {
    title: '',
    description: '',
    duration: 60,
    teacherId: localStorage.getItem('user_id'),
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