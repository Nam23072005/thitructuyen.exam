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
  
  remainingTime: string = "00:00"; 
  seconds: number = 0;
  timer: any;
  showWarning: boolean = false; 
  showResultModal: boolean = false;
  submissionResult: any = null;

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
      this.checkExamAttemptsBeforeStart();
    }
  }

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
            alert(`Bạn đã hết lượt làm bài thi này! (Số lần đã làm: ${res.takenAttempts}/${res.maxAttempts})`);
            this.router.navigate(['/student/dashboard']);
          } else {
            this.loadExamData();
          }
        },
        error: (err) => {
          console.error(err);
          alert('Không thể xác thực số lượt làm bài thi từ hệ thống!');
          this.router.navigate(['/student/dashboard']);
        }
      });
  }

  loadExamData() {
    this.http.get<any>(`http://localhost:8080/api/user-exams/${this.examId}`)
      .subscribe({
        next: (exam) => {
          this.seconds = exam.duration * 60; 
          this.formatTime();
          this.startCountdown();
          this.loadQuestionsData();
        },
        error: (err) => {
          console.error(err);
          alert('Không thể tải thông tin đề thi. Vui lòng kiểm tra lại Backend!');
        }
      });
  }

  // 1. ĐÃ BỔ SUNG: Thuật toán Fisher-Yates xáo trộn vị trí ngẫu nhiên một mảng độc lập
  shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // Hoán đổi vị trí hai phần tử cho nhau
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  loadQuestionsData() {
    this.http.get<any[]>(`http://localhost:8080/api/user-exams/${this.examId}/questions?userId=${this.userId}`)
      .subscribe({
        next: (questionsData) => {
          // 2. ĐÃ SỬA: Ép danh sách câu hỏi chạy qua hàm shuffle để thực hiện đảo đề liên tục
          const rawQuestions = questionsData || [];
          this.questions = this.shuffle([...rawQuestions]); 
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error(err);
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
          this.submissionResult = res;
          this.showResultModal = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Có lỗi xảy ra khi nộp bài.');
        }
      });
  }

  backToDashboard() {
    this.showResultModal = false;
    this.router.navigate(['/student/dashboard']);
  }
}