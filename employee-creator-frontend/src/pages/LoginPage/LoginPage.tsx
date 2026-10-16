import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import classes from "./LoginPage.module.scss";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailPattern, "Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function MailIcon() {
  return (
    <svg
      className={classes.inputIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className={classes.inputIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function LoginPage() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (loading) return null; //add skeleton loading form eventually

  async function onSubmit(data: LoginForm) {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <aside className={classes.art} aria-hidden="true">
          <img className={classes.artImg} src="/login-art-clean.png" alt="" />
          <span className={classes.artEllipse} />
          <img className={classes.artFlowers} src="/login-flowers.png" alt="" />

          <Logo tone="light" className={classes.artLogo} />

          <h2 className={classes.headlineDesktop}>
            Better people.
            <br />
            <span className={classes.headlineAccent}>Stronger teams.</span>
          </h2>
          <h2 className={classes.headlineMobile}>
            Everyone on your team, in one place.
          </h2>
        </aside>

        <main className={classes.formSide}>
          <div className={classes.formInner}>
            <h1 className={classes.title}>
              Sign <em>in</em>
            </h1>

            <form
              className={classes.form}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className={classes.field}>
                <label className={classes.label} htmlFor="email">
                  Email
                </label>
                <div className={classes.inputWrap}>
                  <MailIcon />
                  <input
                    className={`${classes.input} ${errors.email ? classes.inputInvalid : ""}`.trim()}
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="username"
                    aria-invalid={errors.email ? "true" : undefined}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className={classes.fieldError}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="password">
                  Password
                </label>
                <div className={classes.inputWrap}>
                  <LockIcon />
                  <input
                    className={`${classes.input} ${classes.inputPassword} ${errors.password ? classes.inputInvalid : ""}`.trim()}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? "true" : undefined}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
                  />
                  <button
                    className={classes.toggle}
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className={classes.fieldError}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <p className={classes.serverError} role="alert">
                  {error}
                </p>
              )}

              <Button
                className={classes.submit}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
