import { Component, signal } from '@angular/core';
import { Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SharedModule } from './modules/shared/shared-module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('thiweb');
  
  constructor(private router: Router) {}

  getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  getRole(): string | null {
    return localStorage.getItem('user_role');
  }

  // Hàm này sẽ trả về true nếu cần ẨN Sidebar và Header
  shouldHideLayout(): boolean {
    const currentUrl = this.router.url;
    const authRoutes = ['/login', '/register', '/'];
    
    // Kiểm tra nếu là trang auth HOẶC trang đang làm bài thi
    const isExamPage = currentUrl.includes('/student/exam/');
    
    return authRoutes.includes(currentUrl) || isExamPage;
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}