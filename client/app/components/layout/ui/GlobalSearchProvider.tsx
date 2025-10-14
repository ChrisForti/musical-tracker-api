import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface GlobalSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: {
    musicals: any[];
    actors: any[];
    theaters: any[];
    performances: any[];
  };
  setSearchResults: (results: any) => void;
  isSearchActive: boolean;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(
  undefined
);

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    musicals: [],
    actors: [],
    theaters: [],
    performances: [],
  });

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <GlobalSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        isSearchActive,
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalSearch must be used within a GlobalSearchProvider"
    );
  }
  return context;
}
