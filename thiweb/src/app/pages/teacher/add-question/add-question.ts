import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam } from '../../../service/exam';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-question',
  imports: [SharedModule],
  templateUrl: './add-question.html',
  styleUrl: './add-question.scss',
})
export class AddQuestion implements OnInit {
  examId: number = 0;
  questionContent: string = '';

  // Khai báo 4 đáp án
  opt1: string = '';
  opt2: string = '';
  opt3: string = '';
  opt4: string = '';

  // Biến lưu vị trí đáp án đúng (1, 2, 3 hoặc 4)
  correctIdx: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: Exam,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Lấy ID đề thi từ URL
    const id = this.route.snapshot.paramMap.get('id');
    this.examId = Number(id);

    if (isNaN(this.examId)) {
      this.message.error('ID đề thi không hợp lệ!');
      this.router.navigate(['/teacher/manage-exams']);
    }
  }

  onSubmit(): void {
    // Kiểm tra nhanh xem đã nhập nội dung chưa
    if (!this.questionContent || !this.opt1 || !this.opt2) {
      this.message.warning('Vui lòng nhập câu hỏi và ít nhất 2 đáp án!');
      return;
    }

    const questionObj = {
      content: this.questionContent,
      options: [
        { optionText: this.opt1, correct: this.correctIdx === 1 },
        { optionText: this.opt2, correct: this.correctIdx === 2 },
        { optionText: this.opt3, correct: this.correctIdx === 3 },
        { optionText: this.opt4, correct: this.correctIdx === 4 },
      ].filter((opt) => opt.optionText.trim() !== ''), // Chỉ gửi những đáp án có chữ
    };

    this.examService.addQuestion(this.examId, questionObj).subscribe({
      next: (res) => {
        this.message.success('Thêm câu hỏi thành công!');
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi Backend:', err);
        this.message.error('Không thể lưu câu hỏi. Kiểm tra Console (F12) nhé Hòa!');
      },
    });
  }

  resetForm() {
    this.questionContent = '';
    this.opt1 = '';
    this.opt2 = '';
    this.opt3 = '';
    this.opt4 = '';
    this.correctIdx = 1;
    this.cdr.detectChanges();
  }
}
