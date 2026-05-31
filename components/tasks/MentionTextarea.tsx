// src/components/tasks/MentionTextarea.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/use-users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
}: MentionTextareaProps) {
  const { users } = useUsers();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Detect whether the current cursor position is after an @ mention
  function getMentionQuery(text: string): string | null {
    const match = /@(\w*)$/.exec(text);
    if (match) return match[1];
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    const query = getMentionQuery(newValue);
    if (query !== null) {
      setMentionQuery(query);
      setDropdownOpen(true);
      setActiveIndex(0);
    } else {
      setMentionQuery(null);
      setDropdownOpen(false);
    }
  }

  const filteredUsers = (users ?? [])
    .filter((u) =>
      mentionQuery === ""
        ? true
        : u.name.toLowerCase().includes((mentionQuery ?? "").toLowerCase())
    )
    .slice(0, 5);

  function selectUser(name: string) {
    // Replace the trailing @query with @FullName followed by a space
    const newValue = value.replace(/@(\w*)$/, `@${name} `);
    onChange(newValue);
    setDropdownOpen(false);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!dropdownOpen || filteredUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filteredUsers.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filteredUsers.length) % filteredUsers.length);
    } else if (e.key === "Enter" && dropdownOpen) {
      e.preventDefault();
      selectUser(filteredUsers[activeIndex].name);
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setMentionQuery(null);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setMentionQuery(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />

      {dropdownOpen && filteredUsers.length > 0 && (
        <div className="absolute z-50 left-0 top-full mt-1 w-64 rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul className="py-1">
            {filteredUsers.map((user, idx) => (
              <li key={user._id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent textarea blur
                    selectUser(user.name);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    idx === activeIndex && "bg-accent text-accent-foreground"
                  )}
                >
                  <Avatar className="h-6 w-6 border">
                    <AvatarImage src={user.photoUrl} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
