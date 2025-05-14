'use client';

import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserData, getAllTeachers, deleteUserData } from '../../firebase/firestore';

export default function TeacherManage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 새 선생님 계정 생성을 위한 상태
  const [newTeacher, setNewTeacher] = useState({
    email: '',
    password: '',
    name: '',
  });

  // 선생님 목록 불러오기
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const teachersList = await getAllTeachers();
      setTeachers(teachersList);
      setLoading(false);
    } catch (err) {
      console.error('선생님 목록 불러오기 오류:', err);
      setError('선생님 목록을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 선생님 계정 생성 핸들러
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    
    if (!newTeacher.email || !newTeacher.password || !newTeacher.name) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Firebase Authentication에 사용자 등록
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newTeacher.email,
        newTeacher.password
      );
      
      // Firestore에 선생님 데이터 저장
      await createUserData(userCredential.user.uid, {
        name: newTeacher.name,
        email: newTeacher.email,
        role: 'teacher',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      
      setSuccess('선생님 계정이 성공적으로 생성되었습니다.');
      setNewTeacher({ email: '', password: '', name: '' });
      fetchTeachers(); // 목록 새로고침
    } catch (error) {
      console.error('선생님 계정 생성 오류:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일 주소입니다.');
      } else {
        setError('계정 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 선생님 계정 삭제 핸들러
  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('정말로 이 선생님 계정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteUserData(teacherId);
      setSuccess('선생님 계정이 삭제되었습니다.');
      fetchTeachers(); // 목록 새로고침
    } catch (error) {
      console.error('선생님 계정 삭제 오류:', error);
      setError('계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">선생님 관리</h2>
      
      {/* 새 선생님 계정 생성 폼 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">새 선생님 계정 생성</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="선생님 이름"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="이메일 주소"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="비밀번호"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : '선생님 계정 생성'}
          </button>
        </form>
      </div>

      {/* 선생님 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">선생님 목록</h3>
        
        {loading ? (
          <p>로딩 중...</p>
        ) : teachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">등록된 선생님이 없습니다.</p>
        )}
      </div>
    </div>
  );
} 