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

  getUserName(): string {
    return localStorage.getItem('user_name');
  }

  getRole(): string | null {
    // Trả về '1' cho Học sinh, '2' cho Giáo viên
    return localStorage.getItem('user_role');
  }
  // Hàm kiểm tra để ẩn/hiện Sidebar
  isAuthPage(): boolean {
    const authRoutes = ['/login', '/register', '/'];
    return authRoutes.includes(this.router.url);
  }
  logout() {
    // Xóa toàn bộ thông tin đã lưu (như user_role, user_id)
    localStorage.clear();
    // Quay về trang đăng nhập
    this.router.navigateByUrl('/login');
  }
}
