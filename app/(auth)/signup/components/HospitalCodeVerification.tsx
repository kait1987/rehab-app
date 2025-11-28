"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getHospitalByCode } from "@/actions/hospital"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface HospitalCodeVerificationProps {
  value: string
  onChange: (value: string) => void
  onValid: (isValid: boolean) => void
}

export function HospitalCodeVerification({
  value,
  onChange,
  onValid,
}: HospitalCodeVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "valid" | "invalid">("idle")
  const [hospitalName, setHospitalName] = useState<string>("")

  const handleVerify = async () => {
    if (!value.trim()) {
      setVerificationStatus("idle")
      onValid(false)
      return
    }

    setIsVerifying(true)
    setVerificationStatus("idle")

    try {
      const result = await getHospitalByCode(value.trim())

      if (result.error || !result.data) {
        setVerificationStatus("invalid")
        setHospitalName("")
        onValid(false)
      } else {
        setVerificationStatus("valid")
        setHospitalName(result.data.name)
        onValid(true)
      }
    } catch (error) {
      setVerificationStatus("invalid")
      setHospitalName("")
      onValid(false)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="병원 코드를 입력하세요"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setVerificationStatus("idle")
            onValid(false)
          }}
          onBlur={handleVerify}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleVerify}
          disabled={isVerifying || !value.trim()}
        >
          {isVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "확인"
          )}
        </Button>
      </div>

      {verificationStatus === "valid" && hospitalName && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>확인됨: {hospitalName}</span>
        </div>
      )}

      {verificationStatus === "invalid" && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          <span>유효하지 않은 병원 코드입니다.</span>
        </div>
      )}
    </div>
  )
}

