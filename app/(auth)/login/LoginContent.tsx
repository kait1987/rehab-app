"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "@/actions/auth"

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // URL 파라미터에서 error 읽기
  const urlError = searchParams.get('error')

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await signIn(data)

      if (result?.error) {
        setError(result.error)
      } else {
        // signIn에서 redirect를 처리하므로 여기까지 오지 않음
        const redirect = searchParams.get("redirect")
        if (redirect) {
          router.push(redirect)
        }
      }
    } catch (error) {
      setError(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1B1D] px-4">
      <Card className="w-full max-w-md bg-[#252628] border-[#2A2B2D]">
        <CardHeader>
          <CardTitle className="text-white">로그인</CardTitle>
          <CardDescription className="text-gray-400">
            재활운동 관리 앱에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || urlError) && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded">
              {error || urlError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" className="w-full gradient-teal" disabled={isSubmitting}>
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              <Link href="/reset-password" className="text-[#01B395] hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <div className="text-gray-400">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-[#01B395] hover:underline">
                회원가입
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

