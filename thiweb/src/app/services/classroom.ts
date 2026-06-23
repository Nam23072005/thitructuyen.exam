import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private rootUrl = 'http://localhost:8080/api';
  private baseUrl = `${this.rootUrl}/classrooms`;

  constructor(private http: HttpClient) { }

  // Lấy danh sách lớp học của một giáo viên
  getClassroomsByTeacher(teacherId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/teacher/${teacherId}`);
  }

  // Xem danh sách học sinh của một lớp
  getStudentsInClass(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${classId}/students`);
  }

  // Giao đề thi cho lớp học
  assignExamToClass(classId: number, examId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${classId}/assign-exam/${examId}`, {}, { responseType: 'text' });
  }

  getAllClassrooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  getClassResults(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}/user-exams/class/${classId}`);
  }

  getClassroomById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getAllExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}/user-exams/all`); 
  }

  // Lấy các đề thi đã giao cho lớp
  getAssignedExams(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${classId}/exams`);
  }

  // Xóa đề thi khỏi lớp
  removeExamFromClass(classId: number, examId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${classId}/remove-exam/${examId}`, { responseType: 'text' });
  }
  
  getStudentExams(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}/user-exams/student/${studentId}/available-exams`);
  }

  toggleExamShuffle(examId: number): Observable<any> {
    return this.http.put<any>(`${this.rootUrl}/teacher/exams/${examId}/toggle-shuffle`, {});
  }

  submitExam(submission: any): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/user-exams/submit`, submission);
  }

  // Chi tiết cấu hình đề thi
  getExamDetail(examId: number): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/user-exams/${examId}`);
  }

  // Danh sách câu hỏi gốc của đề thi
  getExamQuestions(examId: number, userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}/user-exams/${examId}/questions?userId=${userId}`);
  }

  // =========================================================================
  // HÀM ĐÃ ĐỔI ĐƯỜNG DẪN: Hướng thẳng sang StudentAttemptController riêng biệt
  // =========================================================================
  checkExamAttempts(examId: number, userId: number): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/student-attempts/${examId}/check-attempts?userId=${userId}`);
  }
}