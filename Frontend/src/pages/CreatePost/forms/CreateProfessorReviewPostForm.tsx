import React, { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Button, Card, CardBody, CardHeader, InlineError, Input, Label, Select, Textarea } from "../ui";
import { StarRating } from "../../../components/Reviews/StarRating"; // adjust path
import { createPost } from "../../../services/PostService"; // adjust path

const faculties = ["علوم کامپیوتر", "مهندسی نساجی"] as const;

type RatingKey = "teaching" | "grading" | "clarity" | "helpfulness" | "satisfaction";

const ratingCategories: Array<{ id: RatingKey; label: string }> = [
	{ id: "teaching", label: "کیفیت تدریس" },
	{ id: "grading", label: "نمره‌دهی عادلانه" },
	{ id: "clarity", label: "شفافیت جزوه" },
	{ id: "helpfulness", label: "پاسخ‌گویی به سوالات" },
	{ id: "satisfaction", label: "نظم و ثبات" },
];

export function CreateProfessorReviewPostForm() {
	const [formData, setFormData] = useState({
		professorName: "",
		faculty: "",
		courseName: "",
		semester: "",
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

	const [submitting, setSubmitting] = useState(false);
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

	const handleSubmit: React.FormEventHandler = async (e) => {
		e.preventDefault();
		setError(undefined);

		if (!isFormValid()) {
			setError("لطفاً همه فیلدهای ضروری را تکمیل کنید.");
			return;
		}

		try {
			setSubmitting(true);

			// You were previously doing createPost onClick; doing it in submit is cleaner.
			await createPost(
				formData.comment?.trim() || "null",
				"professor-review",
				"idk,this,that",
				{
					id: "200",
					professorName: formData.professorName,
					faculty: formData.faculty || "ComputerScience",
					courseName: formData.courseName,
					semester: formData.semester,
					overallRating: formData.overallRating,
					ratingsTeaching: formData.ratings.teaching,
					ratingsGrading: formData.ratings.grading,
					ratingsClarity: formData.ratings.clarity,
					ratingsHelpfulness: formData.ratings.helpfulness,
					ratingsSatisfaction: formData.ratings.satisfaction,
					body: formData.comment,
				}
			);

			setFormData({
				professorName: "",
				faculty: "",
				courseName: "",
				semester: "",
				ratings: { teaching: 0, grading: 0, clarity: 0, helpfulness: 0, satisfaction: 0 },
				overallRating: 0,
				comment: "",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطایی در ارسال نظر رخ داد.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<Card className="overflow-hidden">
				<CardBody className="space-y-4">
					<div>
						<Label htmlFor="profName">نام استاد</Label>
						<Input
							id="profName"
							value={formData.professorName}
							onChange={(e) => setFormData((p) => ({ ...p, professorName: e.target.value }))}
							placeholder="مثال: اکبر عبدی"
							disabled={submitting}
						/>
					</div>

					<div>
						<Label htmlFor="faculty">دانشکده</Label>
						<Select
							id="faculty"
							value={formData.faculty}
							onChange={(e) => setFormData((p) => ({ ...p, faculty: e.target.value }))}
							disabled={submitting}
						>
							<option value="" disabled>انتخاب کنید</option>
							{faculties.map((f) => (
								<option key={f} value={f}>{f}</option>
							))}
						</Select>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="course">درس</Label>
							<Input
								id="course"
								value={formData.courseName}
								onChange={(e) => setFormData((p) => ({ ...p, courseName: e.target.value }))}
								placeholder="مثال: ساختمان داده"
								disabled={submitting}
							/>
						</div>

						<div>
							<Label htmlFor="semester">ترم</Label>
							<Input
								id="semester"
								value={formData.semester}
								onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}
								placeholder="مثال: پاییز 1404"
								disabled={submitting}
							/>
						</div>
					</div>
				</CardBody>
			</Card>

			<div className="space-y-3">
				<div className="text-sm font-semibold text-neutral-600">امتیازدهی معیارها</div>

				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
					{ratingCategories.map((cat) => (
						<div
							key={cat.id}
							className="rounded-2xl bg-white border border-neutral-200 px-4 py-4 transition hover:bg-neutral-50/35"
						>
							<div className="mb-3 flex items-center justify-center gap-3">
								<Label className="mb-0">{cat.label}</Label>
								{/* <span className="text-xs text-neutral-500">۱ تا ۵</span> */}
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

			<Card className="overflow-hidden">
				<CardBody className="flex flex-col items-center gap-3">
					<div className="flex items-center gap-2 text-sm text-neutral-800">
						امتیاز نهایی
					</div>
					<StarRating
						rating={formData.overallRating}
						onRatingChange={(rating) => setFormData((p) => ({ ...p, overallRating: rating }))}
						size="lg"
					/>
				</CardBody>
			</Card>

			<div>
				<Label htmlFor="comment">توضیحات (اختیاری)</Label>
				<Textarea
					id="comment"
					value={formData.comment}
					onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value.slice(0, 300) }))}
					placeholder="نظر خود را درباره این استاد بنویسید."
					disabled={submitting}
				/>
				<div className="mt-2 text-xs text-neutral-500">{formData.comment.length}/300</div>
			</div>

			<InlineError>{error}</InlineError>

			<div className="flex items-center justify-center pt-2">
				<Button type="submit" disabled={submitting || !isFormValid()} className="h-11">
					{submitting ? (
						<>
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
							در حال ارسال...
						</>
					) : (
						"ارسال نظر"
					)}
				</Button>
			</div>
		</form>
	);
}
