import React, { useEffect, useState } from "react";
import { Search, X, User, Home } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { Input } from "./ui/input";
import { auth } from "@/lib/firebase";
import { handleSignInWithGoogle } from "@/services/auth/sign_in";
import LoadingSpinner from "./animated/loading_spiner";
import Image from "next/image";

export default function AppBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    // Prevent rendering on profile page
    if (router.asPath.includes("profile")) {
        return null;
    }

    const handleSearch = async (e) => {
        setLoading(true)
        e.preventDefault();
        const trimmedSearchTerm = searchTerm.trim();

        if (trimmedSearchTerm) {
            router.push(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`).then(() => {
                setLoading(false)
            });
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        router.push("/search");
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-40 
                       bg-gradient-to-b from-black/90 to-black/30 
                       backdrop-blur-sm shadow-md"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Home Navigation Button */}
                <Link 
                    href="/" 
                    className="mr-4 text-gray-300 hover:text-white 
                               transition-colors duration-300 
                               bg-gray-800/60 hover:bg-gray-700/60 
                               rounded-full p-2"
                >
                    <Home size={20} />
                </Link>

                {/* Search Section */}
                <div className="flex-grow max-w-md mr-4">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex items-center"
                    >
                        <div className="absolute left-3 text-gray-400">
                            {loading ? <LoadingSpinner /> : <Search size={20} />}
                        </div>
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-10 w-full 
                                       bg-gray-900/50 border-gray-700"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Auth Section */}
                <AuthButton />
            </div>
        </header>
    );
}

function AuthButton() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (!user) {
        return (
            <button
                onClick={handleSignInWithGoogle}
                className="flex items-center gap-2 
                           px-2 py-1 rounded-full 
                           bg-gray-800/60 hover:bg-gray-700/60 
                           border border-gray-700 
                           transition-colors duration-300"
            >
                <Image
                    width={150}
                    height={150}
                    src="/google_icon.svg"
                    alt="Google Sign In"
                    className="w-5 h-5"
                />
                <span className="text-sm font-medium">Sign In</span>
            </button>
        );
    }

    return (
        <Link
            href="/profile"
            className="flex items-center gap-2 
                       px-2 py-1 rounded-full 
                       bg-gray-900/60 hover:bg-gray-700/60 
                       border border-gray-700 
                       transition-colors duration-300"
        >
            {user.photoURL ? (
                <Image 
                    width={300}
                    height={300}
                    src={user.photoURL}
                    alt={user.displayName || "Profile"}
                    className="w-6 h-6 rounded-full object-cover"
                />
            ) : (
                <User size={20} />
            )}
            <span className="text-sm font-medium max-w-[150px] truncate">
                {user.displayName || "Profile"}
            </span>
        </Link>
    );
}