import { useState, useEffect, useRef } from 'react';
import {
	updateUserProfile,
	getCurrentUserProfile,
	UserProfile,
	updateProfilePicture,
	deleteProfilePicture
} from "../services/userProfileService";
import { Avatar, Card, CardContent } from '../components/UILib';
import { Button } from '../components/UILib';
import { Input } from '../components/UILib';
import { Label } from '../components/UILib';
import { Textarea } from '../components/UILib';
import { ArrowLeft, User, Phone, Mail, Camera, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EditProfilePage() {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		studentId: "",
		bio: "",
	});

	const [profilePicture, setProfilePicture] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicture(reader.result as string);
			};
			reader.readAsDataURL(file);

			updateProfilePicture(file);
		}
	};

	// Load profile data when the component mounts
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getCurrentUserProfile();
				setForm({
					firstName: data.firstName || "",
					lastName: data.lastName || "",
					studentId: data.studentId || "",
					bio: data.bio || "",
				});
				setProfilePicture(data.profilePicture);
			} catch (err) {
				console.error("Failed to load profile:", err);
				alert("خطا در بارگذاری پروفایل");
			}
		};

		loadProfile();
	}, []);

	const handleSave = async () => {
		setLoading(true);
		try {
			await updateUserProfile(form);
			alert("تغییرات ذخیره شد");
			navigate('/profile');
		} catch (err) {
			console.error("Update error:", err);
			alert("خطا در ذخیره تغییرات");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSave();
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('لطفاً یک فایل تصویر انتخاب کنید');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('حجم فایل باید کمتر از ۵ مگابایت باشد');
			return;
		}

		setImageLoading(true);
		try {
			const response = await updateProfilePicture(file);
			setProfilePicture(response.profilePicture);
			alert("عکس پروفایل با موفقیت بروزرسانی شد");
		} catch (err) {
			console.error("Image upload error:", err);
			alert("خطا در آپلود عکس");
		} finally {
			setImageLoading(false);
			// Clear the file input
			e.target.value = '';
		}
	};

	const handleDeleteImage = async () => {
		if (!profilePicture) return;

		if (!window.confirm('آیا از حذف عکس پروفایل مطمئن هستید؟')) {
			return;
		}

		setImageLoading(true);
		try {
			await deleteProfilePicture();
			setProfilePicture(null);
			alert("عکس پروفایل با موفقیت حذف شد");
		} catch (err) {
			console.error("Image delete error:", err);
			alert("خطا در حذف عکس");
		} finally {
			setImageLoading(false);
		}
	};

	return (
		<div className="min-h-screen pb-20 lg:pb-8">
			<div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12">
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate('/profile')}
						className="rounded-xl hover:bg-cyan-50"
						style={{ color: '#4FCBE9' }}
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="flex flex-row-reverse" style={{ color: '#16519F' }}>ویرایش پروفایل</h1>
				</div>

				<form onSubmit={handleSubmit} className='flex-row-reverse'>
					{/* Profile Photo Upload */}
					<Card className="mb-6 rounded-2xl border-0 shadow-md bg-gray-50">
						<CardContent className="p-6">
							<div className="flex items-center gap-6">
								<div className="flex-1 text-right">
									<h3 className="mb-1">تغییر عکس پروفایل</h3>
									<p className="text-gray-500 mb-3">آپلود عکس پروفایل جدید</p>
									<div className="flex gap-3">
										<label htmlFor="profile-picture">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="rounded-xl border-2 hover:bg-cyan-50 cursor-pointer bg-white"
												style={{ borderColor: '#4FCBE9', color: '#4FCBE9' }}
												disabled={imageLoading}
												onClick={handleAvatarClick}
											>
												{imageLoading ? 'در حال آپلود...' : 'انتخاب فایل'}
											</Button>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												onChange={handleFileChange}
												className="hidden"
											/>
										</label>
										<input
											id="profile-picture"
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
											disabled={imageLoading}
										/>
										{profilePicture && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="rounded-xl border-2 hover:bg-red-50 gap-2"
												style={{ borderColor: '#F07E74', color: '#F07E74' }}
												onClick={handleDeleteImage}
												disabled={imageLoading}
											>
												<Trash2 className="w-4 h-4" />
												حذف عکس
											</Button>
										)}
									</div>
								</div>
								<div className="relative">
									<div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
										<img
											src={
												profilePicture ||
												"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s"
											}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									</div>
									<div
										className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
										style={{ backgroundColor: '#F07E74' }}
									>
										<Camera className="w-4 h-4 text-white" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Form Fields */}
					<div className="space-y-4">
						{/* First Name */}
						<Card className="rounded-2xl border-0 shadow-md bg-gray-50">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="flex-1">
										<Label htmlFor="firstName" className="text-right block">نام</Label>
										<Input
											id="firstName"
											type="text"
											value={form.firstName}
											onChange={(e) => setForm({ ...form, firstName: e.target.value })}
											placeholder="نام خود را وارد کنید"
											className="mt-1.5 rounded-xl text-right"
										/>
									</div>
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
										style={{ backgroundColor: '#16519F20' }}
									>
										<User className="w-5 h-5" style={{ color: '#16519F' }} />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Last Name */}
						<Card className="rounded-2xl border-0 shadow-md bg-gray-50">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="flex-1">
										<Label htmlFor="lastName" className="text-right block">نام خانوادگی</Label>
										<Input
											id="lastName"
											type="text"
											value={form.lastName}
											onChange={(e) => setForm({ ...form, lastName: e.target.value })}
											placeholder="نام خانوادگی خود را وارد کنید"
											className="mt-1.5 rounded-xl text-right"
										/>
									</div>
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
										style={{ backgroundColor: '#16519F20' }}
									>
										<User className="w-5 h-5" style={{ color: '#16519F' }} />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Bio */}
						<Card className="rounded-2xl border-0 shadow-md bg-gray-50">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<div className="flex-1">
										<Label htmlFor="bio" className="text-right block">بیوگرافی</Label>
										<Textarea
											id="bio"
											value={form.bio}
											onChange={(e) => setForm({ ...form, bio: e.target.value })}
											placeholder="درباره خودتان بگویید"
											className="mt-1.5 min-h-[80px] rounded-xl text-right"
										/>
									</div>
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
										style={{ backgroundColor: '#F8DD2E20' }}
									>
										<FileText className="w-5 h-5" style={{ color: '#F8DD2E' }} />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Student ID */}
						<Card className="rounded-2xl border-0 shadow-md bg-gray-50">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="flex-1">
										<Label htmlFor="studentId" className="text-right block">شماره دانشجویی</Label>
										<Input
											id="studentId"
											type="text"
											value={form.studentId}
											onChange={(e) => setForm({ ...form, studentId: e.target.value })}
											placeholder="شماره دانشجویی خود را وارد کنید"
											className="mt-1.5 rounded-xl text-right"
										/>
									</div>
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
										style={{ backgroundColor: '#4FCBE920' }}
									>
										<FileText className="w-5 h-5" style={{ color: '#4FCBE9' }} />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full mt-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
						style={{ background: 'linear-gradient(135deg, #16519F 0%, #4FCBE9 100%)' }}
						disabled={loading}
					>
						{loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
					</Button>
				</form>
			</div>
		</div>
	);
}