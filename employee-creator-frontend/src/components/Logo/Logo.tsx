import classes from "./Logo.module.scss";

interface LogoProps {
  tone?: "light" | "dark";
  className?: string;
}

export default function Logo({ tone = "dark", className }: LogoProps) {
  const toneClass = tone === "light" ? classes.light : classes.dark;
  return (
    <span className={`${classes.logo} ${toneClass} ${className ?? ""}`.trim()}>
      <svg
        className={classes.mark}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle className={classes.markMain} cx="9" cy="15" r="6.5" />
        <circle className={classes.markAccent} cx="17" cy="8" r="3.5" />
      </svg>
      <span className={classes.word}>
        <span className={classes.wordSpring}>Spring</span>
        <span className={classes.wordStaff}>Staff</span>
      </span>
    </span>
  );
}
