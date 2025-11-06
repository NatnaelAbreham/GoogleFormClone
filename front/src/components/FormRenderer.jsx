import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const SUBMIT_URL = "http://10.13.10.21:8087/insertrecord";
let GLOBAL_FORM_TITLE = "";

const normalizeFormData = (data) => {
  if (!data) return { formTitle: "No form", blocks: [] };
  
  if (data.responses && data.responses.blocks) {
    return {
      formTitle: data.formTitle || "Untitled Form",
      themeColor: data.responses.themeColor || "#3b82f6",
      blocks: data.responses.blocks || []
    };
  }
  
  if (data.blocks) {
    return {
      formTitle: data.formTitle || "Untitled Form",
      themeColor: data.themeColor || "#3b82f6",
      blocks: data.blocks
    };
  }
  
  return { formTitle: "No form", blocks: [] };
};

const FormRenderer = () => {
  /* const navigate = useNavigate();
 const navigate = useNavigate();
  const location = useLocation(); */


  const navigate = useNavigate(); 

  const [formData, setFormData] = useState(null);
  const [formResponses, setFormResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

 useEffect(() => {
  setLoading(true);

  axios
    .get("http://10.13.10.21:8087/forms")
    .then((res) => {
      const result = res.data?.result;

      if (!result || !result.jsonFile) {
        setFormData({ formTitle: "No published form", blocks: [] });
        setLoading(false);
        return;
      }
 GLOBAL_FORM_TITLE = result.title || "";
      let parsedData;

      try {
        parsedData = JSON.parse(result.jsonFile);
      } catch (err) {
        console.error("Failed to parse form JSON:", err);
        setFormData({ formTitle: "Invalid form data", blocks: [] });
        setLoading(false);
        return;
      }

      const normalized = normalizeFormData(parsedData);
      setFormData(normalized);

      // Initialize responses with proper unique IDs
      const initialResponses = {};
      (normalized.blocks || []).forEach((block, index) => {
        if (block.type === "question") {
          const fid = block.meta?.id || block.id || `question-${index}`;
          if (fid) {
            initialResponses[fid] =
              block.meta?.qtype === "Checkboxes" ? [] : "";
          }
        }
      });

      setFormResponses(initialResponses);
    })
    .catch((err) => {
      console.error("Error fetching form:", err);
      setMessage({
        type: "error",
        text: "Failed to load form. Check console.",
      });
    })
    .finally(() => setLoading(false));
}, []);

  const getSections = () => {
    if (!formData?.blocks) return [];
    
    const sections = [];
    let currentSectionBlocks = [];
    
    formData.blocks.forEach(block => {
      if (block.type === 'section') {
        if (currentSectionBlocks.length > 0) {
          sections.push(currentSectionBlocks);
        }
        currentSectionBlocks = [block];
      } else {
        currentSectionBlocks.push(block);
      }
    });
    
    if (currentSectionBlocks.length > 0) {
      sections.push(currentSectionBlocks);
    }
    
    return sections;
  };

  const sections = getSections();

  const handleInputChange = (blockId, value) => {
    console.log("Updating field:", blockId, "with value:", value);
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

  const validate = () => {
    const newErrors = {};
    sections.forEach(section => {
      section.forEach(block => {
        if (block.type === 'question' && block.meta?.required) {
          // Use the same ID generation logic as in initialization
          const fid = block.meta?.id || block.id || `question-${block.key}`;
          const value = formResponses[fid];
          const qtype = block.meta?.qtype;

          if (qtype === 'Checkboxes') {
            if (!value || !Array.isArray(value) || value.length === 0) {
              newErrors[fid] = "This field is required.";
            }
          } else {
            if (!value || String(value).trim() === "") {
              newErrors[fid] = "This field is required.";
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const getOptionText = (blockId, optionId) => {
  // Find the block using the same ID logic as your formResponses
  const block = formData.blocks.find(
    (b) => (b.meta?.id || b.id) === blockId
  );
  if (!block) return optionId;

  // Check if block has options
  if (!block.meta?.options) return optionId;

  // Find the option by ID
  const option = block.meta.options.find(o => o.id === optionId);
  return option ? option.text : optionId; // use `text`, not `label`
};

  
const handleSubmit = async (ev) => {
  ev.preventDefault();

  if (!validate()) {
    setMessage({ type: "error", text: "Please fix the validation errors." });
    return;
  }

  setSubmitting(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("title", GLOBAL_FORM_TITLE);
    formDataToSend.append("submittedAt", new Date().toISOString());

    // Collect JSON-like text + files
    const responsesCopy = {};

  Object.entries(formResponses).forEach(([key, value]) => {
  const block = formData.blocks.find(
    b => (b.meta?.id || b.id) === key
  );
  const qtype = block?.meta?.qtype;

  if (value?.file) {
    // File upload
    formDataToSend.append("files", value.file);
    formDataToSend.append("fileName", value.fileName);
    responsesCopy[key] = value.fileName;
  }
  else if (qtype === "Checkboxes" && Array.isArray(value)) {
    responsesCopy[key] = value.map(optId => getOptionText(key, optId));
  }
  else if (qtype === "Multiple choice" || qtype === "Dropdown") {
    responsesCopy[key] = getOptionText(key, value);
  }
  else {
    responsesCopy[key] = value;
  }
});



    formDataToSend.append(
      "jsonFile",
      JSON.stringify({
        formTitle: formData.formTitle,
        responses: responsesCopy,
      })
    );

    const res = await axios.post(SUBMIT_URL, formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    //setMessage({ type: "success", text: res.data?.message || "Submitted successfully." });

 navigate("/dashboard/success", {
  state: {
    formTitle: formData.formTitle,
    themeColor: formData.themeColor
  }
});


  } catch (err) {
    console.error("Submit error:", err);
    setMessage({ type: "error", text: err?.response?.data?.message || "Submission failed." });
  } finally {
    setSubmitting(false);
  }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center w-full max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading form...</h2>
          <p className="text-gray-500">Please wait while we load your form.</p>
        </div>
      </div>
    );
  }

  if (!formData || !formData.blocks || formData.blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center w-full max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{formData?.formTitle || "No Form Data"}</h2>
          <p className="text-gray-500">No fields to display.</p>
        </div>
      </div>
    );
  }

  const { themeColor, formTitle } = formData;

  return (
    <div className="min-h-screen w-full flex justify-center" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      <div className="w-full max-w-4xl mx-4 sm:mx-6 lg:mx-8 py-4 md:py-8">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6 w-full">
          <div className="p-4 md:p-8">
            <div 
              className="h-2 rounded-t-lg mb-4 md:mb-6 w-full" 
              style={{ backgroundColor: themeColor }}
            ></div>
            <h1 className="text-xl md:text-2xl font-normal text-gray-900 mb-2 break-words w-full">
              {formTitle || "Untitled form"}
            </h1>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 w-full">
              <p className="text-red-500 text-sm">* Indicates required question</p>
              {sections.length > 1 && (
                <div className="text-sm text-gray-500">
                  Section {currentSection + 1} of {sections.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {sections.length > 1 && (
          <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 w-full">
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

        <form onSubmit={handleSubmit} className="w-full">
          {/* Current Section Content */}
          {sections.length === 0 ? (
            <div className="text-center text-gray-500 py-8 md:py-12 bg-white rounded-lg shadow-sm border border-gray-200 w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              No questions in this form yet.
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6 w-full">
              {sections[currentSection].map((block, index) => {
                // Create a consistent unique ID for each block
                const blockKey = block.meta?.id || block.id || `${block.type}-${index}`;
                // Use the same logic to get the field ID for form responses
                const fieldId = block.meta?.id || block.id || `question-${index}`;

                if (block.type === 'question') {
                  return (
                    <QuestionCard 
                      key={blockKey}
                      block={block} 
                      themeColor={themeColor}
                      value={formResponses[fieldId]}
                      onChange={(value) => handleInputChange(fieldId, value)}
                      onOptionChange={(optionId, isChecked) => handleOptionChange(fieldId, optionId, isChecked)}
                      error={errors[fieldId]}
                    />
                  );
                }

                if (block.type === 'image') {
                  return <ImageBlock key={blockKey} block={block} />;
                }

                if (block.type === 'section') {
                  return <SectionCard key={blockKey} block={block} themeColor={themeColor} />;
                }

                return null;
              })}
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg w-full ${
              message.type === "error" ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"
            }`}>
              {message.text}
            </div>
          )}

          {/* Navigation Buttons */}
          {sections.length > 0 && (
            <div className="mt-6 md:mt-8 flex justify-between items-center gap-4 w-full">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className={`px-6 py-3 md:px-8 md:py-4 text-base font-medium rounded-lg transition-all flex-1 max-w-48 ${
                  currentSection === 0 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                Previous
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 md:px-8 md:py-4 text-white text-base font-medium rounded-lg hover:shadow-md transition-shadow flex-1 max-w-48"
                  style={{ backgroundColor: themeColor }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 md:px-8 md:py-4 text-white text-base font-medium rounded-lg hover:shadow-md transition-shadow flex-1 max-w-48 disabled:opacity-60"
                  style={{ backgroundColor: themeColor }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Helper Components (keep the same as before)
function QuestionCard({ block, themeColor, value, onChange, onOptionChange, error }) {
  const { meta } = block;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 w-full">
      <div className="mb-4 md:mb-6">
        <label className="block text-lg font-medium text-gray-900 mb-2">
          {meta?.title || "Untitled Question"}
          {meta?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {meta?.description && (
          <p className="text-gray-600 text-sm mt-1">{meta.description}</p>
        )}
      </div>

      <QuestionBody 
        meta={meta} 
        value={value}
        onChange={onChange}
        onOptionChange={onOptionChange}
        themeColor={themeColor}
        error={error}
      />
      
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function QuestionBody({ meta, value, onChange, onOptionChange, themeColor, error }) {
  const qtype = meta?.qtype;
  
  if (qtype === 'Short answer') {
    return (
      <input 
        type="text"
        className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
        }`} 
        placeholder="Your answer"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Paragraph') {
    return (
      <textarea 
        className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
        }`} 
        placeholder="Your answer"
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Multiple choice') {
    return (
      <div className="space-y-3 md:space-y-4">
        {meta?.options?.map(opt => (
          <div className="flex items-center gap-4" key={opt.id}>
            <input 
              type="radio"
              name={`question-${meta.id}`}
              value={opt.id}
              checked={value === opt.id}
              onChange={(e) => onChange(opt.id)}
              className="w-5 h-5"
              style={{ accentColor: themeColor }}
            />
            <label className="text-gray-900 text-base cursor-pointer">{opt.text}</label>
          </div>
        ))}
      </div>
    );
  }
  
  if (qtype === 'Checkboxes') {
    return (
      <div className="space-y-3 md:space-y-4">
        {meta?.options?.map(opt => (
          <div className="flex items-center gap-4" key={opt.id}>
            <input 
              type="checkbox"
              value={opt.id}
              checked={value?.includes(opt.id) || false}
              onChange={(e) => onOptionChange(opt.id, e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: themeColor }}
            />
            <label className="text-gray-900 text-base cursor-pointer">{opt.text}</label>
          </div>
        ))}
      </div>
    );
  }
  
  if (qtype === 'Dropdown') {
    return (
      <select 
        className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none bg-white text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
        }`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose an option</option>
        {meta?.options?.map(o => (
          <option key={o.id} value={o.id}>{o.text}</option>
        ))}
      </select>
    );
  }
  
if (qtype === 'File upload') {
  const [fileName, setFileName] = useState(value || "");
const [fileObj, setFileObj] = useState(null); // ✅ make sure this line exists and is inside the component

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10 MB.');
      return;
    }

    // Generate unique name
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const extension = selectedFile.name.split('.').pop();
    const newFileName = `${baseName}_${timestamp}_${randomSuffix}.${extension}`;

    //setFileName(newFileName);
    //onChange(newFileName); // store only the file name in formResponses
    //onChange({ fileName: newFileName, file: selectedFile });

    setFileName(baseName);
    setFileObj(selectedFile);
    onChange({ fileName: newFileName, file: selectedFile }); // send both
  };

  const removeFile = () => {
    setFileName("");
    onChange("");
    const fileInput = document.getElementById(`file-input-${meta.id}`);
    if (fileInput) fileInput.value = null;
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 relative">
      <input
        id={`file-input-${meta.id}`}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />
      {!fileName ? (
        <div
          className="cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={() => document.getElementById(`file-input-${meta.id}`).click()}
        >
          <p>Click to upload your PDF file</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-800 mb-2">{fileName}</p>
          <button
            type="button"
            onClick={removeFile}
            className="text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}




  
  if (qtype === 'Date') {
    return (
      <input 
        type="date" 
        className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none bg-white text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
        }`} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  
  if (qtype === 'Time') {
    return (
      <input 
        type="time" 
        className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none bg-white text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
        }`} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="text-gray-500 text-base p-4 bg-gray-100 rounded-lg">
      Unsupported question type: {qtype}
    </div>
  );
}

function ImageBlock({ block }) {
  const { meta } = block;

  if (!meta?.src) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 w-full">
      <div className="flex justify-center">
        <img 
          src={meta.src} 
          alt={meta.alt} 
          className="w-full max-w-4xl rounded-lg object-contain max-h-96 md:max-h-[500px]"
        />
      </div>
      {meta.alt && (
        <p className="text-center text-gray-600 text-sm md:text-base mt-3">{meta.alt}</p>
      )}
    </div>
  );
}

function SectionCard({ block, themeColor }) {
  const { meta } = block;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 w-full">
      <h2 
        className="text-xl md:text-2xl font-semibold text-gray-900 border-l-4 pl-4 md:pl-6 py-2"
        style={{ borderLeftColor: themeColor }}
      >
        {meta?.title || "Untitled Section"}
      </h2>
      {meta?.description && (
        <p className="text-gray-600 mt-3 pl-4 md:pl-6">{meta.description}</p>
      )}
    </div>
  );
}

export default FormRenderer;