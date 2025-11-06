import React, { useEffect, useState } from "react";
import axios from "axios";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import $ from "jquery";

const List = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get("http://localhost:4000/formlist");
        setForms(response.data);
      } catch (err) {
        setError("Failed to load form list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

useEffect(() => {
  if (forms.length > 0) {
    if ($.fn.dataTable.isDataTable("#formsTable")) {
      $("#formsTable").DataTable().destroy();
    }
    setTimeout(() => {
      $("#formsTable").DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50, 100],
      });
    }, 0);
  }
}, [forms]);




 const handleDelete = async (title) => {
  if (!window.confirm("Are you sure you want to delete this form?")) return;

  try {
    // Destroy DataTable before React re-renders
    if ($.fn.dataTable.isDataTable("#formsTable")) {
      $("#formsTable").DataTable().destroy();
    }

    await axios.post("http://localhost:4000/removeform", { Title: title });

    // Update React state safely
    setForms((prevForms) => prevForms.filter((form) => form.title !== title));
  } catch (error) {
    alert("Failed to delete the form. Please try again.");
  }
};


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
        <p className="text-gray-500 text-lg animate-pulse">Loading forms...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 inline-block">
        Form List
      </h2>

      {forms.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">No forms found.</p>
      ) : (
      <div className="overflow-x-auto shadow-lg rounded-lg bg-white p-4 max-w-5xl mx-auto">
  <table
    id="formsTable"
    className="min-w-full border border-gray-200 display text-center"
  >
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Recorded By
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Recorded On
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-blue-50 transition duration-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 text-gray-700 font-medium">
                    {form.title}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {form.recordedBy}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(form.recordedOn).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleDelete(form.title)}
                      className="text-red-500 hover:text-red-700 transition duration-200"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;
