import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import classes from "./NotFoundPage.module.scss";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className={classes.page}>
      <div className={classes.inner}>
        <Logo className={classes.logo} />
        <p className={classes.code}>404</p>
        <h1 className={classes.title}>
          Page <em>not found</em>
        </h1>
        <p className={classes.message}>
          We couldn&apos;t find the page you were looking for. It may have been
          moved, or the link might be broken.
        </p>
        <Button className={classes.home} onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    </main>
  );
}
