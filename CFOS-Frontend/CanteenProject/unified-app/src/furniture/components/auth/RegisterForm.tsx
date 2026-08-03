import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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

const signupSchema = z
  .object({
    rollNumber: z
      .string()
      .min(1, { message: "Roll Number required." })
      .regex(/^\d{4}-[a-zA-Z0-9]+-[a-zA-Z0-9]+-\d+$/, {
        message: "Roll Number format is invalid. (Example - 2019-mit-cse-001)",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be 8 digits long" })
      .max(20, { message: "Password mustn't above 20 digits" })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message:
          "Password must contain at least one English letter and one number",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please re-enter the Confirm Password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      rollNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    setError(null);
    try {
      await register({
        rollNumber: data.rollNumber,
        password: data.password,
      });
      navigate("/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col gap-4 p-4",
        className,
      )}
      {...props}
    >
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-1 text-3xl">🍏</div>
          <h1 className="text-3xl font-bold text-slate-800">Signup</h1>
          <p className="text-xs font-medium text-muted-foreground">
            Hungry? Let&apos;s get you set up. 🍔
          </p>
        </div>

        <Controller
          name="rollNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="rollNumber"
                className="font-semibold text-slate-700"
              >
                Roll Number
              </FieldLabel>
              <Input
                {...field}
                id="rollNumber"
                type="text"
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
              <FieldLabel
                htmlFor="password"
                className="font-semibold text-slate-700"
              >
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

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="confirmPassword"
                className="font-semibold text-slate-700"
              >
                Confirm Password
              </FieldLabel>
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
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
            {form.formState.isSubmitting ? "CREATING..." : "CREATE ACCOUNT"}
          </Button>
          <FieldDescription className="mt-3 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-700 underline"
            >
              Log in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
