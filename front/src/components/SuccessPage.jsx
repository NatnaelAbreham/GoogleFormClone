import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import natiImage from '../images/tsedeylogo.jpg'; 

export default function SuccessPage() {

  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);




  //const { state } = useLocation();

  const formTitle = state?.formTitle || "Form Submitted";
  const themeColor = state?.themeColor || "#3b82f6"; // Blue fallback

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
      style={{ backgroundColor: "rgb(236, 225, 236)" }}
    >
      <div className="bg-white rounded-xl shadow-md max-w-md w-full overflow-hidden">

{/* Logo Container */}
<div
  className="w-full flex items-center justify-center"
 
>
  <img
    src={natiImage}
    alt="Logo"
    className="w-full h-full object-contain"
  />
</div>


{/* Spacer showing body background */}
<div
  className="w-full"
  style={{ height: "20px", backgroundColor: "rgb(236, 225, 236)" }}
></div>

{/* Top Colored Border */}
<div
  className="h-2 w-full"
  style={{ backgroundColor: themeColor }}
/>


        <div className="p-8 text-center">

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-normal text-gray-900 mb-3 break-words">
            {formTitle}
          </h1>

          {/* Message */}
          <p className="text-green-600 text-lg mb-8">
            Your response has been recorded.
          </p>

          {/* Button */}
          <Link
            to="/"
            className="px-6 py-3 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: themeColor }}
          >
            Submit another response
          </Link>
        </div>
      </div>
    </div>
  );
}
