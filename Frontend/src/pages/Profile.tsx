import { Avatar, AvatarFallback, AvatarImage } from "../components/UILib";
import { Button } from "../components/UILib";
import { Card, CardContent } from "../components/UILib";
import { Wallet, HelpCircle, Edit, ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getCurrentUserProfile, UserProfile } from "../services/userProfileService";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUserProfile();
        setUserProfile(data);
      } catch (err: any) {
        setError("Failed to load profile");
        console.error("Profile loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!userProfile) return <div className="flex justify-center items-center min-h-screen">No profile data found</div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 md:flex-row-reverse">
          
          <div className="flex flex-col gap-2 items-center">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={
                  userProfile.profilePicture
                    ? userProfile.profilePicture
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s"
                }
                alt="Profile"
              />
              <AvatarFallback>
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="outline"
              onClick={() => navigate("/profile/edit")}
              className="gap-2 rounded-xl border-2 hover:bg-red-50"
              style={{ borderColor: "#F07E74", color: "#F07E74" }}
            >
              <Edit className="w-2 h-2" />
              <p className="text-[1p]">ویرایش پروفایل</p>
            </Button>

          </div>
          <div className="flex-1 text-center md:text-right">
            <h1 className="mb-1" style={{ color: "#16519F" }}>
              {userProfile.username}
            </h1>
            <p className="text-gray-600 mb-3">{userProfile.studentId}</p>
            <p className="text-gray-500 mb-4 max-w-2xl">{userProfile.bio}</p>

            {/* Display user stats */}
            <div className="flex justify-center md:justify-end gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: "#16519F" }}>
                  {userProfile.followersCount}
                </div>
                <div className="text-sm text-gray-500">دنبال‌کننده</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: "#16519F" }}>
                  {userProfile.followingCount}
                </div>
                <div className="text-sm text-gray-500">دنبال‌شونده</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: "#16519F" }}>
                  {userProfile.postsCount}
                </div>
                <div className="text-sm text-gray-500">پست</div>
              </div>
            </div>
          </div>


        </div>


        <div className="space-y-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md bg-gray-50"
            onClick={() => navigate("/profile/wallet")}
          >
            <CardContent className="flex items-center justify-between p-6 flex-row-reverse">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#16519F20" }}
                >
                  <Wallet className="w-6 h-6" style={{ color: "#16519F" }} />
                </div>
                <div className="md:text-right">
                  <h3 className="mb-1">کیف پول</h3>
                  <p className="text-gray-500">مشاهده موجودی و تراکنش ها</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md bg-gray-50">
            <CardContent className="flex items-center justify-between p-6 flex-row-reverse">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#4FCBE920" }}
                >
                  <HelpCircle
                    className="w-6 h-6"
                    style={{ color: "#4FCBE9" }}
                  />
                </div>
                <div className="md:text-right">
                  <h3 className="mb-1 ">سوالات و ارتباط با ما</h3>
                  <p className="text-gray-500">از ما کمک بخواهید</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}