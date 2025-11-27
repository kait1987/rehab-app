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
        <h3 className="font-semibold">필터</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="quiet"
            checked={filters.isQuiet || false}
            onCheckedChange={(checked) =>
              handleFilterChange("isQuiet", checked === true)
            }
          />
          <Label htmlFor="quiet" className="cursor-pointer">
            조용한 곳
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rehab-equipment"
            checked={filters.hasRehabEquipment || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasRehabEquipment", checked === true)
            }
          />
          <Label htmlFor="rehab-equipment" className="cursor-pointer">
            재활기구 있음
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="parking"
            checked={filters.hasParking || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasParking", checked === true)
            }
          />
          <Label htmlFor="parking" className="cursor-pointer">
            주차 가능
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="shower"
            checked={filters.hasShower || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasShower", checked === true)
            }
          />
          <Label htmlFor="shower" className="cursor-pointer">
            샤워실
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pt-coach"
            checked={filters.hasPtCoach || false}
            onCheckedChange={(checked) =>
              handleFilterChange("hasPtCoach", checked === true)
            }
          />
          <Label htmlFor="pt-coach" className="cursor-pointer">
            PT/재활코치
          </Label>
        </div>
      </div>
    </div>
  )
}

