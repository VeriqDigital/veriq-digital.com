"use client";

import { useEffect, useId, useRef, useState } from "react";

const budgetOptions = [
  { value: "under-2000", label: "Under $2,000" },
  { value: "2000-5000", label: "$2,000 – $5,000" },
  { value: "5000-10000", label: "$5,000 – $10,000" },
  { value: "10000-plus", label: "$10,000+" },
] as const;

const BudgetSelect = () => {
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  const openListbox = () => {
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    setSelectedIndex(index);
    setHighlightedIndex(index);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openListbox();
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      setHighlightedIndex(
        (highlightedIndex + direction + budgetOptions.length) %
          budgetOptions.length,
      );
      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setHighlightedIndex(budgetOptions.length - 1);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      selectOption(highlightedIndex);
    }
  };

  return (
    <div ref={wrapperRef} className="relative mt-2 font-sans">
      <input
        type="hidden"
        name="topic"
        value={selectedIndex >= 0 ? budgetOptions[selectedIndex].value : ""}
      />
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-labelledby="budget-label"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen ? `${listboxId}-option-${highlightedIndex}` : undefined
        }
        onClick={() => (isOpen ? setIsOpen(false) : openListbox())}
        onKeyDown={handleKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border bg-black/35 px-3 py-2 text-left text-sm font-medium outline-none transition ${
          isOpen
            ? "border-(--primary) shadow-[0_0_0_3px_rgba(78,242,242,0.12)]"
            : "border-white/10 hover:border-white/25"
        }`}
      >
        <span className={selectedIndex >= 0 ? "text-white" : "text-white/65"}>
          {selectedIndex >= 0
            ? budgetOptions[selectedIndex].label
            : "Choose a range"}
        </span>
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2 w-3 shrink-0 text-(--primary) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="m1 1.25 5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Budget range"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-md border border-white/12 bg-[#181a1c]/98 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.48)] backdrop-blur-xl"
        >
          {budgetOptions.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isHighlighted = highlightedIndex === index;

            return (
              <li
                id={`${listboxId}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setHighlightedIndex(index)}
                onClick={() => selectOption(index)}
                className={`flex cursor-pointer items-center justify-between rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  isHighlighted
                    ? "bg-(--primary) text-black"
                    : "text-white/78 hover:text-white"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <span className="text-xs font-black" aria-hidden="true">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BudgetSelect;
