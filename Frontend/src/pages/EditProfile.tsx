import { useState, useEffect, useRef } from 'react';
import {
  updateUserProfile,
  getCurrentUserProfile,
  updateProfilePicture,
  deleteProfilePicture
} from "../services/userProfileService";
import { Avatar, Card, CardContent } from '../components/UILib';
import { Button } from '../components/UILib';
import { Input } from '../components/UILib';
import { Label } from '../components/UILib';
import { Textarea } from '../components/UILib';
import { ArrowLeft, User, Camera, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EditProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    bio: "",
    info: "",
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);

    updateProfilePicture(file);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          studentId: data.studentId || "",
          bio: data.bio || "",
          info: data.info || "",
        });
        setProfilePicture(data.profilePicture);
      } catch (err) {
        console.error(err);
        alert("خطا در بارگذاری پروفایل");
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(form);
      alert("تغییرات ذخیره شد");
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره تغییرات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!profilePicture) return;
    if (!window.confirm("آیا از حذف عکس پروفایل مطمئن هستید؟")) return;

    setImageLoading(true);
    try {
      await deleteProfilePicture();
      setProfilePicture(null);
    } catch (err) {
      console.error(err);
      alert("خطا در حذف عکس");
    } finally {
      setImageLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow)',
    borderRadius: '1rem',
  };

  const inputStyle = {
    backgroundColor: 'var(--background)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-color)',
  };

  return (
    <div
      className="min-h-screen pb-20 lg:pb-8"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="rounded-xl"
            style={{ color: 'var(--primary-color)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 style={{ color: 'var(--primary-color)' }}>ویرایش پروفایل</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-row-reverse">
          {/* Profile Picture */}
          <Card style={cardStyle} className="mb-6">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="flex-1 text-right">
                <h3 style={{ color: 'var(--text-primary)' }}>
                  تغییر عکس پروفایل
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-light)' }}>
                  آپلود عکس پروفایل جدید
                </p>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-2"
                    style={{
                      borderColor: 'var(--primary-color)',
                      color: 'var(--primary-color)',
                    }}
                    disabled={imageLoading}
                    onClick={handleAvatarClick}
                  >
                    انتخاب فایل
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {profilePicture && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-2 gap-2"
                      style={{
                        borderColor: 'var(--danger-color)',
                        color: 'var(--danger-color)',
                      }}
                      onClick={handleDeleteImage}
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف عکس
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4"
                  style={{ borderColor: 'var(--background)' }}
                >
                  <img
                    src={
                      profilePicture ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fields */}
          {[
            { id: 'firstName', label: 'نام', icon: User },
            { id: 'lastName', label: 'نام خانوادگی', icon: User },
            { id: 'studentId', label: 'شماره دانشجویی', icon: FileText },
            { id: 'info', label: 'رمز دوم', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <Card key={id} style={cardStyle} className="mb-4">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={id} className="block text-right">
                    {label}
                  </Label>
                  <Input
                    id={id}
                    value={(form as any)[id]}
                    onChange={(e) =>
                      setForm({ ...form, [id]: e.target.value })
                    }
                    className="mt-1.5 rounded-xl text-right"
                    style={inputStyle}
                  />
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-light)' }}
                >
                  <Icon />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Bio */}
          <Card style={cardStyle}>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="flex-1">
                <Label htmlFor="bio" className="block text-right">
                  بیوگرافی
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className="mt-1.5 min-h-[80px] rounded-xl text-right"
                  style={inputStyle}
                />
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--secondary-light)' }}
              >
                <FileText />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-8 rounded-xl"
            disabled={loading}
            style={{
              background: `linear-gradient(
                135deg,
                var(--primary-dark) 0%,
                var(--primary-color) 100%
              )`,
              color: '#fff',
            }}
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </form>
      </div>
    </div>
  );
}
