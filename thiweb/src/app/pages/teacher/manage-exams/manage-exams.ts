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
  exams: any[] = [];
  teacherId = localStorage.getItem('user_id') || '';

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

  // dao de
  onShuffle(id: number): void {
    this.examService.shuffleExam(id).subscribe({
      next: (res) => {
        this.message.success('Đã đảo ngẫu nhiên câu hỏi và đáp án thành công!');
        
        //  tim de thi vua dao va cap nhat du lieu moi
        const index = this.exams.findIndex(e => e.id === id);
        if (index !== -1) {
          // hien du lieu moi
          this.exams[index] = res;

          this.exams[index].expand = true; 
          
          // hien ngay lap tuc
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