"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface GymFiltersProps {
  filters: {
    isQuiet?: boolean
    hasRehabEquipment?: boolean
    hasParking?: boolean
    hasShower?: boolean
    hasPtCoach?: boolean
  }
  onFiltersChange: (filters: {
    isQuiet?: boolean
    hasRehabEquipment?: boolean
    hasParking?: boolean
    hasShower?: boolean
    hasPtCoach?: boolean
  }) => void
}

export function GymFilters({ filters, onFiltersChange }: GymFiltersProps) {
  const handleFilterChange = (key: keyof typeof filters, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some((v) => v === true)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">필터</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id="quiet"
            checked={filters.isQuiet || false}
            onCheckedChange={(checked) =>
              handleFilterChange("isQuiet", checked === true)
            }
            className="h-5 w-5"
          />
          <Label htmlFor="quiet" className="cursor-pointer text-base flex-1">
            조용한 곳
          </Label>
        </div>

        <div className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id="rehab-equipment"
            checked={filters.hasRehabEquipment || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasRehabEquipment", checked === true)
            }
            className="h-5 w-5"
          />
          <Label htmlFor="rehab-equipment" className="cursor-pointer text-base flex-1">
            재활기구 있음
          </Label>
        </div>

        <div className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id="parking"
            checked={filters.hasParking || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasParking", checked === true)
            }
            className="h-5 w-5"
          />
          <Label htmlFor="parking" className="cursor-pointer text-base flex-1">
            주차 가능
          </Label>
        </div>

        <div className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id="shower"
            checked={filters.hasShower || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasShower", checked === true)
            }
            className="h-5 w-5"
          />
          <Label htmlFor="shower" className="cursor-pointer text-base flex-1">
            샤워실
          </Label>
        </div>

        <div className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id="pt-coach"
            checked={filters.hasPtCoach || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasPtCoach", checked === true)
            }
            className="h-5 w-5"
          />
          <Label htmlFor="pt-coach" className="cursor-pointer text-base flex-1">
            PT/재활코치
          </Label>
        </div>
      </div>
    </div>
  )
}

