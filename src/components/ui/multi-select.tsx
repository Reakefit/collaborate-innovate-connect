
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export type Option = {
  value: string;
  label: string;
};

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelected?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  maxSelected,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>(() => {
    return options.filter((option) => value.includes(option.value));
  });
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    setSelected(options.filter((option) => value.includes(option.value)));
  }, [value, options]);

  const handleSelect = (option: Option) => {
    if (maxSelected && selected.length >= maxSelected) {
      return;
    }
    
    const isSelected = selected.find((item) => item.value === option.value);
    const newSelected = isSelected
      ? selected.filter((item) => item.value !== option.value)
      : [...selected, option];
    
    setSelected(newSelected);
    onChange(newSelected.map((item) => item.value));
    setInputValue("");
  };

  const handleRemove = (option: Option) => {
    setSelected(selected.filter((item) => item.value !== option.value));
    onChange(selected.filter((item) => item.value !== option.value).map((item) => item.value));
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="border border-input px-3 py-2 rounded-md flex flex-wrap gap-1 min-h-10 cursor-text"
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        {selected.map((option) => (
          <Badge key={option.value} variant="secondary" className="mr-1 mb-1">
            {option.label}
            <button
              type="button"
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => handleRemove(option)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {option.label}</span>
            </button>
          </Badge>
        ))}

        <CommandPrimitive onKeyDown={(e) => {
          if (e.key === "Backspace" && !inputValue && selected.length > 0) {
            e.preventDefault();
            handleRemove(selected[selected.length - 1]);
          }
        }}>
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="border-0 p-0 flex-1 min-w-[80px] outline-none bg-transparent"
          />
        </CommandPrimitive>
      </div>

      <div className="relative">
        <Command className={`absolute z-50 top-1 w-full rounded-md border border-input bg-popover shadow-md ${open ? "" : "hidden"}`}>
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option)}
              >
                <div className="flex items-center">
                  <span>{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </div>
    </div>
  );
}
