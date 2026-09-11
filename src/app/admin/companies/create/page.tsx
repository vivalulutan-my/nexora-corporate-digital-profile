import { createCompany } from "@/app/admin/actions";

export default function CreateCompanyPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Create Company
      </h1>

      <form
        action={createCompany}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <Field label="Company Name">
          <input
            name="companyName"
            required
            className="input"
          />
        </Field>
        <Field label="Website">
          <input name="website" required className="input" />
        </Field>
        <Field label="License Number / Employee Headcount">
          <input name="licenseNo" className="input" placeholder="e.g. 10" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" name="startDate" className="input" />
          </Field>
          <Field label="End Date">
            <input type="date" name="endDate" className="input" />
          </Field>
        </div>
        <Field label="Logo">
          <input type="file" name="logo" accept="image/*" className="input" />
        </Field>
        <Field label="Background">
          <input
            type="file"
            name="background"
            accept="image/*"
            className="input"
          />
        </Field>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Create Company
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}
