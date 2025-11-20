import { useState, useEffect } from 'react';
import type { UserProfile } from '../components/User';
import { Avatar, Card, CardContent } from '../components/UILib';
import { Button } from '../components/UILib';
import { Input } from '../components/UILib';
import { Label } from '../components/UILib';
import { Textarea } from '../components/UILib';
import { ArrowLeft, User, Lock, Phone, Mail, Camera, FileText } from 'lucide-react';

interface EditProfilePageProps {
  onNavigate: (page: 'profile' | 'wallet' | 'edit-profile') => void;
}

export function EditProfilePage({ onNavigate }: EditProfilePageProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
  });
  // useEffect(() => {
  //   axios.get('idk') //! TODO
  //     .then(response => setUserProfile(response.data))
  //     .catch(error => console.error('Error fetching profile data:', error));
  // }, []);

  //mock user for testing
  const mock_profile: UserProfile = {
    username: "باقر شمس",
    bio: "دوستدار طبیعت",
    avatar:
      "https://preview.redd.it/z4t51ibk1is61.png?auto=webp&s=7a5d0dad617ed52dfe29a65b742bdc39c49b94b7",
    info: "انسانیت بساز، نه انسان. تولید مثل را هر حیوانی بلد است.",
    mobile: "09123456789",
    email: "shamsollah@bagher.com"
  };

  useEffect(() => {
    setUserProfile(mock_profile);
  });

  if (!userProfile) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onNavigate('profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('profile')}
            className="rounded-xl hover:bg-cyan-50"
            style={{ color: '#4FCBE9' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex flex-row-reverse" style={{ color: '#16519F' }}>ویرایش پروفایل</h1>
        </div>

        <form onSubmit={handleSubmit} className='flex-row-reverse'>
          {/* Profile Photo Upload */}
          <Card className="mb-6 rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <h3 className="mb-1">تغییر عکس پروفایل</h3>
                  <p className="text-gray-500 mb-3">آپلود عکس پروفایل جدید</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-2 hover:bg-cyan-50"
                    style={{ borderColor: '#4FCBE9', color: '#4FCBE9' }}
                  >
                    انتخاب فایل
                  </Button>
                </div>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#F07E7420' }}
                >
                  <Camera className="w-8 h-8" style={{ color: '#F07E74' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="username" className="text-right block">نام کاربری</Label>
                    <Input
                      id="username"
                      type="text"
                      value={userProfile.username?.toString()}
                      onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                      placeholder="نام کاربری خود را وارد کنید"
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

            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Label htmlFor="bio" className="text-right block">بیوگرافی</Label>
                    <Textarea
                      id="bio"
                      value={userProfile.bio?.toString()}
                      onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
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

            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="mobile" className="text-right block">شماره موبایل</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={userProfile.mobile?.toString()}
                      onChange={(e) => setUserProfile({ ...userProfile, mobile: e.target.value })}
                      placeholder="شماره تلفن خود را وارد کنید"
                      className="mt-1.5 rounded-xl text-right"
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#4FCBE920' }}
                  >
                    <Phone className="w-5 h-5" style={{ color: '#4FCBE9' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email" className="text-right block">آدرس ایمیل</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email?.toString()}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      placeholder="ایمیل خود را وارد کنید"
                      className="mt-1.5 rounded-xl text-right"
                      dir="ltr"
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#4FCBE920' }}
                  >
                    <Mail className="w-5 h-5" style={{ color: '#4FCBE9' }} />
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
          >
            ذخیره تغییرات
          </Button>
        </form>
      </div>
    </div>
  );
}