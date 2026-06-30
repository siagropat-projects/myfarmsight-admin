import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-center items-center justify-center px-6">
            <div className="max-w-md text-center">
                <h1 className="text-9xl font-extrabold text-[#4CAF50] opacity-20">404</h1>
                <div className="relative -mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Lost in the Fields?</h2>
                    <p className="text-gray-500 mb-8">
                        The page you are looking for doesn't exist or has been moved to a different pasture.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors shadow-md"
                        >
                            <Home size={18} />
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}