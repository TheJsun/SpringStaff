import { useDropdownPanel } from "../../hooks/useDropdownPanel";
import classes from "./FilterDropdown.module.scss";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  allLabel: string;
  allCount?: number;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function FilterDropdown({
  label,
  allLabel,
  allCount,
  options,
  value,
  onChange,
  disabled = false,
}: FilterDropdownProps) {
  const { isOpen, setIsOpen, containerRef, triggerRef, panelRef, panelStyle } =
    useDropdownPanel();

  const selected = options.find((option) => option.value === value);

  const rows: FilterOption[] = [
    { value: "", label: allLabel, count: allCount },
    ...options,
  ];

  return (
    <div className={classes.container} ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={classes.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selected ? `${label}: ${selected.label}` : label}
        disabled={disabled}
      >
        {selected ? selected.label : label}
        <svg
          className={classes.chevron}
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={classes.panel}
          ref={panelRef}
          style={panelStyle}
          role="listbox"
          aria-label={label}
        >
          {rows.map((option) => (
            <button
              key={option.value === "" ? "__all" : option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={
                option.value === value
                  ? `${classes.option} ${classes.optionSelected}`
                  : classes.option
              }
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className={classes.optionCount}>{option.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
