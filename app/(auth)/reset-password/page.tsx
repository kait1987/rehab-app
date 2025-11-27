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
import { resetPassword, updatePassword } from "@/actions/auth"

const resetPasswordSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  confirmPassword: z.string().min(8, "비밀번호를 확인해주세요"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isResetMode = !searchParams.get("token")

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const updateForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await resetPassword(data)

      if (result.error) {
        setError(result.error)
      } else {
        setIsEmailSent(true)
        setSuccess("비밀번호 재설정 링크가 이메일로 전송되었습니다.")
      }
    } catch (error) {
      setError(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdateSubmit = async (data: UpdatePasswordFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await updatePassword({ password: data.password })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("비밀번호가 성공적으로 변경되었습니다.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error) {
      setError(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>비밀번호 재설정</CardTitle>
            <CardDescription>
              비밀번호 재설정 링크를 이메일로 받으세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                {success}
              </div>
            )}

            {!isEmailSent ? (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="이메일을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "전송 중..." : "재설정 링크 전송"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  이메일을 확인하고 비밀번호 재설정 링크를 클릭하세요.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsEmailSent(false)
                    resetForm.reset()
                  }}
                >
                  다시 시도
                </Button>
              </div>
            )}

            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>새 비밀번호 설정</CardTitle>
          <CardDescription>
            새로운 비밀번호를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}

          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="새 비밀번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호를 다시 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

