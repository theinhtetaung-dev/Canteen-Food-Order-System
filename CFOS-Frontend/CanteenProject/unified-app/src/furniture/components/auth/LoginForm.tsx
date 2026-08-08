import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as z from "zod";
import { cn } from "@furniture/lib/utils";
import { Button } from "@furniture/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@furniture/components/ui/field";
import { Input } from "@furniture/components/ui/input";
import { useAuth } from "@furniture/hooks/useAuth";

const loginSchema = z.object({
  rollNumber: z
    .string()
    .min(1, { message: "Roll Number or Username is required." }),
  password: z
    .string()
    .min(1, { message: "Password is required." }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rollNumber: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setError(null);
    try {
      const user = await login(data);
      // Redirect based on role
      if (user.role === "admin" || user.role === "superadmin") {
        window.location.href = "/admin"; // Platform admin / SuperAdmin
      } else if (user.role === "manager") {
        window.location.href = "/superadmin"; // Kitchen/Canteen manager
      } else {
        // Regular user stays in furniture
        const from = (location.state as { from?: string } | null)?.from ?? "/furniture";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError("Username or password is incorrect");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("mx-auto flex w-full max-w-sm flex-col gap-4 p-4", className)}
      {...props}
    >
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-1 text-3xl">🍏</div>
          <h1 className="text-3xl font-bold text-slate-800">Login</h1>
          <p className="text-xs font-medium text-muted-foreground">
            Hungry? We&apos;ve got you covered. 🍔
          </p>
        </div>

        <Controller
          name="rollNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="rollNumber" className="font-semibold text-slate-700">
                Username (or) Roll Number
              </FieldLabel>
              <Input
                {...field}
                id="rollNumber"
                placeholder="e.g. 2019-mit-cse-001"
                autoComplete="off"
                className="h-11 border-none bg-brand-light text-slate-800 focus-visible:ring-1 focus-visible:ring-brand"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="font-semibold text-slate-700">
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="off"
                  className="h-11 border-none bg-brand-light text-slate-800 pr-10 focus-visible:ring-1 focus-visible:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <Field className="mt-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 rounded-full bg-brand font-bold text-white shadow-md transition-colors hover:bg-brand-dark"
          >
            {form.formState.isSubmitting ? "LOGGING IN..." : "LOGIN"}
          </Button>
          <FieldDescription className="mt-3 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/furniture/register" className="font-semibold text-slate-700 underline">
              Sign Up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
