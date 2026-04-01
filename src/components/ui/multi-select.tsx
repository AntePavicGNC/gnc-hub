"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  value: string
  label: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Auswählen...",
  className,
}: {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  function toggleValue(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
          selected.length > 0 && "text-foreground",
          className
        )}
      >
        {selected.length === 0 ? (
          <span>{placeholder}</span>
        ) : selected.length <= 2 ? (
          <div className="flex items-center gap-1">
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val)
              return (
                <Badge key={val} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {opt?.label ?? val}
                </Badge>
              )
            })}
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {selected.length} ausgewählt
          </Badge>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Suchen..." />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => toggleValue(option.value)}
                    data-checked={isSelected || undefined}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-[4px] border border-input",
                        isSelected && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {isSelected && <CheckIcon className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
