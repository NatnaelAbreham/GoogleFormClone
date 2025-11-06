import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const QUESTION_TYPES = [
  "Short answer",
  "Paragraph",
  "Multiple choice",
  "Checkboxes",
  "Dropdown",
  "File upload",
  "Date",
  "Time",
];

function ViewPage({ formData }) {
  const [localFormData, setLocalFormData] = useState(null);
  const [formResponses, setFormResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState("");
  const navigate = useNavigate();


const handleClearState = () => {
  localStorage.removeItem("formData");
  localStorage.removeItem("formSubmissions");

  setLocalFormData(null);
  setFormResponses({});
  setCurrentSection(0);

  navigate("/dashboard/form");
};





  React.useEffect(() => {
    if (formData) {
      setLocalFormData(formData);
    } else {
      const saved = localStorage.getItem('formData');
      if (saved) {
        setLocalFormData(JSON.parse(saved));
      }
    }
  }, [formData]);

  // Group blocks into sections
  const getSections = () => {
    if (!localFormData?.blocks) return [];
    
    const sections = [];
    let currentSectionBlocks = [];
    
    localFormData.blocks.forEach(block => {
      if (block.type === 'section') {
        // Push previous section if it has blocks
        if (currentSectionBlocks.length > 0) {
          sections.push(currentSectionBlocks);
        }
        // Start new section with the section block
        currentSectionBlocks = [block];
      } else {
        currentSectionBlocks.push(block);
      }
    });
    
    // Push the last section
    if (currentSectionBlocks.length > 0) {
      sections.push(currentSectionBlocks);
    }
    
    return sections;
  };

  const sections = getSections();

 const handleInputChange = (blockId, value) => {
  console.log("Updating", blockId, "→", value);
  setFormResponses(prev => ({
    ...prev,
    [blockId]: value
  }));
};


  const handleOptionChange = (blockId, optionId, isChecked) => {
    setFormResponses(prev => {
      const currentResponse = prev[blockId] || [];
      if (isChecked) {
        return {
          ...prev,
          [blockId]: [...currentResponse, optionId]
        };
      } else {
        return {
          ...prev,
          [blockId]: currentResponse.filter(id => id !== optionId)
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
  if (!submissionTitle.trim()) {
    alert("Please enter a title before saving.");
    return;
  }

  // Build payload that matches StoreForm model
  const submissionData = {
    title: submissionTitle, // corresponds to StoreForm.Title
    jsonFile: JSON.stringify({
      formTitle: localFormData.title,
      responses: formData,
      submittedAt: new Date().toISOString()
    }) // corresponds to StoreForm.JsonFile
  };

  console.log("Form submission payload:", submissionData);

  // Save locally (optional)
  const existingSubmissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
  const updatedSubmissions = [...existingSubmissions, submissionData];
  localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));

  try {
    // Adjust URL based on your controller route
    const response = await axios.post("http://10.13.10.21:8087/insertform", submissionData);

    console.log("Saved successfully:", response.data);
    alert("Form saved successfully!");

    // Reset form and modal
    setShowModal(false);
    setSubmissionTitle("");
    setFormResponses({});
    setCurrentSection(0);
  } catch (error) {
    console.error("Error saving submission:", error.response?.data || error.message);
    alert("Error saving form. Check console for details.");
  }
};


  const handleModalCancel = () => {
    setSubmissionTitle("");
    setShowModal(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  if (!localFormData) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center bg-gray-50" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Form Data</h2>
          <p className="text-gray-500">Please create a form first to view it.</p>
        </div>
      </div>
    );
  }

  const { themeColor, title } = localFormData;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 relative" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl mx-4 md:mx-8">
          {/* Form Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
            <div className="p-4 md:p-8">
              <div 
                className="h-2 rounded-t-lg mb-4 md:mb-6" 
                style={{ backgroundColor: themeColor }}
              ></div>
              <h1 className="text-lg md:text-xl font-normal text-gray-900 mb-2 break-words">
                {title || "Untitled form"}
              </h1>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <p className="text-red-500 text-sm">* Indicates required question</p>
                <div className="text-sm text-gray-500">
                  Section {currentSection + 1} of {sections.length}
                </div>

                <button
    onClick={handleClearState}
    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
  >
    Clear Form
  </button>

              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {sections.length > 1 && (
            <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentSection + 1) / sections.length) * 100}%`,
                    backgroundColor: themeColor 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Current Section Content */}
          {sections.length === 0 ? (
            <div className="text-center text-gray-500 py-8 md:py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              No questions in this form yet.
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {sections[currentSection].map((block, index) => {
  const blockKey = block.meta?.id || block.id || `${block.type}-${index}`;

  if (block.type === 'question') {
    return (
      <ViewQuestionCard 
        key={blockKey} 
        block={block} 
        themeColor={themeColor}
        value={formResponses[block.meta?.id]}
        onChange={(value) => handleInputChange(block.meta?.id, value)}
        onOptionChange={(optionId, isChecked) => handleOptionChange(block.meta?.id, optionId, isChecked)}
      />
    );
  }

  if (block.type === 'image') {
    return <ViewImageBlock key={blockKey} block={block} />;
  }

  if (block.type === 'section') {
    return <ViewSectionCard key={blockKey} block={block} themeColor={themeColor} />;
  }

  return null;
})}

            </div>
          )}

          {/* Navigation Buttons */}
          {sections.length > 0 && (
            <div className="mt-4 md:mt-6 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-md transition-all flex-1 max-w-32 ${
                  currentSection === 0 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 md:px-6 md:py-3 text-white text-sm md:text-base font-medium rounded-md hover:shadow-md transition-shadow flex-1 max-w-32"
                  style={{ backgroundColor: themeColor }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 md:px-6 md:py-3 text-white text-sm md:text-base font-medium rounded-md hover:shadow-md transition-shadow flex-1 max-w-32"
                  style={{ backgroundColor: themeColor }}
                >
                  Save Form
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Save Form Submission
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Title
              </label>
              <input
                type="text"
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
                placeholder="Enter a title for this submission"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-1">
                This will help you identify this submission later
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleModalCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                disabled={!submissionTitle.trim()}
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  !submissionTitle.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                style={submissionTitle.trim() ? { backgroundColor: themeColor } : {}}
              >
                Save Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// The rest of your components (ViewQuestionCard, ViewQuestionBody, ViewImageBlock, ViewSectionCard) remain exactly the same...
function ViewQuestionCard({ block, themeColor, value, onChange, onOptionChange }) {
  const { meta } = block;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="mb-3 md:mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {meta.title}
          {meta.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      <ViewQuestionBody 
        meta={meta} 
        value={value}
        onChange={onChange}
        onOptionChange={onOptionChange}
        themeColor={themeColor}
      />
    </div>
  );
}

function ViewQuestionBody({ meta, value, onChange, onOptionChange, themeColor }) {
  const qtype = meta.qtype;
  
  if (qtype === 'Short answer') {
    return (
      <input 
        type="text"
        className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm md:text-base" 
        placeholder="Your answer"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Paragraph') {
    return (
      <textarea 
        className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm md:text-base" 
        placeholder="Your answer"
        rows={3}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Multiple choice') {
    return (
      <div className="space-y-2 md:space-y-3">
        {meta.options?.map(opt => (
          <div className="flex items-center gap-3" key={opt.id}>
            <input 
              type="radio"
              name={`question-${meta.id}`}
              value={opt.id}
              checked={value === opt.id}
              onChange={(e) => onChange(opt.id)}
              className="w-4 h-4"
              style={{ accentColor: themeColor }}
            />
            <label className="text-gray-900 text-sm md:text-base">{opt.text}</label>
          </div>
        ))}
      </div>
    );
  }
  
  if (qtype === 'Checkboxes') {
    return (
      <div className="space-y-2 md:space-y-3">
        {meta.options?.map(opt => (
          <div className="flex items-center gap-3" key={opt.id}>
            <input 
              type="checkbox"
              value={opt.id}
              checked={value?.includes(opt.id) || false}
              onChange={(e) => onOptionChange(opt.id, e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: themeColor }}
            />
            <label className="text-gray-900 text-sm md:text-base">{opt.text}</label>
          </div>
        ))}
      </div>
    );
  }
  
  if (qtype === 'Dropdown') {
    return (
      <select 
        className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none focus:border-blue-500 bg-white text-sm md:text-base"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose</option>
        {meta.options?.map(o => (
          <option key={o.id} value={o.id}>{o.text}</option>
        ))}
      </select>
    );
  }
  
  if (qtype === 'File upload') {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 md:p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
        <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-500 font-medium text-sm md:text-base">Add file</p>
        <p className="text-xs md:text-sm text-gray-400 mt-1">or drag and drop</p>
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => onChange(e.target.files[0])}
        />
      </div>
    );
  }
  
  if (qtype === 'Date') {
    return (
      <input 
        type="date" 
        className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none focus:border-blue-500 bg-white text-sm md:text-base" 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Time') {
    return (
      <input 
        type="time" 
        className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none focus:border-blue-500 bg-white text-sm md:text-base" 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return null;
}

function ViewImageBlock({ block }) {
  const { meta } = block;

  if (!meta.src) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex justify-center">
        <img src={meta.src} alt={meta.alt} className="max-w-full max-h-64 md:max-h-96 rounded-md" />
      </div>
      {meta.alt && (
        <p className="text-center text-gray-600 text-xs md:text-sm mt-2">{meta.alt}</p>
      )}
    </div>
  );
}

function ViewSectionCard({ block, themeColor }) {
  const { meta } = block;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <h2 
        className="text-lg md:text-xl font-normal text-gray-900 border-t-4 pt-3 md:pt-4"
        style={{ borderTopColor: themeColor }}
      >
        {meta.title}
      </h2>
    </div>
  );
}

export default ViewPage;