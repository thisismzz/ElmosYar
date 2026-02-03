import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardBody, InlineError, Input, Label, Select, Textarea } from "../../../components/UIOverrides";
import { StarRating } from "../../../components/Reviews/StarRating";
import { createPost } from "../../../services/PostService";

const faculties = ["علوم کامپیوتر", "مهندسی نساجی"] as const;

type RatingKey = "teaching" | "grading" | "clarity" | "helpfulness" | "satisfaction";

const ratingCategories: Array<{ id: RatingKey; label: string }> = [
	{ id: "teaching", label: "کیفیت تدریس" },
	{ id: "grading", label: "نمره‌دهی عادلانه" },
	{ id: "clarity", label: "شفافیت جزوه" },
	{ id: "helpfulness", label: "پاسخ‌گویی به سوالات" },
	{ id: "satisfaction", label: "نظم و ثبات" },
];

// Accent
const ACCENT = "#16599f";

// Semester
type SeasonValue = "fall" | "winter" | "summer";
const SEASONS: Array<{ value: SeasonValue; labelFa: string }> = [
	{ value: "fall", labelFa: "پاییز" },
	{ value: "winter", labelFa: "زمستان" },
	{ value: "summer", labelFa: "تابستان" },
];

// You stated current Persian year is 1404.
const CURRENT_PERSIAN_YEAR = 1404;
const ALLOWED_YEARS = Array.from({ length: 4 }, (_, i) => String(CURRENT_PERSIAN_YEAR - i)); // 1404..1401

function toPersianDigits(input: string) {
	const map: Record<string, string> = {
		"0": "۰",
		"1": "۱",
		"2": "۲",
		"3": "۳",
		"4": "۴",
		"5": "۵",
		"6": "۶",
		"7": "۷",
		"8": "۸",
		"9": "۹",
	};
	return input.replace(/[0-9]/g, (d) => map[d] ?? d);
}

function makeSemesterCanonical(season: SeasonValue, year: string) {
	// store in English season + numeric year (string), as requested
	return `${season}-${year}`;
}

