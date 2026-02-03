import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { PageShell, Button, Card, CardHeader, CardBody, SegmentedControl } from "../../components/UIOverrides";
import { CreateFoodPostForm } from "./forms/CreateFoodPostForm";
import { CreateProfessorReviewPostForm } from "./forms/CreateProfessorReviewPostForm";
import { CreateDiscussionPostForm } from "./forms/CreateDiscussionPostForm";

export type CreateCategory = "food" | "review" | "discussion";

export function CreatePostPage(props: { starting_category?: CreateCategory }) {
	const navigate = useNavigate();
	const [category, setCategory] = useState<CreateCategory>(props.starting_category ?? "review");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmitStart = () => {
		setIsSubmitting(true);
	};

	const handleSubmitSuccess = () => {
		setIsSubmitting(false);
		// Navigate to the corresponding topic page
		if (category === "food") {
			navigate("/topic/food");
		} else if (category === "discussion") {
			navigate("/topic/discussion");
		} else if (category === "review") {
			navigate("/topic/professor-review");
		}
	};

	const handleSubmitError = () => {
		setIsSubmitting(false);
	};

	return (
		<PageShell title="ایجاد پست جدید">
			<div className="space-y-4" dir="rtl">
					<CardBody className="overflow-hidden">
						<SegmentedControl<CreateCategory>
							value={category}
							onChange={(t) => {setCategory(t); navigate("/create/" + t)}}
							options={[
								{ value: "food", label: "غذا" },
								{ value: "review", label: "استاد" },
								{ value: "discussion", label: "گفتگو" },
							]}
							disabled={isSubmitting}
						/>
					</CardBody>

				<div className="animate-[fadeIn_.18s_ease-out]">
					<Card className="overflow-hidden bg-neutral-50">
						{/* <CardHeader title={header.title} subtitle={header.desc} /> */}
						<CardBody>
							{category === "food" && (
								<CreateFoodPostForm
									isSubmitting={isSubmitting}
									onSubmitStart={handleSubmitStart}
									onSubmitSuccess={handleSubmitSuccess}
									onSubmitError={handleSubmitError}
								/>
							)}
							{category === "review" && (
								<CreateProfessorReviewPostForm
									isSubmitting={isSubmitting}
									onSubmitStart={handleSubmitStart}
									onSubmitSuccess={handleSubmitSuccess}
									onSubmitError={handleSubmitError}
								/>
							)}
							{category === "discussion" && (
								<CreateDiscussionPostForm
									isSubmitting={isSubmitting}
									onSubmitStart={handleSubmitStart}
									onSubmitSuccess={handleSubmitSuccess}
									onSubmitError={handleSubmitError}
								/>
							)}
							{category === null &&
								<CardHeader
									title="دسته‌بندی را انتخاب کنید و فرم مربوطه را تکمیل کنید." />
							}
						</CardBody>
					</Card>
				</div>

				{/* keyframe: fadeIn */}
				<style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
			</div>
		</PageShell>
	);
}
