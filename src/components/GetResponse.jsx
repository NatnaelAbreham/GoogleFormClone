import React, { useEffect, useState } from "react";
import axios from "axios";


import * as XLSX from "xlsx";



export default function GetResponse() {
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [fileBasePath, setFileBasePath] = useState("");

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;


  const exportToExcel = () => {
  // Convert rows + headers into worksheet format
  const excelData = rows.map((row) => {
    const formattedRow = {};
    headers.forEach((h) => {
      formattedRow[h.label] = row[h.id] || "";
    });
    return formattedRow;
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  // Trigger file download
  XLSX.writeFile(workbook, "Vacancy_Applications.xlsx");
};

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get("http://10.13.10.21:8087/viewrecord");
        const { title, data, fileBasePath } = res.data;
        setFileBasePath(fileBasePath);

        let formJson;
        try {
          formJson = JSON.parse(title);
        } catch {
          throw new Error("Failed to parse title JSON");
        }

        const questionBlocks = formJson.responses?.blocks || [];
        const headersList = questionBlocks
          .filter((b) => b.type === "question")
          .map((b) => ({ id: b.id, label: b.meta?.title || "Untitled Question" }));

        headersList.unshift({ id: "date", label: "Recorded Date" });
        headersList.push({ id: "file", label: "File" });

        setHeaders(headersList);

        const parsedRows = data.map((item) => {
          const obj = typeof item === "string" ? JSON.parse(item) : item;
          const responses = obj.responses?.responses || {};
          const fileKey = Object.keys(responses).find((k) =>
            typeof responses[k] === "string" &&
            responses[k].match(/\.(pdf|docx|jpg|png)$/i)
          );
          const fileName = fileKey ? responses[fileKey] : null;

          return {
            date: obj.date || "—",
            ...responses,
            file: fileName,
          };
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

  const getFileUrl = (fileName) => (fileName && fileBasePath ? fileBasePath + fileName : "#");

  // Enhanced download function that forces download
  const handleDownload = async (fileName) => {
    if (!fileName) return;

    try {
      const fileUrl = getFileUrl(fileName);
      
      // Method 1: Using fetch to force download
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // This forces download with the original filename
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Open in new tab if download fails
      window.open(getFileUrl(fileName), '_blank');
    }
  };

  // Alternative simpler download function (uncomment if you prefer this approach)
  /*
  const handleDownload = (fileName) => {
    if (!fileName) return;
    
    const fileUrl = getFileUrl(fileName);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // This attribute forces download
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  */

  // Search filter
  const filteredRows = rows.filter((row) =>
    headers.some((h) =>
      String(row[h.id] || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen  p-6" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          <strong>Error:</strong> {error}
        </div>
      ) : !headers.length || !rows.length ? (
        <div className=" rounded-xl shadow-sm p-8 text-center text-gray-500 max-w-2xl mx-auto">
          No data available.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-white" >
          <div className=" rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
                Vacancy Applications
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredRows.length} records)
                </span>
              </h2>
              

              <div className="flex space-x-3">
    <button
      onClick={exportToExcel}
       className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                            
    >
       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
      Export to Excel
    </button>

   
  


              {/* Search input */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">

              <table className="min-w-full divide-y divide-gray-200">
                <thead >

                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h.id}
                        onClick={() => requestSort(h.id)}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150 group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{h.label}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {sortConfig.key === h.id ? (
                              sortConfig.direction === "asc" ? (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className=" divide-y divide-gray-100">
                  {paginatedRows.map((row, i) => (
                    <tr 
  key={i} 
  className="transition-all duration-200 hover:bg-blue-50"
  style={i % 2 !== 0 ? { backgroundColor: 'rgba(239, 240, 241, 1)' } : {}}
>

                      {headers.map((h) => (
                        <td key={h.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {h.id === "file" ? (
                            row.file ? (
                              <div className="flex space-x-2">
                                <a
                                  href={getFileUrl(row.file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </a>
                               {/*  <button
                                  onClick={() => handleDownload(row.file)}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download
                                </button> */}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <div className="max-w-xs truncate" title={row[h.id] ? String(row[h.id]).replace("opt_", "") : "—"}>
                              {row[h.id] ? String(row[h.id]).replace("opt_", "").slice(0, 80) : "—"}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, filteredRows.length)}
                </span>{" "}
                of <span className="font-semibold">{filteredRows.length}</span> results
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300  text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300  text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                      currentPage === page
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300  text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300  text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300  text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}