export function CreateProfessorReviewPostForm(props?: {
	isSubmitting?: boolean;
	onSubmitStart?: () => void;
	onSubmitSuccess?: () => void;
	onSubmitError?: () => void;
}) {
	const [formData, setFormData] = useState({
		professorName: "",
		faculty: "",
		courseName: "",
		semester: "", // canonical: "fall-1404"
		ratings: {
			teaching: 0,
			grading: 0,
			clarity: 0,
			helpfulness: 0,
			satisfaction: 0,
		} as Record<RatingKey, number>,
		overallRating: 0,
		comment: "",
	});

	const [semesterParts, setSemesterParts] = useState<{
		season: "" | SeasonValue;
		year: "" | string;
	}>({ season: "", year: "" });

	const submitting = props?.isSubmitting ?? false;
	const [error, setError] = useState<string | undefined>(undefined);

	const ratingsArray = useMemo(() => Object.values(formData.ratings), [formData.ratings]);
	const calculatedAvg = useMemo(
		() => (ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length) || 0,
		[ratingsArray]
	);

	const isFormValid = () => {
		return (
			formData.professorName.trim() &&
			formData.faculty &&
			formData.courseName.trim() &&
			formData.semester.trim() &&
			Object.values(formData.ratings).every((r) => r > 0) &&
			formData.overallRating > 0
		);
	};

	function syncSemester(season: "" | SeasonValue, year: "" | string) {
		setSemesterParts({ season, year });
		if (season && year) {
			setFormData((p) => ({ ...p, semester: makeSemesterCanonical(season, year) }));
		} else {
			// keep invalid/incomplete semester out of formData so validation blocks submit
			setFormData((p) => ({ ...p, semester: "" }));
		}
	}

	const handleSubmit: React.FormEventHandler = async (e) => {
		e.preventDefault();
		setError(undefined);

		if (!isFormValid()) {
			setError("لطفاً همه فیلدهای ضروری را تکمیل کنید.");
			return;
		}

		try {
			props?.onSubmitStart?.();

			await createPost("professor-review", {
				professorName: formData.professorName,
				faculty: formData.faculty,
				courseName: formData.courseName,
				semester: formData.semester, // e.g. fall-1404
				overallRating: formData.overallRating.toString(),
				ratingsTeaching: formData.ratings.teaching.toString(),
				ratingsGrading: formData.ratings.grading.toString(),
				ratingsClarity: formData.ratings.clarity.toString(),
				ratingsHelpfulness: formData.ratings.helpfulness.toString(),
				ratingsSatisfaction: formData.ratings.satisfaction.toString(),
				body: formData.comment,
			});

			// Navigate to professors page via parent callback
			props?.onSubmitSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطایی در ارسال نظر رخ داد.");
			props?.onSubmitError?.();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<Card className="overflow-hidden border border-neutral-200 bg-white/95 shadow-sm hover:shadow-md transition-shadow">
				<CardBody className="space-y-4">
					<div>
						<Label htmlFor="profName" className="text-neutral-700">
							نام استاد
						</Label>
						<Input
							id="profName"
							value={formData.professorName}
							onChange={(e) => setFormData((p) => ({ ...p, professorName: e.target.value }))}
							placeholder="مثال: اکبر عبدی"
							disabled={submitting}
							className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
							style={{ ["--accent" as any]: ACCENT }}
						/>
					</div>

					<div>
						<Label htmlFor="faculty" className="text-neutral-700">
							دانشکده
						</Label>
						<Select
							id="faculty"
							value={formData.faculty}
							onChange={(e) => setFormData((p) => ({ ...p, faculty: e.target.value }))}
							disabled={submitting}
							className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
							style={{ ["--accent" as any]: ACCENT }}
						>
							<option value="" disabled>
								انتخاب کنید
							</option>
							{faculties.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</Select>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="course" className="text-neutral-700">
								درس
							</Label>
							<Input
								id="course"
								value={formData.courseName}
								onChange={(e) => setFormData((p) => ({ ...p, courseName: e.target.value }))}
								placeholder="مثال: ساختمان داده"
								disabled={submitting}
								className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
								style={{ ["--accent" as any]: ACCENT }}
							/>
						</div>

						{/* Semester: two dropdowns (season + year) */}
						<div>
							<Label className="text-neutral-700">ترم</Label>

							<div className="mt-1 grid grid-cols-2 gap-2">
								<div>
									<Select
										value={semesterParts.season}
										onChange={(e) => syncSemester(e.target.value as SeasonValue, semesterParts.year)}
										disabled={submitting}
										className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
										style={{ ["--accent" as any]: ACCENT }}
									>
										<option value="" disabled>
											فصل
										</option>
										{SEASONS.map((s) => (
											<option key={s.value} value={s.value}>
												{s.labelFa}
											</option>
										))}
									</Select>
								</div>

								<div>
									<Select
										value={semesterParts.year}
										onChange={(e) => syncSemester(semesterParts.season, e.target.value)}
										disabled={submitting}
										className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
										style={{ ["--accent" as any]: ACCENT }}
									>
										<option value="" disabled>
											سال
										</option>
										{ALLOWED_YEARS.map((y) => (
											<option key={y} value={y}>
												{toPersianDigits(y)}
											</option>
										))}
									</Select>
								</div>
							</div>

						</div>
					</div>
				</CardBody>
			</Card>

			<div className="space-y-3">
				<div className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
					<span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
					امتیازدهی معیارها
				</div>

				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{ratingCategories.map((cat) => (
						<div
							key={cat.id}
							className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
						>
							<div className="mb-3 flex items-center justify-center gap-3">
								<Label className="mb-0 text-neutral-700">{cat.label}</Label>
							</div>

							<div className="flex justify-center">
								<StarRating
									rating={formData.ratings[cat.id]}
									onRatingChange={(rating) =>
										setFormData((p) => ({
											...p,
											ratings: { ...p.ratings, [cat.id]: rating },
										}))
									}
									size="md"
								/>
							</div>
						</div>
					))}
				</div>
			</div>

			<Card className="overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
				<CardBody className="flex flex-col items-center gap-3">
					<div className="flex items-center gap-2 text-sm text-neutral-800">
						<span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
						امتیاز نهایی
					</div>
					<StarRating
						rating={formData.overallRating}
						onRatingChange={(rating) => setFormData((p) => ({ ...p, overallRating: rating }))}
						size="lg"
					/>
				</CardBody>
			</Card>

			<div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
				<Label htmlFor="comment" className="text-neutral-700">
					توضیحات (اختیاری)
				</Label>
				<Textarea
					id="comment"
					value={formData.comment}
					onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value.slice(0, 300) }))}
					placeholder="نظر خود را درباره این استاد بنویسید."
					disabled={submitting}
					className="shadow-sm hover:shadow transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
					style={{ ["--accent" as any]: ACCENT }}
				/>
				<div className="mt-2 text-xs text-neutral-500">{formData.comment.length}/300</div>
			</div>

			<InlineError>{error}</InlineError>

			<div className="flex items-center justify-center pt-2">
				<Button
					type="submit"
					disabled={submitting || !isFormValid()}
					className="h-11 shadow-sm hover:shadow-md transition-all"
					style={{ backgroundColor: ACCENT, color: "white" }}
				>
					{submitting ? (
						<>
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							در حال ارسال...
						</>
					) : (
						"ارسال نظر"
					)}
				</Button>
			</div>

			<div className="text-center text-xs text-neutral-500">نظرسنجی به صورت کاملا نامحسوس انجام می شود، اطلاعات شما برای کاربران دیگر مخفی است.</div>
		</form>
	);
}
