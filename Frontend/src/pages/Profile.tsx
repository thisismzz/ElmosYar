import { Avatar, AvatarFallback, AvatarImage } from "../components/UILib";
import { Button } from "../components/UILib";
import { Card, CardContent } from "../components/UILib";
import { Wallet, HelpCircle, Edit, ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import type { UserProfile } from "../components/User";

interface ProfilePageProps {
  onNavigate: (page: "profile" | "wallet" | "edit-profile") => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>();
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

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="flex-1 text-center md:text-right">
            <h1 className="mb-1" style={{ color: "#16519F" }}>
              {userProfile.username}
            </h1>
            <p className="text-gray-600 mb-3">{userProfile.bio}</p>
            <p className="text-gray-500 mb-4 max-w-2xl">{userProfile.info}</p>
            <Button
              variant="outline"
              onClick={() => onNavigate("edit-profile")}
              className="gap-2 rounded-xl border-2 hover:bg-red-50"
              style={{ borderColor: "#F07E74", color: "#F07E74" }}
            >
              <Edit className="w-4 h-4" />
              ویرایش پروفایل
            </Button>
          </div>

          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
            <AvatarImage
              src={
                userProfile.avatar
                  ? userProfile.avatar
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s"
              }
              alt="Profile"
            />
            <AvatarFallback>Profile</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md"
            onClick={() => onNavigate("wallet")}
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

          <Card className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md">
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
