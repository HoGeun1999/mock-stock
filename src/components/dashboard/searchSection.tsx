import React, { useState } from "react";
import { useStockSearch } from "@/hooks/useStockSearch";

interface Props {
  onSearch: (code: string, name: string) => void;
  isLoading: boolean;
}

export const SearchSection = React.memo(({ onSearch, isLoading }: Props) => {
  const [localTerm, setLocalTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, isSearching } = useStockSearch(localTerm);

  const handleSelect = (code: string, name: string) => {
    onSearch(code, name);
    setLocalTerm("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative mb-12">
      <div className="relative z-20">
        <input
          type="text"
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500 transition-all shadow-inner text-white"
          placeholder="종목명 또는 코드 입력 (2글자 이상)"
          value={localTerm}
          onChange={(e) => {
            setLocalTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {/* 우측 검색 버튼: 첫 번째 제안이 있으면 해당 종목으로 검색 */}
        <button
          onClick={() =>
            suggestions.length > 0 &&
            handleSelect(suggestions[0].code, suggestions[0].name)
          }
          disabled={isLoading || isSearching || !localTerm.trim()}
          className="absolute right-3 top-3 bottom-3 bg-blue-500 hover:bg-blue-400 px-8 rounded-xl font-black transition-all disabled:opacity-50 text-white"
        >
          {isLoading || isSearching ? "..." : "SEARCH"}
        </button>
      </div>

      {/* 자동완성 제안 목록 UI */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10">
          {suggestions.map((s) => (
            <button
              key={s.code}
              onClick={() => handleSelect(s.code, s.name)}
              className="w-full px-6 py-4 text-left hover:bg-slate-800 flex justify-between items-center border-b border-slate-800 last:border-none transition-colors"
            >
              <span className="font-bold text-white">{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 바깥 클릭 시 닫기 레이어 */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
});

SearchSection.displayName = "SearchSection";
