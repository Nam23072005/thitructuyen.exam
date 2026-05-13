import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Thêm OnDestroy để dọn dẹp bộ nhớ
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../modules/shared/shared-module';

@Component({
  selector: 'app-student-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './student-exam.component.html',
  styleUrl: './student-exam.component.scss'
})
export class StudentExamComponent implements OnInit, OnDestroy {
  questions: any[] = [];
  selectedAnswers: { [key: number]: number } = {}; 
  examId: number | null = null;
  
  // Logic đếm ngược thời gian
  remainingTime: string = "00:00"; 
  seconds: number = 0;
  timer: any;
  showWarning: boolean = false; // Điều khiển popup thông báo còn 10 phút

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef, // Thêm vào đây
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.examId = Number(idParam);
      this.loadExamData(); // Gọi hàm lấy thông tin đề thi thay vì chỉ lấy câu hỏi
    }
  }

  // Lấy dữ liệu Exam để có trường duration (phút)
  loadExamData() {
    this.http.get<any>(`http://localhost:8080/api/user-exams/${this.examId}`)
      .subscribe({
        next: (exam) => {
          this.questions = exam.questions;
          this.seconds = exam.duration * 60; // Chuyển đổi từ phút sang giây
          this.formatTime();
          this.cdr.detectChanges();
          this.startCountdown();
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu đề thi:', err);
          alert('Không thể tải đề thi. Vui lòng kiểm tra lại Backend!');
        }
      });
  }

  startCountdown() {
    this.timer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        this.formatTime();

        if (this.seconds === 600) {
          this.showWarning = true;
          setTimeout(() => this.showWarning = false, 3000);
        }
      } else {
        this.stopTimer();
        alert('Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.');
        this.submitExam(true); // Nộp bài tự động khi hết giờ
      }
    }, 1000);
  }

  formatTime() {
    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    this.remainingTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // Giải phóng timer khi chuyển trang để tránh rò rỉ bộ nhớ
  ngOnDestroy() {
    this.stopTimer();
  }

  selectOption(questionId: number, optionId: number) {
    this.selectedAnswers[questionId] = optionId;
  }

  scrollToQuestion(index: number) {
    const element = document.getElementById('question-' + index);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Sửa lại hàm submitExam để nhận tham số nộp tự động
  submitExam(isAuto: boolean = false) {
    if (!isAuto && Object.keys(this.selectedAnswers).length < this.questions.length) {
      if (!confirm('Bạn chưa hoàn thành tất cả câu hỏi, vẫn muốn nộp bài chứ?')) {
        return;
      }
    }

    const submission = {
      userId: Number(localStorage.getItem('user_id')), 
      examId: this.examId,
      answers: Object.keys(this.selectedAnswers).map(qId => ({
        questionId: Number(qId),
        selectedOptionId: this.selectedAnswers[qId]
      }))
    };

    this.http.post('http://localhost:8080/api/user-exams/submit', submission)
      .subscribe({
        next: (res: any) => {
          this.stopTimer(); // Dừng timer ngay khi nộp thành công
          alert(`Nộp bài thành công! Điểm của bạn: ${res.score}`);
          this.router.navigate(['/student-dashboard']);
        },
        error: (err) => {
          console.error('Lỗi nộp bài:', err);
          alert('Có lỗi xảy ra khi nộp bài.');
        }
      });
  }
}
