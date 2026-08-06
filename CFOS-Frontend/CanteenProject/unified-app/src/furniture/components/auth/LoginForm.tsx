import { useState } from "react";
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

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rollNumber: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setError(null);
    try {
      const user = await login(data);
      // Redirect based on role
      if (user.role === "superadmin") {
        window.location.href = "/superadmin";
      } else if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        // Regular user stays in furniture
        const from = (location.state as { from?: string } | null)?.from ?? "/furniture";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
                Roll Number
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
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="off"
                className="h-11 border-none bg-brand-light text-slate-800 focus-visible:ring-1 focus-visible:ring-brand"
              />
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
