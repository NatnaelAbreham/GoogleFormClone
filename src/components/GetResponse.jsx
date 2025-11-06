import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GetResponse() {
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get("http://localhost:4000/viewrecord");
        const { title, data } = res.data;

        let formJson;
        try {
          formJson = JSON.parse(title);
        } catch {
          throw new Error("Failed to parse title JSON");
        }

        const questionBlocks = formJson.responses?.blocks || [];
        const headersList = questionBlocks
          .filter((b) => b.type === "question")
          .map((b) => ({
            id: b.id,
            label: b.meta?.title || "Untitled Question",
          }));

        setHeaders(headersList);

        const parsedRows = data.map((item) => {
          try {
            const obj = JSON.parse(item);
            return obj.responses || {};
          } catch {
            return {};
          }
        });

        setRows(parsedRows);
      } catch (err) {
        console.error("Failed to load responses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "rgb(231, 227, 235)",
        minHeight: "100vh", // ensures full-screen coverage
        padding: "1.5rem",
      }}
    >
      {loading ? (
        <div>Loading responses...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : !headers.length || !rows.length ? (
        <div>No data available.</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Vacancy Applications</h2>

          <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {headers.map((h, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {headers.map((h, j) => (
                      <td key={j} className="px-4 py-2 text-sm text-gray-800">
                        {row[h.id]
                          ? String(row[h.id]).replace("opt_", "").slice(0, 80)
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
