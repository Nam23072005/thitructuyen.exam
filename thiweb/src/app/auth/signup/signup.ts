import { Component } from '@angular/core';
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
export class Signup {
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private route: Router,
    private authService: Auth
  ) {}

  validateForm!: FormGroup;

  ngOnInit() {
    this.validateForm= this.fb.group({
      name:[null,[Validators.required]],
      password:[null,[Validators.required]],
      email:[null,[Validators.required,Validators.email]],
      role: ["USER", [Validators.required]]
    })
  }

  submitForm(){
    this.authService.register(this.validateForm.value).subscribe(res=>{
      this.message.success(
        `Đăng ký thành công`,{nzDuration:5000}
      ); this.route.navigateByUrl("/login");
    },error => {
      this.message.error(
        `${error.error}`,{nzDuration:5000}
      )
    })
  }
}
