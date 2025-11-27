import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#1A1B1D]">
      {/* Header */}
      <header className="bg-[#1A1B1D] border-b border-[#2A2B2D] sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" asChild className="min-w-[44px] min-h-[44px]">
            <Link href="/main">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-base md:text-lg font-bold text-[#01B395]">개인정보 처리방침</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        <Card className="bg-[#252628] border-[#2A2B2D]">
          <CardHeader className="px-4 md:px-6 pt-6 md:pt-8">
            <CardTitle className="text-lg md:text-xl text-white">개인정보 처리방침</CardTitle>
            <CardDescription className="text-sm text-gray-400">최종 수정일: 2024년 1월 1일</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 md:space-y-6 prose prose-sm max-w-none px-4 md:px-6 pb-6 md:pb-8">
            <section>
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white">1. 개인정보의 처리 목적</h2>
              <p className="text-gray-300">
                동네 재활 헬스장 서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-300">
                <li>서비스 제공: 재활 헬스장 검색, 운동 코스 추천, 리뷰 작성 등</li>
                <li>서비스 개선: 사용자 경험 향상, 서비스 품질 개선</li>
                <li>고객 지원: 문의사항 응대, 불만 처리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">2. 개인정보의 처리 및 보유기간</h2>
              <p className="text-gray-300">
                서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-300">
                <li>회원가입 정보: 회원 탈퇴 시까지 (단, 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</li>
                <li>리뷰 정보: 작성일로부터 3년간 보관</li>
                <li>서비스 이용 기록: 서비스 이용 종료 시까지</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. 처리하는 개인정보의 항목</h2>
              <p className="text-gray-300 mb-2">서비스는 다음의 개인정보 항목을 처리하고 있습니다:</p>
              <div className="bg-[#1A1B1D] p-4 rounded-lg border border-[#2A2B2D]">
                <p className="font-semibold mb-2">필수 항목:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-300">
                  <li>이메일 주소 (회원가입 시)</li>
                  <li>비밀번호 (회원가입 시)</li>
                  <li>이름 (회원가입 시)</li>
                </ul>
                <p className="font-semibold mb-2 mt-4">선택 항목:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-300">
                  <li>휴대폰 번호</li>
                  <li>위치 정보 (현재 위치 기반 헬스장 검색 시)</li>
                </ul>
                <p className="font-semibold mb-2 mt-4">자동 수집 항목:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-300">
                  <li>IP 주소, 쿠키, 서비스 이용 기록</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-300">
                서비스는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>정보주체가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. 개인정보처리의 위탁</h2>
              <p className="text-gray-300">
                서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <p className="font-semibold">Supabase (데이터베이스 및 인증 서비스)</p>
                <p className="text-sm text-gray-600 mt-1">
                  위탁 내용: 개인정보 저장 및 관리, 사용자 인증
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-gray-300">
                정보주체는 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 서비스 내 설정 메뉴 또는 고객센터를 통해 요청하실 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. 개인정보의 파기</h2>
              <p className="text-gray-300">
                서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. 개인정보 보호책임자</h2>
              <p className="text-gray-300">
                서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-[#1A1B1D] p-4 rounded-lg mt-2 border border-[#2A2B2D]">
                <p className="font-semibold text-white">개인정보 보호책임자</p>
                <p className="text-sm text-gray-400 mt-1">
                  연락처: 서비스 내 고객센터를 통해 문의해주세요.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. 개인정보 처리방침 변경</h2>
              <p className="text-gray-300">
                이 개인정보 처리방침은 2024년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

