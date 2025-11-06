import React, { useEffect, useState } from "react";
import axios from "axios";

const PublishForm = () => {
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");

  // Fetch available form titles
  useEffect(() => {
    axios
      .get("http://localhost:4000/titles")
      .then((res) => setTitles(res.data))
      .catch((err) => console.error("Error fetching titles:", err));
  }, []);

  // Handle publish button click
  const handlePublish = async () => {
    if (!selectedTitle || !fromDate || !toDate) {
      setMessage("Please fill in all fields before publishing.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/publish", {
        title: selectedTitle,
        fromDate,
        toDate,
        published: 1,
      });

      setMessage(response.data.message || "Form published successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Error publishing form. Check console for details.");
    }
  };

  // Handle unpublish all forms
  const handleUnpublishAll = async () => {
    try {
      const response = await axios.get("http://localhost:4000/unpublish");
      setMessage(response.data.message || "All forms unpublished successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Error unpublishing all forms.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl border border-gray-100">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        📄 Form Publish Manager
      </h2>

      {/* Title Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-2">
          Select Form Title
        </label>
       <select
  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
  value={selectedTitle}
  onChange={(e) => setSelectedTitle(e.target.value)}
>
  <option value="">-- Select Title --</option>
  {titles.map((item, index) => (
    <option key={index} value={item}>
      {item}
    </option>
  ))}
</select>

      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            From Date
          </label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-2">
            To Date
          </label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePublish}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Publish
        </button>

        <button
          onClick={handleUnpublishAll}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Unpublish All
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mt-6 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-lg p-3">
          {message}
        </div>
      )}
    </div>
  );
};

export default PublishForm;
