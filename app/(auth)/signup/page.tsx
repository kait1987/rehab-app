"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signUp } from "@/actions/auth"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

const signUpSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  phone: z.string().optional(),
  role: z.enum(["patient", "therapist"]),
  hospitalCode: z.string().optional(),
  hospitalId: z.string().optional(),
  licenseNumber: z.string().optional(),
  diagnosis: z.string().optional(),
  surgeryDate: z.string().optional(),
  birthYear: z.number().optional(),
  gender: z.string().optional(),
}).refine((data) => {
  // 환자/치료사 기능 비활성화로 검증 완화
  // if (data.role === "patient" && !data.hospitalCode) {
  //   return false
  // }
  // if (data.role === "therapist" && !data.hospitalId) {
  //   return false
  // }
  return true
}, {
  message: "병원 코드 또는 병원을 선택해주세요",
  path: ["hospitalCode"],
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [surgeryDate, setSurgeryDate] = useState<Date>()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "patient", // 기본값 설정 (UI에서 숨김)
    },
  })

  // const role = form.watch("role") // 비활성화됨
  const role = "patient" // 항상 patient로 설정 (UI에서 숨김)

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await signUp({
        ...data,
        surgeryDate: surgeryDate ? format(surgeryDate, "yyyy-MM-dd") : undefined,
      })

      if (result.error) {
        alert(`회원가입 실패: ${result.error}`)
      } else {
        alert("회원가입이 완료되었습니다! 이메일을 확인해주세요.")
        router.push("/login")
      }
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1B1D] px-4">
      <Card className="w-full max-w-md bg-[#252628] border-[#2A2B2D]">
        <CardHeader>
          <CardTitle className="text-white">회원가입</CardTitle>
          <CardDescription className="text-gray-400">
            재활운동 관리 앱에 가입하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 역할 선택 필드 숨김 (비활성화) */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>회원 유형</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="회원 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="patient">환자</SelectItem>
                        <SelectItem value="therapist">치료사</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">이름</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="이메일을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">휴대폰 번호 (선택)</FormLabel>
                    <FormControl>
                      <Input placeholder="010-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 환자 관련 필드 숨김 (비활성화) */}
              {false && role === "patient" && (
                <>
                  <FormField
                    control={form.control}
                    name="hospitalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>병원 코드 *</FormLabel>
                        <FormControl>
                          <Input placeholder="병원에서 받은 코드를 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>진단명 (선택)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 무릎 인대 손상" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>수술일 (선택)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !surgeryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {surgeryDate ? format(surgeryDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={surgeryDate}
                          onSelect={setSurgeryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <FormField
                    control={form.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>출생연도 (선택)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1990"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>성별 (선택)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="성별을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">남성</SelectItem>
                            <SelectItem value="female">여성</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* 치료사 관련 필드 숨김 (비활성화) */}
              {false && role === "therapist" && (
                <>
                  <FormField
                    control={form.control}
                    name="hospitalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>병원 ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="병원 ID를 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>면허 번호 (선택)</FormLabel>
                        <FormControl>
                          <Input placeholder="면허 번호를 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full gradient-teal" disabled={isSubmitting}>
                {isSubmitting ? "처리 중..." : "회원가입"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[#01B395] hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

