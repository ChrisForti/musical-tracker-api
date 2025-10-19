import React, { createContext, useContext, useState } from "react";

export type SectionType =
  | "home"
  | "browse"
  | "musicals"
  | "actors"
  | "theaters"
  | "performances"
  | "calendar"
  | "admin"
  | "pending"
  | "analytics"
  | "scheduling"
  | "notifications"
  | "import-export"
  | "users";

const NavigationContext = createContext<
  | {
      activeSection: SectionType;
      setActiveSection: (section: SectionType) => void;
    }
  | undefined
>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context)
    throw new Error("useNavigation must be used within NavigationProvider");
  return context;
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState<SectionType>("home");

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
}
