import { createPatient } from "../actions";

const errors: Record<string, string> = {
  invalid: "الاسم أو رقم التليفون غير صحيح (لازم يبدأ بـ 01 ويتكون من 11 رقم)",
  duplicate: "رقم التليفون ده مسجل قبل كده",
};

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">إضافة مريض</h1>

      {error && errors[error] && (
        <p className="rounded bg-red-100 p-3 text-red-700">{errors[error]}</p>
      )}

      <form action={createPatient} className="space-y-4 rounded bg-white p-6">
        <input name="fullName" required placeholder="الاسم الكامل" className="w-full rounded border p-2" />
        <input name="phone" required placeholder="01XXXXXXXXX" dir="ltr" className="w-full rounded border p-2" />
        <input name="birthDate" type="date" className="w-full rounded border p-2" />
        <input name="allergies" placeholder="الحساسية (لو فيه)" className="w-full rounded border p-2" />
        <textarea name="notes" placeholder="ملاحظات" className="w-full rounded border p-2" />
        <button className="rounded bg-blue-600 px-6 py-2 text-white">حفظ</button>
      </form>
    </div>
  );
}
