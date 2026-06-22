import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClassroomService } from '../../../services/classroom';
import { ActivatedRoute } from '@angular/router';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { FormsModule } from '@angular/forms';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SharedModule } from '../../../modules/shared/shared-module';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'; // THÊM DÒNG NÀY

@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [
    SharedModule, 
    FormsModule,
    NzTabsModule, 
    NzTableModule, 
    NzModalModule, 
    NzSelectModule, 
    NzBadgeModule, 
    NzTagModule, 
    NzEmptyModule,
    NzPopconfirmModule,
    HttpClientModule,
    NzTooltipModule // THÊM DÒNG NÀY vào mảng imports
  ],
  templateUrl: './class-details.html',
  styleUrl: './class-details.scss',
})
export class ClassDetails implements OnInit {
  classId!: number;
  students: any[] = [];
  results: any[] = [];
  availableExams: any[] = [];
  classroomData: any = null;
  loadingStudents = false;
  loadingResults = false;
  isModalVisible = false;
  selectedExamId: number | null = null;
  assignedExams: any[] = [];
  loadingExams = false;

  constructor(
    private route: ActivatedRoute,
    private classroomService: ClassroomService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.classId = +params['id'];
        this.loadClassroomDetails();
        this.loadStudents();
        this.loadClassResults();
        this.loadAssignedExams();
      }
    });
  }

  loadClassroomDetails(): void {
    this.classroomService.getClassroomById(this.classId).subscribe({
      next: (res) => {
        this.classroomData = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Không tải được thông tin lớp học');
      }
    });
  }

  loadAssignedExams(): void {
    this.loadingExams = true;
    this.classroomService.getAssignedExams(this.classId).subscribe({
      next: (res) => {
        this.assignedExams = res || [];
        this.loadingExams = false;
        this.cdr.detectChanges();
      },
      error: () => this.loadingExams = false
    });
  }

  onToggleShuffle(exam: any): void {
    this.http.put(`http://localhost:8080/api/user-exams/${exam.id}/toggle-shuffle`, {}).subscribe({
      next: (updatedExam: any) => {
        exam.shuffled = updatedExam.shuffled;
        
        if (exam.shuffled) {
          this.message.success(`Đã bật chế độ đảo đề thi "${exam.title}" cho lớp này!`);
        } else {
          this.message.info(`Đã tắt chế độ đảo đề thi "${exam.title}".`);
        }
        
        this.assignedExams = [...this.assignedExams];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message.error('Không thể cập nhật cấu hình đảo đề. Vui lòng kiểm tra lại!');
        console.error('Lỗi chi tiết:', err);
      }
    });
  }

  removeExam(examId: number): void {
    this.classroomService.removeExamFromClass(this.classId, examId).subscribe({
      next: (res) => {
        this.message.success('Đã xóa đề thi khỏi lớp này!');
        this.loadAssignedExams();
        this.cdr.detectChanges();
      },
      error: () => this.message.error('Lỗi khi xóa đề thi!')
    });
  }

  loadStudents(): void {
    this.loadingStudents = true;
    this.classroomService.getStudentsInClass(this.classId).subscribe({
      next: (res) => {
        this.students = res;
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message.error('Lỗi khi tải danh sách học sinh!');
        this.loadingStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClassResults(): void {
    this.loadingResults = true;
    this.classroomService.getClassResults(this.classId).subscribe({
      next: (res) => {
        this.results = res;
        this.loadingResults = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingResults = false;
      }
    });
  }

  showAssignExamModal(): void {
    this.isModalVisible = true;
    this.classroomService.getAllExams().subscribe({
      next: (res) => {
        this.availableExams = res;
      },
      error: (err) => {
        this.message.error('Không tải được danh sách đề thi!');
        console.error(err);
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.selectedExamId = null;
  }

  handleAssignExam(): void {
    if (!this.selectedExamId) {
      this.message.warning('Vui lòng chọn một đề thi!');
      return;
    }
    this.classroomService.assignExamToClass(this.classId, this.selectedExamId).subscribe({
      next: () => {
        this.message.success('Giao đề thi cho lớp thành công!');
        this.isModalVisible = false;
        this.selectedExamId = null;
        this.loadAssignedExams();
        this.cdr.detectChanges();
      },
      error: () => this.message.error('Lỗi khi giao đề thi!')
    });
  }
}