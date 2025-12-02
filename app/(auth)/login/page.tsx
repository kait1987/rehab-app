import { Suspense } from 'react';
import LoginContent from './LoginContent';

export const metadata = {
  title: '로그인',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">로그인 페이지 로딩 중...</div>
    </div>
  );
}

