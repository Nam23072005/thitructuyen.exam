import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../modules/shared/shared-module';
import { ClassroomService } from '../../../services/classroom'; // 3 cấp thư mục chuẩn đét

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
  isExamShuffled: boolean = false; // Biến cờ lưu trạng thái cấu hình đảo đề của giáo viên
  
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
    private classroomService: ClassroomService // Inject ClassroomService tập trung
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

  // Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle) để xử lý đảo đề tại Client
  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Check lượt làm bài bằng API check-attempts thông qua Service tập trung
  checkExamAttemptsBeforeStart() {
    if (!this.userId || !this.examId) {
      alert('Thông tin tài khoản hoặc mã đề không hợp lệ!');
      this.router.navigate(['/student/dashboard']);
      return;
    }

    this.classroomService.checkExamAttempts(this.examId, this.userId)
      .subscribe({
        next: (res) => {
          if (res && res.allowed === false) {
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
    // 1. Gọi API lấy thông tin cấu hình chung qua Service tập trung
    this.classroomService.getExamDetail(this.examId!)
      .subscribe({
        next: (exam) => {
          this.seconds = exam.duration * 60; // Chuyển đổi từ phút sang giây
          this.isExamShuffled = exam.shuffled || false; // Đồng bộ cấu hình công tắc đảo đề
          this.formatTime();
          this.startCountdown();
          
          // 2. Gọi lồng tiếp API lấy danh sách câu hỏi qua Service tập trung
          this.loadQuestionsData();
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu cấu hình đề thi:', err);
          alert('Không thể tải thông tin đề thi. Vui lòng kiểm tra lại Backend!');
        }
      });
  }

  loadQuestionsData() {
    this.classroomService.getExamQuestions(this.examId!, this.userId!)
      .subscribe({
        next: (questionsData) => {
          let loadedQuestions = questionsData || [];

          // XỬ LÝ LOGIC ĐẢO ĐỀ TẠI FRONTEND: Nếu giáo viên bật nút công tắc
          if (this.isExamShuffled && loadedQuestions.length > 0) {
            console.log('Cấu hình đảo đề đang BẬT -> Đang trộn thứ tự câu hỏi và đáp án bằng Angular...');
            
            // Trộn thứ tự ngẫu nhiên của các câu hỏi
            loadedQuestions = this.shuffleArray(loadedQuestions);

            // Trộn tiếp thứ tự ngẫu nhiên của các phương án lựa chọn (Options) trong từng câu hỏi
            loadedQuestions.forEach(q => {
              if (q.options && q.options.length > 0) {
                q.options = this.shuffleArray(q.options);
              }
            });
          }

          this.questions = loadedQuestions;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách câu hỏi của đề:', err);
          alert('Có lỗi xảy ra khi tải câu hỏi bài thi!');
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

    // Gọi qua hàm submitExam tập trung của ClassroomService công khai
    this.classroomService.submitExam(submission)
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