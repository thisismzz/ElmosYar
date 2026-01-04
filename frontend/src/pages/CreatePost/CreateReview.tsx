import { useState } from "react";
import { Button } from "../../components/UILib";
import { Input } from "../../components/UILib";
import { Label } from "../../components/UILib";
import { Textarea } from "../../components/UILib";
import { Card } from "../../components/UILib";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/select";
import { StarRating } from "../../components/Reviews/StarRating";
import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createPost } from "../../services/PostService";


const faculties = [
	"علوم کامپیوتر",
	"مهندسی نساجی",
];

const ratingCategories = [
	{ id: "teaching", label: "کیفیت تدریس", icon: "📚" },
	{ id: "grading", label: "نمره دهی عادلانه", icon: "✅" },
	{ id: "clarity", label: "شفافیت جزوه", icon: "💡" },
	{ id: "helpfulness", label: "پاسخ گویی به سوالات", icon: "🤝" },
	{ id: "satisfaction", label: "نظم و ثبات", icon: "⭐" },
];

export function CreateReviewPage() {

	const navigate = useNavigate();

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
		},
		overallRating: 0,
		comment: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Calculate overall rating as average if not manually set
		const ratingsArray = Object.values(formData.ratings);
		const avgRating = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;

		// onSubmit({
		//   ...formData,
		//   overallRating: formData.overallRating || avgRating,
		// });
	};

	const isFormValid = () => {
		return (
			formData.professorName &&
			formData.faculty &&
			formData.courseName &&
			formData.semester &&
			Object.values(formData.ratings).every(r => r > 0) &&
			formData.overallRating > 0
		);
	};

	// Calculate average from individual ratings
	const ratingsArray = Object.values(formData.ratings);
	const calculatedAvg = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;

	return (
		<div className="min-h-screen bg-gray-50/30">
			<div className="max-w-3xl mx-auto px-4 py-8">
				{/* Header */}
				<Button
					variant="ghost"
					onClick={() => navigate("/topic/professors/")}
					className="mb-6 -ml-2 hover:bg-[#4FCBE9]/10"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					بازگشت
				</Button>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<Card className="p-6 shadow-md border-gray-100">
						<h2 className="text-[#16519F] ">مشخصات استاد</h2>
						<div className="space-y-4 text-right">
							<div className="text-right">
								<Label htmlFor="professorName" className="text-gray-700 flex flex-row-reverse">نام استاد</Label>
								<Input
									id="professorName"
									value={formData.professorName}
									onChange={(e) => setFormData({ ...formData, professorName: e.target.value })}
									placeholder="مثال: اکبر عبدی"
									className="mt-2 h-12 rounded-xl text-right"
									required
								/>
							</div>

							<div>
								<Label htmlFor="faculty" className="text-gray-700 flex flex-row-reverse">دانشکده</Label>
								<Select
									value={formData.faculty}
									onValueChange={(value) => setFormData({ ...formData, faculty: value })}
								//   required
								>
									<SelectTrigger className="mt-2 h-12 rounded-xl">
										<SelectValue placeholder="Select faculty" />
									</SelectTrigger>
									<SelectContent>
										{faculties.map((faculty) => (
											<SelectItem key={faculty} value={faculty}>
												{faculty}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="courseName" className="text-gray-700 flex flex-row-reverse">درس</Label>
									<Input
										id="courseName"
										value={formData.courseName}
										onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
										placeholder="مثال: ساختمان داده"
										className="mt-2 h-12 rounded-xl text-right"
										required
									/>
								</div>

								<div>
									<Label htmlFor="semester" className="text-gray-700 flex flex-row-reverse">ترم</Label>
									<Input
										id="semester"
										value={formData.semester}
										onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
										placeholder="مثال: پاییز 1404"
										className="mt-2 h-12 rounded-xl text-right"
										required
									/>
								</div>
							</div>
						</div>
					</Card>

					{/* Rating Categories - 5 Separate Cards */}
					<div>
						<h2 className="text-[#16519F] mb-4">به عملکرد استاد در معیار های زیر، چه امتیازی می دهید؟</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{ratingCategories.map((category) => (
								<Card key={category.id} className="p-5 shadow-md border-gray-100 hover:shadow-lg transition-shadow">
									<div className="flex items-center justify-between mb-3 flex flex-row-reverse">
										<div className="flex items-center gap-2">
											<span className="text-2xl">{category.icon}</span>
											<Label className="text-gray-700 flex flex-row-reverse">{category.label}</Label>
										</div>
									</div>
									<div className="flex justify-center">
										<StarRating
											rating={formData.ratings[category.id as keyof typeof formData.ratings]}
											onRatingChange={(rating) =>
												setFormData({
													...formData,
													ratings: { ...formData.ratings, [category.id]: rating },
												})
											}
											size="md"
										/>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* Overall Rating */}
					<Card className="p-6 shadow-md border-2 border-[#16519F]/20 bg-gradient-to-r from-[#16519F]/5 to-[#4FCBE9]/5">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							<div className="flex flex-col items-center bg-white rounded-xl p-4 shadow-sm">
								<StarRating
									rating={formData.overallRating}
									onRatingChange={(rating) => setFormData({ ...formData, overallRating: rating })}
									size="lg"
								/>
								<span className="text-sm text-gray-500 mt-2">نظر نهایی</span>
							</div>
														<div>
								<div className="flex items-center gap-2 mb-2 flex-row-reverse">
									<Star className="w-6 h-6 text-[#F8DD2E] fill-[#F8DD2E]" />
									<Label className="text-xl text-[#16519F]">نظر نهایی</Label>
								</div>
							</div>
						</div>
					</Card>

					{/* Comment */}
					<Card className="p-6 shadow-md border-gray-100">
						<Label htmlFor="comment" className="text-gray-700 flex flex-row-reverse">توضیحات (اختیاری)</Label>
						<Textarea
							id="comment"
							value={formData.comment}
							onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 300) })}
							placeholder="نظر خود را درباره این استاد بنویسید."
							className="min-h-32 resize-none rounded-xl text-right"
							maxLength={300}
						/>
						<p className="text-sm text-gray-400 mt-2 text-right">
							{formData.comment.length}/300
						</p>
					</Card>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full h-14 bg-[#16519F] hover:bg-[#0d3a73] rounded-xl shadow-lg hover:shadow-xl transition-all"
						disabled={!isFormValid()}
						onClick={() => createPost(
							"professor-review",
							{
								"professorName": formData.professorName,
								"faculty": formData.faculty,
								"courseName": formData.courseName,
								"semester": formData.semester,
								"overallRating": formData.overallRating.toString(),
								"ratingsTeaching": formData.ratings.teaching.toString(),
								"ratingsGrading": formData.ratings.grading.toString(),
								"ratingsClarity": formData.ratings.clarity.toString(),
								"ratingsHelpfulness": formData.ratings.helpfulness.toString(),
								"ratingsSatisfaction": formData.ratings.satisfaction.toString(),
								"body": formData.comment

							}

						)}
					>
						ارسال نظر
					</Button>
				</form>
			</div>
		</div>
	);
}
