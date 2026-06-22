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
  userId: number | null = null;
  
  // Logic đếm ngược thời gian
  remainingTime: string = "00:00"; 
  seconds: number = 0;
  timer: any;
  showWarning: boolean = false; // Điều khiển popup thông báo còn 10 phút

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const savedUserId = localStorage.getItem('user_id');
    
    if (savedUserId) {
      this.userId = Number(savedUserId);
    }

    if (idParam) {
      this.examId = Number(idParam);
      // BƯỚC ĐẦU TIÊN: Kiểm tra số lượt làm bài trước khi nạp dữ liệu thi công khai
      this.checkExamAttemptsBeforeStart();
    }
  }

  // TÍNH NĂNG MỚI: Check lượt làm bài bằng API check-attempts
  checkExamAttemptsBeforeStart() {
    if (!this.userId || !this.examId) {
      alert('Thông tin tài khoản hoặc mã đề không hợp lệ!');
      this.router.navigate(['/student/dashboard']);
      return;
    }

    this.http.get<any>(`http://localhost:8080/api/user-exams/${this.examId}/check-attempts?userId=${this.userId}`)
      .subscribe({
        next: (res) => {
          if (res && res.allowed === false) {
            // Nếu "allowed" trả về false từ Backend nghĩa là học sinh đã thi đủ/quá số lần cho phép
            alert(`Bạn đã hết lượt làm bài thi này! (Số lần đã làm: ${res.takenAttempts}/${res.maxAttempts})`);
            this.router.navigate(['/student/dashboard']);
          } else {
            // Nếu còn lượt, cho phép tải dữ liệu cấu hình thời gian và câu hỏi bình thường
            this.loadExamData();
          }
        },
        error: (err) => {
          console.error('Lỗi khi kiểm tra số lượt làm bài:', err);
          alert('Không thể xác thực số lượt làm bài thi từ hệ thống!');
          this.router.navigate(['/student/dashboard']);
        }
      });
  }

  loadExamData() {
    // 1. Gọi API lấy thông tin cấu hình chung (thời gian làm bài)
    this.http.get<any>(`http://localhost:8080/api/user-exams/${this.examId}`)
      .subscribe({
        next: (exam) => {
          this.seconds = exam.duration * 60; // Chuyển đổi từ phút sang giây
          this.formatTime();
          this.startCountdown();
          
          // 2. Gọi lồng tiếp API lấy danh sách câu hỏi (Có kèm param userId để Backend double check bảo mật)
          this.loadQuestionsData();
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu cấu hình đề thi:', err);
          alert('Không thể tải thông tin đề thi. Vui lòng kiểm tra lại Backend!');
        }
      });
  }

  loadQuestionsData() {
    // Truyền thêm userId lên API câu hỏi để Backend chặn tầng cứng từ Controller nếu cố tình gọi trực tiếp API
    this.http.get<any[]>(`http://localhost:8080/api/user-exams/${this.examId}/questions?userId=${this.userId}`)
      .subscribe({
        next: (questionsData) => {
          this.questions = questionsData || [];
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách câu hỏi của đề:', err);
          if (err.error && err.error.message) {
            alert(err.error.message);
          } else {
            alert('Có lỗi xảy ra khi tải câu hỏi bài thi!');
          }
          this.router.navigate(['/student/dashboard']);
        }
      });
  }

  startCountdown() {
    this.timer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        this.formatTime();
        this.cdr.detectChanges(); 

        if (this.seconds === 600) {
          this.showWarning = true;
          setTimeout(() => {
            this.showWarning = false;
            this.cdr.detectChanges(); 
          }, 3000);
        }
      } else {
        this.stopTimer();
        alert('Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.');
        this.submitExam(true); 
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

  submitExam(isAuto: boolean = false) {
    if (!isAuto && Object.keys(this.selectedAnswers).length < this.questions.length) {
      if (!confirm('Bạn chưa hoàn thành tất cả câu hỏi, vẫn muốn nộp bài chứ?')) {
        return;
      }
    }

    const submission = {
      userId: this.userId, 
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
          alert('Có lỗi xảy ra khi nộp bài.');
        }
      });
  }
}