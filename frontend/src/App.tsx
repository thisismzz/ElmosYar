import React from "react";
import { useState } from "react";
import { ProfilePage } from "./components/pages/Profile";
import { EditProfilePage } from "./components/pages/EditProfile";
import { WalletPage } from "./components/pages/Wallet";
import "./App.css";

type Page = "profile" | "wallet" | "edit-profile";

function App() {
    const [currentPage, setCurrentPage] = useState<Page>("profile");
    return <main className="lg:ml-60 lg:mr-64">
        {currentPage === "profile" && <ProfilePage onNavigate={setCurrentPage} />}
        {currentPage === "wallet" && <WalletPage onNavigate={setCurrentPage} />}
        {currentPage === "edit-profile" && <EditProfilePage onNavigate={setCurrentPage} />}
      </main>;
}

export default App;
