import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@user/hooks/useAuth";
import { Button } from "@user/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@user/components/ui/field";
import { Input } from "@user/components/ui/input";
import type { ProfileUpdatePayload } from "@user/types/auth";

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileUpdatePayload | null>(null);

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

  function onSubmit(data: ProfileUpdatePayload) {
    setPendingData(data);
    setShowConfirm(true);
  }

  async function handleConfirm() {
    if (!pendingData) return;
    setError(null);
    setSuccess(false);
    setShowConfirm(false);
    try {
      await updateProfile(pendingData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPendingData(null);
    }
  }

  if (!user) return null;

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup className="gap-5">
          <Controller
            name="name"
            control={form.control}
            rules={{ required: "Name is required" }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</FieldLabel>
                <Input {...field} id="name" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
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
                <FieldLabel htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</FieldLabel>
                <Input {...field} id="email" type="email" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
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
                <FieldLabel htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</FieldLabel>
                <Input {...field} id="phone" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        {success && (
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-center">
            <p className="text-sm font-semibold text-brand-dark">Profile updated successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
            Save Changes
          </Button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="mb-2 text-xl font-bold text-gray-900 text-center">Confirm Update</h3>
            <p className="mb-6 text-sm text-gray-500 text-center">
              Are you sure you want to update your profile details?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-brand text-white shadow-md hover:bg-brand-dark hover:shadow-lg transition-all"
                onClick={handleConfirm}
              >
                Yes, Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
