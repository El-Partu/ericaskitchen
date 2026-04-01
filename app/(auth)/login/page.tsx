// 📁 app/(auth)/login/page.tsx

"use client";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(384);

  useEffect(() => {
    const update = () => {
      if (googleContainerRef.current) {
        setGoogleWidth(googleContainerRef.current.offsetWidth);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getDefaultRedirect = (roleName?: string) => {
    if (!roleName || roleName === "customer") return "/menu";
    return "/admin";
  };

  const getRedirectTarget = (roleName?: string) => {
    if (
      redirectTo &&
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//")
    ) {
      return redirectTo;
    }
    return getDefaultRedirect(roleName);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const loggedInUser = await login(values);
      toast.success("Welcome back!");
      router.push(getRedirectTarget(loggedInUser.role?.name));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 423) {
          toast.error("Account locked. Check your email for instructions.");
        } else {
          toast.error(error.message ?? "Invalid email or password.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async (credential?: string) => {
    if (!credential) {
      toast.error("Google sign-in failed.");
      return;
    }

    setGoogleLoading(true);
    try {
      const loggedInUser = await googleLogin(credential);
      toast.success("Welcome back!");
      router.push(getRedirectTarget(loggedInUser.role?.name));
    } catch (error) {
      const msg =
        error instanceof ApiError ? error.message : "Google sign-in failed.";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = isSubmitting || googleLoading;

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="rounded-[24px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
      >
        {/* ── Heading ── */}
        <div className="mb-7 text-center">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
            Welcome back
          </p>
          <h1 className="mt-1 font-heading text-[26px] font-black text-foreground">
            Sign in
          </h1>
          <p className="mt-1 font-body text-[14px] text-foreground/50">
            to your Erica&apos;s Kitchen account
          </p>
        </div>

        {/* ── Google button ── */}
        <div
          ref={googleContainerRef}
          className={isLoading ? "pointer-events-none opacity-50" : undefined}
        >
          <GoogleLogin
            onSuccess={(credentialResponse) =>
              handleGoogleLogin(credentialResponse.credential)
            }
            onError={() => toast.error("Google sign-in was cancelled.")}
            text="continue_with"
            shape="pill"
            size="large"
            width={String(googleWidth)}
          />
        </div>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/[0.07]" />
          <span className="font-body text-[12px] font-semibold uppercase tracking-widest text-foreground/35">
            or
          </span>
          <div className="h-px flex-1 bg-black/[0.07]" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block font-body text-[13px] font-semibold text-foreground/70">
              Email address
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full rounded-[12px] border border-black/[0.10] bg-[#f5f0eb] px-4 py-3 font-body text-[14px] text-foreground placeholder:text-foreground/35 transition-all duration-200 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            {errors.email && (
              <p className="mt-1.5 font-body text-[12px] text-primary-red">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-body text-[13px] font-semibold text-foreground/70">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-body text-[12px] text-primary transition-opacity hover:opacity-75"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full rounded-[12px] border border-black/[0.10] bg-[#f5f0eb] px-4 py-3 pr-11 font-body text-[14px] text-foreground placeholder:text-foreground/35 transition-all duration-200 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition-colors hover:text-foreground/70"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 font-body text-[12px] text-primary-red">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex w-full items-center justify-center rounded-full bg-primary py-3 font-body text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all duration-200 hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.40)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* ── Sign up link ── */}
        <p className="mt-6 text-center font-body text-[13px] text-foreground/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary transition-opacity hover:opacity-75"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
