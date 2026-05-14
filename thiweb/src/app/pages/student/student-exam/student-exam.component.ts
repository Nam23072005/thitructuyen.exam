import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  showWarning: boolean = false; 
  private warningTriggered = false; // Flag để đảm bảo popup chỉ hiện 1 lần

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.examId = Number(idParam);
      this.loadExamData();
    }
  }

  loadExamData() {
    this.http.get<any>(`http://localhost:8080/api/user-exams/${this.examId}`)
      .subscribe({
        next: (exam) => {
          if (!exam.questions || exam.questions.length === 0) {
            alert('Đề thi này chưa có câu hỏi!');
            this.router.navigate(['/student/dashboard']);
            return;
          }

          this.questions = exam.questions;
          this.seconds = exam.duration * 60; 
          
          this.formatTime();
          this.startCountdown();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu đề thi:', err);
          alert('Không thể tải đề thi. Vui lòng kiểm tra lại Backend!');
        }
      });
  }

  startCountdown() {
    this.stopTimer();

    this.timer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        this.formatTime();

        // Hiện cảnh báo khi còn đúng 10 phút (600 giây)
        if (this.seconds === 600 && !this.warningTriggered) {
          this.triggerWarning();
        }
        
        this.cdr.detectChanges(); 
      } else {
        this.stopTimer();
        this.cdr.detectChanges();
        alert('Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.');
        this.submitExam(true);
      }
    }, 1000);
  }

  triggerWarning() {
    this.showWarning = true;
    this.warningTriggered = true;
    this.cdr.detectChanges();

    // Tự động đóng popup sau 5 giây để không che màn hình làm bài
    setTimeout(() => {
      this.showWarning = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  formatTime() {
    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    this.remainingTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  selectOption(questionId: number, optionId: number) {
    this.selectedAnswers[questionId] = optionId;
    // Không cần detectChanges ở đây vì radio group thường tự trigger
  }

  scrollToQuestion(index: number) {
    const element = document.getElementById('question-' + index);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  submitExam(isAuto: boolean = false) {
    if (!isAuto && Object.keys(this.selectedAnswers).length < this.questions.length) {
      if (!confirm('Bạn chưa hoàn thành tất cả câu hỏi, vẫn muốn nộp bài chứ?')) {
        return;
      }
    }

    // Lấy thông tin user an toàn
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('Phiên đăng nhập hết hạn!');
      this.router.navigate(['/login']);
      return;
    }

    const submission = {
      userId: Number(userId), 
      examId: this.examId,
      answers: Object.keys(this.selectedAnswers).map(qId => ({
        questionId: Number(qId),
        selectedOptionId: this.selectedAnswers[qId]
      }))
    };

    this.http.post('http://localhost:8080/api/user-exams/submit', submission)
      .subscribe({
        next: (res: any) => {
          this.stopTimer(); 
          alert(`Nộp bài thành công! Điểm của bạn: ${res.score}`);
          this.router.navigate(['/student/dashboard']);
        },
        error: (err) => {
          console.error('Lỗi nộp bài:', err);
          alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
        } 
      });
  }
  
}
