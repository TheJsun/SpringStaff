import classes from "./Logo.module.scss";

interface LogoProps {
  tone?: "light" | "dark";
  className?: string;
}

export default function Logo({ tone = "dark", className }: LogoProps) {
  const toneClass = tone === "light" ? classes.light : classes.dark;
  return (
    <span className={`${classes.logo} ${toneClass} ${className ?? ""}`.trim()}>
      <img
        src="/flower-mark.png"
        alt=""
        aria-hidden="true"
        className={classes.mark}
      />
      <span className={classes.word}>
        <span className={classes.wordSpring}>Spring</span>
        <span className={classes.wordStaff}>Staff</span>
      </span>
    </span>
  );
}
