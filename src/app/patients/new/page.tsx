import { createPatient } from "../actions";
import { BTN, Card, INPUT, Notice, PageHeader } from "@/components/ui";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="إضافة مريض" subtitle="سجّل بيانات المريض الأساسية" />

      {error && errors[error] && <Notice>{errors[error]}</Notice>}

      <Card>
        <form action={createPatient} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-600">الاسم الكامل</label>
            <input name="fullName" required className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">رقم التليفون</label>
            <input name="phone" required placeholder="01XXXXXXXXX" dir="ltr" className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">تاريخ الميلاد</label>
            <input name="birthDate" type="date" className={INPUT} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-600">الحساسية</label>
            <input name="allergies" placeholder="مثال: بنسيلين" className={INPUT} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-600">ملاحظات</label>
            <textarea name="notes" rows={3} className={INPUT} />
          </div>
          <div className="md:col-span-2">
            <button className={BTN}>حفظ المريض</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
