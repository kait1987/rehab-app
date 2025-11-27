import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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
          <h1 className="text-base md:text-lg font-bold text-[#01B395]">이용약관</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        <Card className="bg-[#252628] border-[#2A2B2D]">
          <CardHeader className="px-4 md:px-6 pt-6 md:pt-8">
            <CardTitle className="text-lg md:text-xl text-white">서비스 이용약관</CardTitle>
            <CardDescription className="text-sm text-gray-400">최종 수정일: 2024년 1월 1일</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 md:space-y-6 prose prose-sm max-w-none px-4 md:px-6 pb-6 md:pb-8">
            <section>
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white">제1조 (목적)</h2>
              <p className="text-gray-300">
                본 약관은 동네 재활 헬스장 서비스(이하 "서비스")가 제공하는 재활 헬스장 검색 및 운동 코스 추천 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">제2조 (정의)</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>"서비스"란 재활 헬스장 검색, 운동 코스 추천, 리뷰 작성 등의 기능을 제공하는 웹/모바일 애플리케이션을 의미합니다.</li>
                <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</li>
                <li>"회원"이란 서비스에 회원등록을 하고 서비스를 이용하는 자를 의미합니다.</li>
                <li>"콘텐츠"란 서비스를 통해 제공되는 정보, 텍스트, 이미지 등을 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">제3조 (약관의 게시와 개정)</h2>
              <p className="text-gray-300">
                서비스는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정된 약관은 서비스 내 공지사항을 통해 안내합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제4조 (서비스의 제공 및 변경)</h2>
              <p className="text-gray-300 mb-2">서비스는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-300">
                <li>위치 기반 재활 헬스장 검색 서비스</li>
                <li>재활 운동 코스 추천 서비스</li>
                <li>헬스장 리뷰 작성 및 조회 서비스</li>
                <li>혼잡도 정보 제공 서비스</li>
              </ul>
              <p className="text-gray-700 mt-4">
                서비스는 필요한 경우 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제5조 (서비스의 중단)</h2>
              <p className="text-gray-300">
                서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다. 서비스는 서비스 제공 중단 시 사전에 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제6조 (회원가입)</h2>
              <p className="text-gray-300">
                이용자는 서비스가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다. 서비스는 회원가입 신청에 대하여 승낙함을 원칙으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제7조 (회원의 의무)</h2>
              <p className="text-gray-700 mb-2">회원은 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-300">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>서비스에 게시된 정보의 변경</li>
                <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>서비스와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>서비스와 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제8조 (재활 운동 코스에 대한 안내)</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <p className="font-semibold text-yellow-800 mb-2">중요 안내사항</p>
                <p className="text-gray-300">
                  본 서비스에서 제공하는 재활 운동 코스는 <strong>의료적 진단이나 치료가 아닌, 일반적인 운동 정보</strong>입니다.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>운동 중 통증이 심화되거나 불편함이 느껴지면 즉시 중단하시기 바랍니다.</li>
                  <li>심각한 통증이나 부상이 있는 경우 반드시 전문의와 상담하시기 바랍니다.</li>
                  <li>본 서비스의 운동 코스는 개인차가 있을 수 있으며, 모든 사용자에게 적합하지 않을 수 있습니다.</li>
                  <li>운동 전 충분한 준비운동과 운동 후 스트레칭을 권장합니다.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제9조 (콘텐츠의 저작권)</h2>
              <p className="text-gray-300">
                서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에 귀속합니다. 이용자는 서비스를 이용함으로써 얻은 정보 중 서비스에 지적재산권이 귀속된 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제10조 (면책조항)</h2>
              <p className="text-gray-700 mb-2">서비스는 다음의 경우 책임을 지지 않습니다:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-300">
                <li>천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우</li>
                <li>이용자의 귀책사유로 인한 서비스 이용의 장애</li>
                <li>서비스에 게시된 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 보증하지 않습니다.</li>
                <li>이용자가 본 서비스의 운동 코스를 수행함으로써 발생하는 신체적 손상, 부상 등에 대하여 책임을 지지 않습니다.</li>
                <li>헬스장 정보의 정확성, 완전성, 신뢰성에 대하여 보증하지 않습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제11조 (분쟁의 해결)</h2>
              <p className="text-gray-300">
                서비스와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 명확하지 아니한 경우의 관할법원은 민사소송법에 따라 정합니다.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

