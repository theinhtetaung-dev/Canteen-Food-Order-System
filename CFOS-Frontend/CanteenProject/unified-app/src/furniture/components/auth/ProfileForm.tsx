import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@furniture/hooks/useAuth";
import { Button } from "@furniture/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@furniture/components/ui/field";
import { Input } from "@furniture/components/ui/input";
import type { ProfileUpdatePayload } from "@furniture/types/auth";

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileUpdatePayload>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileUpdatePayload) {
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl bg-brand-light/30 px-4 py-3 text-sm text-gray-600">
        Roll Number:{" "}
        <span className="font-semibold text-gray-800">{user.rollNumber}</span>
      </div>

      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          rules={{ required: "Name is required" }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input {...field} id="name" className="bg-brand-light/40" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          rules={{ required: "Email is required" }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input {...field} id="email" type="email" className="bg-brand-light/40" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          rules={{ required: "Phone is required" }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input {...field} id="phone" className="bg-brand-light/40" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {success && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">
          Profile updated successfully!
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" className="rounded-xl bg-brand hover:bg-brand-dark">
        Save Changes
      </Button>
    </form>
  );
}
