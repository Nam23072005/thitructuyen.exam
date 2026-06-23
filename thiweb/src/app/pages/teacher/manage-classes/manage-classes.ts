import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared-module';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClassroomService } from '../../../services/classroom';


@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './manage-classes.html',
  styleUrls: ['./manage-classes.scss']
})
export class ManageClassesComponent implements OnInit {
  classes: any[] = [];
  loading = false;

  constructor(
    private classroomService: ClassroomService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    
    this.classroomService.getAllClassrooms().subscribe({
      next: (res) => {
        // In ra console để kiểm tra dữ liệu có chuẩn mảng không
        console.log("Dữ liệu lớp học tải về:", res); 
        
        this.classes = res || []; // Đảm bảo luôn là một mảng
        this.loading = false;     // Tắt cờ loading
        this.cdr.detectChanges(); // 3. ÉP ANGULAR CẬP NHẬT MÀN HÌNH NGAY LẬP TỨC
      },
      error: (err) => {
        this.message.error('Lỗi khi tải danh sách lớp học');
        this.loading = false;
        this.cdr.detectChanges(); // Ép cập nhật cả khi lỗi
      }
    });
  }
}