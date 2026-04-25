import React, { useState } from "react";

interface Props {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export const SearchSection = React.memo(({ onSearch, isLoading }: Props) => {
  const [localTerm, setLocalTerm] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch(localTerm);
  };

  return (
    <div className="relative mb-12">
      <input
        type="text"
        className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500 transition-all shadow-inner"
        placeholder="종목명 또는 코드 입력"
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => onSearch(localTerm)}
        disabled={isLoading || !localTerm.trim()}
        className="absolute right-3 top-3 bottom-3 bg-blue-500 hover:bg-blue-400 px-8 rounded-xl font-black transition-all disabled:opacity-50"
      >
        {isLoading ? "..." : "SEARCH"}
      </button>
    </div>
  );
});

SearchSection.displayName = "SearchSection";
