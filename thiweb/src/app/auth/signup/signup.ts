import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../modules/shared/shared-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Route, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-signup',
  imports: [SharedModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup implements OnInit {
  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private route: Router,
    private authService: Auth
  ) {}

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      password: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      role: ["USER", [Validators.required]],
      classroomName: [null]
    });

    this.validateForm.get('role')?.valueChanges.subscribe(role => {
      const classControl = this.validateForm.get('classroomName');
      if (role === 'USER') {
        classControl?.setValidators([Validators.required]);
      } else {
        classControl?.clearValidators();
      }
      classControl?.updateValueAndValidity(); 
    });

    this.validateForm.get('role')?.updateValueAndValidity();
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.authService.register(this.validateForm.value).subscribe({
        next: (res) => {
          this.message.success(`Đăng ký thành công`, { nzDuration: 5000 });
          this.route.navigateByUrl("/login");
        },
        error: (error) => {
          this.message.error(`${error.error}`, { nzDuration: 5000 });
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}