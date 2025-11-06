import React, { useEffect, useState } from "react";
import axios from "axios";

const PublishForm = () => {
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available form titles
  useEffect(() => {
    axios
      .get("http://10.13.10.21:8087/titles")
      .then((res) => setTitles(res.data))
      .catch((err) => console.error("Error fetching titles:", err));
  }, []);

  // Handle publish button click
  const handlePublish = async () => {
    if (!selectedTitle || !fromDate || !toDate) {
      setMessage("⚠️ Please fill in all fields before publishing.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://10.13.10.21:8087/publish", {
        title: selectedTitle,
        fromDate,
        toDate,
        published: 1,
      });

      setMessage(response.data.message || "✅ Form published successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error publishing form. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle unpublish all forms
  const handleUnpublishAll = async () => {
    setLoading(true);

    try {
      const response = await axios.get("http://10.13.10.21:8087/unpublish");
      setMessage(response.data.message || "✅ All forms unpublished!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error unpublishing forms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-1">
          {/* Header */}
          <div className="text-center mb-5">
            {/* <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl text-white">📄</span>
            </div> */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent">
              Manage your form publishing schedule
            </h2>
           {/*  <p className="text-gray-500 mt-2">Manage your form publishing schedule</p> */}
          </div>

          {/* Title Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
              Select Form Title
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl p-4 bg-white/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
            >
              <option value="">-- Choose Title --</option>
              {titles.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl p-4 bg-white/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl p-4 bg-white/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Publishing...
                </div>
              ) : (
                " Publish Form"
              )}
            </button>

            <button
              onClick={handleUnpublishAll}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                " Unpublish All"
              )}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 text-center font-medium rounded-xl p-4 shadow-sm border transition-all duration-300 ${
              message.includes("❌") || message.includes("⚠️") 
                ? "bg-red-50 border-red-200 text-red-700" 
                : "bg-green-50 border-green-200 text-green-700"
            }`}>
              <div className="flex items-center justify-center">
                {message.includes("❌") || message.includes("⚠️") ? (
                  <span className="text-xl mr-2">{message.includes("❌") ? "❌" : "⚠️"}</span>
                ) : (
                  <span className="text-xl mr-2">✅</span>
                )}
                {message.replace(/[❌⚠️✅]/g, '').trim()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      
    </div>
  );
};

export default PublishForm;