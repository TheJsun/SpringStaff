import classes from "./Tabs.module.scss";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange?: (id: string) => void;
}

export function Tabs({ tabs, activeTabId, onTabChange }: TabsProps) {
  return (
    <div className={classes.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTabId}
          disabled={tab.disabled}
          onClick={() => onTabChange?.(tab.id)}
          className={[
            classes.tab,
            tab.id === activeTabId ? classes.active : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
