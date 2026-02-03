import { Avatar, AvatarFallback, AvatarImage, Badge } from "../components/UILib";
import { Button } from "../components/UILib";
import { Card, CardContent } from "../components/UILib";
import { Wallet, HelpCircle, Edit, ChevronLeft, ForkKnife } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getCurrentUserProfile, UserProfile } from "../services/userProfileService";
import { useNavigate } from "react-router-dom";
import { majorCode } from "../dynamic_data/id_by_major";

const getHueFromSeed = (seed: string): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
};

export function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const majorID = (userProfile?.studentId)?.toString().substring(3, 6)
    const yearID = (userProfile?.studentId)?.toString().substring(0, 3)
    const major = majorCode[majorID ?? "0"]
    const year = yearID ? Number.parseInt((yearID)).toLocaleString("fa-IR") + " ورودی" : "نامعلوم"


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
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 md:flex-row-reverse">

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
                        <div className="flex justify-center gap-2 md:justify-end">

                            <h1 className="mb-1" style={{ color: "hsl(212, 99%, 39%)" }}>
                                @{userProfile.username}
                            </h1>
                            <p style={{ color: "hsl(236, 87%, 18%)", fontWeight: "bolder"}}>
                                {userProfile.firstName} {userProfile.lastName}
                            </p>
                        </div>
                        <p className="text-gray-500 mt-2 mb-2 max-w-2xl" dir="rtl">"{userProfile.bio}"</p>
                        
                            <div className="flex gap-2 mt-4 justify-center md:justify-end">
                                <Badge variant="outline" className="border-[#4FCBE9] text-[#4FCBE9]" style={{
                                    borderColor: `hsl(${getHueFromSeed(majorID ?? "100")}, 70%, 60%)`,
                                    color: `hsl(${getHueFromSeed(majorID ?? "100")}, 70%, 60%)`
                                }}>
                                    {major}
                                </Badge>
                                <Badge variant="outline" className="border-[#4FCBE9] text-[#4FCBE9] "style={{
                                    borderColor: `hsl(${getHueFromSeed(yearID ?? "150")}, 70%, 60%)`,
                                    color: `hsl(${getHueFromSeed(yearID ?? "150")}, 70%, 60%)`
                                }}>
                                    {year}
                                </Badge>
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
                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md bg-gray-50"
                        onClick={() => navigate("/profile/food-posts")}
                    >
                        <CardContent className="flex items-center justify-between p-6 flex-row-reverse">
                            <div className="flex items-center gap-4 flex-row-reverse">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "#16519F20" }}
                                >
                                    <ForkKnife className="w-6 h-6" style={{ color: "#169f1d" }} />
                                </div>
                                <div className="md:text-right">
                                    <h3 className="mb-1">تبادلات غذا</h3>
                                    <p className="text-gray-500">مشاهده غذا های خریداری شده و فروخته شده</p>
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