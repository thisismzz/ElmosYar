import React, { useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import Calendar from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

import { Button, InlineError, Input, Label, Select, HelperText, cn } from "../ui";
// import { FoodItem } from "../../../types/food_posts"; // adjust path
// import { createPost } from "../../../services/PostService"; // if you want to submit via backend

type MealType = "ناهار" | "شام";
type LocationType = "مرکزی" | "یاس" | "مقتدایی" | "خوابگاه خواهران" | "خوابگاه برادران";

type FoodFormState = {
	name: string;
	price: string;
	mealType: MealType;
	location: LocationType;
};

function formatPersianDate(date: DateObject): string {
	const year = date.year;
	const month = String(date.month).padStart(2, "0");
	const day = String(date.day).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

const todayPersian = () =>
  new DateObject({
    date: new Date(),
    calendar: persian,
    locale: persian_fa,
  });

export function CreateFoodPostForm(props: {
	onSubmit?: (payload: {
		name: string;
		price: number;
		mealType: MealType;
		location: LocationType;
		date: string;
	}) => Promise<void> | void;
}) {
	const calendarRef = useRef<any>(null);

	const [selectedDate, setSelectedDate] = useState<DateObject>(() => todayPersian());
	const [form, setForm] = useState<FoodFormState>({
		name: "",
		price: "",
		mealType: "ناهار",
		location: "مرکزی",
	});

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	const locations: LocationType[] = useMemo(
		() => ["مرکزی", "یاس", "مقتدایی", "خوابگاه خواهران", "خوابگاه برادران"],
		[]
	);
	const mealTypes: MealType[] = useMemo(() => ["ناهار", "شام"], []);

	const openCalendar = () => {
		if (calendarRef.current?.openCalendar) calendarRef.current.openCalendar();
	};

	const isValid = () => {
		const nameOk = form.name.trim().length > 0;
		const priceNumber = Number(form.price);
		const priceOk = Number.isFinite(priceNumber) && priceNumber > 0;
		return nameOk && priceOk && !!selectedDate;
	};

	const handleSubmit: React.FormEventHandler = async (e) => {
		e.preventDefault();
		setError(undefined);

		if (!isValid()) {
			setError("لطفاً نام غذا و قیمت معتبر و تاریخ را وارد کنید.");
			return;
		}

		const payload = {
			name: form.name.trim(),
			price: Number(form.price),
			mealType: form.mealType,
			location: form.location,
			date: formatPersianDate(selectedDate),
		};

		try {
			setSubmitting(true);
			await props.onSubmit?.(payload);

			// If you want to wire to your backend yourself, do it here.
			// Example: createPost(payload.name, "food-exchange", "idk", payload)

			setForm({ name: "", price: "", mealType: "ناهار", location: "مرکزی" });
			setSelectedDate(todayPersian());
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطایی در ثبت پست رخ داد.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="food-name">نام غذا</Label>
					<Input
						id="food-name"
						value={form.name}
						onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
						placeholder="مثال: چلو کباب"
						disabled={submitting}
					/>
				</div>

				<div>
					<Label htmlFor="food-price">قیمت (تومان)</Label>
					<Input
						id="food-price"
						inputMode="numeric"
						value={form.price}
						onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
						placeholder="مثال: 35000"
						disabled={submitting}
					/>
				</div>

				<div>
					<Label htmlFor="food-meal">وعده غذایی</Label>
					<Select
						id="food-meal"
						value={form.mealType}
						onChange={(e) => setForm((p) => ({ ...p, mealType: e.target.value as MealType }))}
						disabled={submitting}
					>
						{mealTypes.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</Select>
				</div>

				<div>
					<Label htmlFor="food-location">سلف</Label>
					<Select
						id="food-location"
						value={form.location}
						onChange={(e) => setForm((p) => ({ ...p, location: e.target.value as LocationType }))}
						disabled={submitting}
					>
						{locations.map((loc) => (
							<option key={loc} value={loc}>
								{loc}
							</option>
						))}
					</Select>
				</div>
			</div>

			<div>
				<Label>تاریخ</Label>

				<div className="flex flex-col gap-2">
					<button
						type="button"
						onClick={openCalendar}
						className={cn(
							"flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-right",
							"transition hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-[#16519F]/15 focus:border-[#16519F]/35"
						)}
						disabled={submitting}
					>
						<div className="min-w-0">
							<div className="text-sm font-semibold text-neutral-700">
								{selectedDate ? selectedDate.format("dddd، D MMMM YYYY") : "برای انتخاب تاریخ کلیک کنید"}
							</div>
							<div className="mt-1 text-xs text-neutral-500">
								{selectedDate ? formatPersianDate(selectedDate) : ""}
							</div>
						</div>
						<Button
							type="button"
							onClick={() => setSelectedDate(todayPersian())}
							disabled={submitting}
							className="h-9 px-3"
						>
							امروز
						</Button>
					</button>

					<div className="flex items-center justify-between">

					</div>

					{/* calendar hidden input – we open it programmatically */}
					<Calendar
						ref={calendarRef}
						value={selectedDate}
						onChange={(d: any) => setSelectedDate(d as DateObject)}
						calendar={persian}
						locale={persian_fa}
						weekStartDayIndex={6}
						shadow={false}
						arrow={false}
						editable={false}
						format="YYYY/MM/DD"
						style={{ display: "none" }}
					/>
				</div>
			</div>

			<InlineError>{error}</InlineError>

			<div className="flex items-center justify-end gap-3 pt-2">
				<Button
					type="submit"
					disabled={submitting || !isValid()}
					className="h-11"
				>
					{submitting ? (
						<>
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
							در حال ثبت...
						</>
					) : (
						"ثبت پست غذا"
					)}
				</Button>
			</div>
		</form>
	);
}
