import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export const metadata = {
  title: '비밀번호 재설정',
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">페이지 로딩 중...</div>
    </div>
  );
}

