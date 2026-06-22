import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  // Thay đổi port nếu Backend của bạn chạy port khác nhé
  private baseUrl = 'http://localhost:8080/api/classrooms';

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
    // Sửa chữ results thành user-exams cho khớp với Java
    return this.http.get<any[]>(`http://localhost:8080/api/user-exams/class/${classId}`);
  }

  getClassroomById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getAllExams(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/user-exams/all'); 
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
    return this.http.get<any[]>(`http://localhost:8080/api/user-exams/student/${studentId}/available-exams`);
  }
}