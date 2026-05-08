import { Component } from '@angular/core';
import { SharedModule } from '../../modules/shared/shared-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private authService: Auth,
  ) {}

  ngOnInit() {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    });
  }

  submitForm() {
    this.authService.login(this.validateForm.value).subscribe({
      next: (res) => {
        // DÒNG QUAN TRỌNG: In ra để xem cấu trúc JSON trả về
        console.log('Dữ liệu từ Backend:', res);

        this.message.success('Đăng nhập thành công', { nzDuration: 3000 });

        // SỬA TẠI ĐÂY: Thường Backend Spring Boot sẽ trả về 'id'
        // Chúng ta dùng dấu || để đề phòng, nếu không có id thì lấy userId
        const idToSave = res.id || res.userId;

        if (idToSave) {
          localStorage.setItem('user_id', idToSave.toString());
          localStorage.setItem('user_role', res.role);

          localStorage.setItem('user_name', res.name || 'Người dùng');
          // Điều hướng dựa trên vai trò
          if (res.role === 'TEACHER' || res.role === 'ADMIN') {
            this.router.navigateByUrl('/teacher/dashboard');
          } else if (res.role === 'USER') {
            this.router.navigateByUrl('/student/dashboard');
          }
        } else {
          console.error('Lỗi: Backend không trả về ID người dùng trong object res!');
          this.message.warning('Lỗi hệ thống: Không lấy được ID người dùng');
        }
      },
      error: (error) => {
        console.error('Lỗi đăng nhập:', error);
        this.message.error('Sai email hoặc mật khẩu!', { nzDuration: 5000 });
      },
    });
  }
}
