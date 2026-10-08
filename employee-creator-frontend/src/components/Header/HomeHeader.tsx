import { Skeleton } from "../Skeleton/Skeleton";
import classes from "./HomeHeader.module.scss";

interface HomeHeaderProps {
  title: string;
  action?: React.ReactNode;
  count: number;
  // Pluralisation stays the caller's job, which keeps this component dumb.
  countLabel?: string;
  isLoading: boolean;
}

export default function HomeHeader({
  title,
  action,
  count,
  countLabel = "employees",
  isLoading,
}: HomeHeaderProps) {
  return (
    <header className={classes.header}>
      <div className={classes.headerContent}>
        <div className={classes.left}>
          <h1 className={classes.header__title}>{title}</h1>
          {isLoading ? (
            <Skeleton width="6em" height="1em" />
          ) : (
            <p className={classes.employeeCount}>
              {count} {countLabel}
            </p>
          )}
        </div>
        <div className={classes.action}>{action}</div>
      </div>
    </header>
  );
}
