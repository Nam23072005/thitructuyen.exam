import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Exam {
  private baseUrl = 'http://localhost:8080/api/teacher';

  constructor(private http: HttpClient) {}

  // Lấy danh sách đề của tôi
  getMyExams(teacherId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/exams/my/${teacherId}`);
  }

  // Lưu đề thi mới (chỉ cần title, description, duration)
  saveExam(exam: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/exams`, exam);
  }

  // Thêm câu hỏi vào đề
  addQuestion(examId: number, question: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/exams/${examId}/questions`, question);
  }

  // Lấy thống kê phổ điểm
  getStats(examId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/exams/${examId}/stats`);
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/exams/${id}`);
  }
}
