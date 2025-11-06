import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
/* import './App.css' */

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

const newId = (prefix = "id") => `${prefix}_${Date.now()}_${Math.floor(Math.random()*10000)}`;

function FormPage({ onFormUpdate }) {
/*   const [themeColor, setThemeColor] = useState("#610461"); 

  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState("Untitled form"); */

  // Load from localStorage when component mounts
 /*  React.useEffect(() => {
    const saved = localStorage.getItem('formData');
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        setThemeColor(formData.themeColor || "#610461");
        setBlocks(formData.blocks || []);
        setTitle(formData.title || "Untitled form");
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    }
  }, []); */




   const location = useLocation();
  const [themeColor, setThemeColor] = useState("#610461");
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState("Untitled form");


  
   // Load from route state OR localStorage when component mounts
  React.useEffect(() => {
    // Check if we have state from navigation
    if (location.state && location.state.formData) {
      const formData = location.state.formData;
      setThemeColor(formData.themeColor || "#610461");
      setBlocks(formData.blocks || []);
      setTitle(formData.title || "Untitled form");
    } else {
      // Fall back to localStorage
      const saved = localStorage.getItem('formData');
      if (saved) {
        try {
          const formData = JSON.parse(saved);
          setThemeColor(formData.themeColor || "#610461");
          setBlocks(formData.blocks || []);
          setTitle(formData.title || "Untitled form");
        } catch (error) {
          console.error('Error loading form data:', error);
        }
      }
    }
  }, [location.state]);


  // Save to localStorage whenever form changes
  React.useEffect(() => {
    const formData = { themeColor, blocks, title };
    localStorage.setItem('formData', JSON.stringify(formData));
    
    // Also call onFormUpdate if provided
    if (onFormUpdate) {
      onFormUpdate(formData);
    }
  }, [themeColor, blocks, title, onFormUpdate]);

  const addQuestion = () => {
    const q = {
      id: newId("q"),
      type: "question",
      meta: {
        title: "Untitled Question",
        qtype: "Short answer",
        required: false,
        options: [
          { id: newId("opt"), text: "Option 1" },
          { id: newId("opt"), text: "Option 2" },
        ],
      },
    };
    setBlocks(prev => [...prev, q]);
  };

  const addImageBlock = () => {
    const b = {
      id: newId("img"),
      type: "image",
      meta: {
        src: null,
        alt: "",
      },
    };
    setBlocks(prev => [...prev, b]);
  };

  const addSection = () => {
    const s = {
      id: newId("sec"),
      type: "section",
      meta: {
        title: "Untitled Section",
      },
    };
    setBlocks(prev => [...prev, s]);
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const updateBlock = (id, patch) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, meta: { ...b.meta, ...patch } } : b));
  };

  const updateQuestion = (id, patch) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...b, meta: { ...b.meta, ...patch } };
    }));
  };

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-4" style={{backgroundColor: 'rgb(231, 227, 235)'}}>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl mx-2 sm:mx-4 md:mx-8">
          <FormHeader title={title} setTitle={setTitle} themeColor={themeColor} setThemeColor={setThemeColor} />
          
          <div className="relative mt-4 md:mt-6">
            <div id="form-body">
              {blocks.length === 0 && (
                <div className="text-center text-gray-500 py-8 md:py-12 px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <p className="text-sm md:text-base">No questions yet — use the toolbar to add one.</p>
                </div>
              )}

              {blocks.map((b, idx) => {
                if (b.type === 'question') return (
                  <QuestionCard key={b.id} block={b} remove={() => removeBlock(b.id)} update={updateQuestion} themeColor={themeColor} />
                );
                if (b.type === 'image') return (
                  <ImageBlock key={b.id} block={b} remove={() => removeBlock(b.id)} update={(patch) => updateBlock(b.id, patch)} />
                );
                if (b.type === 'section') return (
                  <SectionCard key={b.id} block={b} remove={() => removeBlock(b.id)} update={(patch) => updateBlock(b.id, patch)} themeColor={themeColor} />
                );
                return null;
              })}
            </div>

            {/* Modern Toolbar - Made responsive */}
            <Toolbar addQuestion={addQuestion} addImage={addImageBlock} addSection={addSection} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormHeader({ title, setTitle, themeColor, setThemeColor }){
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-t-4 border-l border-r border-b border-gray-100" style={{borderTopColor: themeColor}}>
      <div className="p-4 sm:p-6 md:p-8">
        <input
          className="w-full text-xl sm:text-2xl md:text-3xl font-semibold border-0 border-b-2 border-gray-200 pb-3 md:pb-4 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 bg-transparent placeholder-gray-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          aria-label="Form title"
          placeholder="Form title"
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 md:mt-6">
          <span className="text-xs sm:text-sm text-gray-500 font-medium">FORM HEADER</span>
          <div className="flex items-center gap-3">
            <label className="text-xs sm:text-sm text-gray-600 font-medium">Theme Color</label>
            <div className="relative">
              <input 
                type="color" 
                value={themeColor} 
                onChange={e => setThemeColor(e.target.value)} 
                className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-gray-300 rounded-lg sm:rounded-xl cursor-pointer shadow-sm"
                aria-label="Theme color" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ addQuestion, addImage, addSection }) {
  return (
    <div className="fixed bottom-6 right-6 z-10 lg:absolute lg:left-full lg:top-1/2 lg:transform lg:-translate-y-1/2 lg:ml-6 lg:bottom-auto lg:right-auto">
      <div className="flex flex-row lg:flex-col items-center bg-white shadow-xl rounded-2xl p-3 space-y-0 lg:space-y-4 space-x-3 lg:space-x-0 border border-gray-100">
        <button
          className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          title="Add Question"
          onClick={addQuestion}
          aria-label="Add question"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          title="Add Image"
          onClick={addImage}
          aria-label="Add image"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          title="Add Section"
          onClick={addSection}
          aria-label="Add section"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ block, remove, update, themeColor }){
  const { id, meta } = block;
  const setTitle = (v) => update(id, { title: v });
  const setType = (v) => update(id, { qtype: v });
  const toggleRequired = () => update(id, { required: !meta.required });

  const addOption = () => {
    const opts = meta.options ? [...meta.options, { id: newId('opt'), text: `Option ${meta.options.length + 1}` }] : [{ id: newId('opt'), text: 'Option 1' }];
    update(id, { options: opts });
  };
  const removeOption = (optId) => {
    update(id, { options: meta.options.filter(o => o.id !== optId) });
  };
  const updateOptionText = (optId, text) => {
    update(id, { options: meta.options.map(o => o.id === optId ? { ...o, text } : o) });
  };

  return (
    <div className="bg-white rounded-xl border-l-4 border border-gray-100 my-4 md:my-6 question-card shadow-sm hover:shadow-md transition-shadow" style={{borderLeftColor: themeColor}}>
      <div className="p-4 sm:p-6 md:p-8">
     

<div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
  {/* Large text input */}
  <input
    value={meta.title}
    onChange={(e) => setTitle(e.target.value)}
    className="flex-1 text-base sm:text-lg font-medium border-0 border-b-2 border-gray-200 pb-2 sm:pb-3 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 bg-transparent placeholder-gray-400"
    aria-label="Question title"
    placeholder="Question title"
  />

  {/* Small dropdown */}
  <select
    className="w-full lg:w-56 border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-medium text-sm sm:text-base"
    value={meta.qtype}
    onChange={(e) => setType(e.target.value)}
    aria-label="Question type"
  >
    {QUESTION_TYPES.map((t) => (
      <option key={t} value={t}>
        {t}
      </option>
    ))}
  </select>
</div>



        <div className="mt-4 md:mt-6">
          <QuestionBody meta={meta} addOption={addOption} removeOption={removeOption} updateOptionText={updateOptionText} updateQuestion={(patch)=>update(id, patch)} />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium"
              onClick={remove} 
              aria-label="Delete question"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 font-medium"
              onClick={() => update(id, { title: 'Untitled Question' })}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={meta.required} 
                onChange={toggleRequired} 
              />
              <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-all duration-200 ${meta.required ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 transform ${meta.required ? 'left-5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Required</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function QuestionBody({ meta, addOption, removeOption, updateOptionText, updateQuestion }){
  const qtype = meta.qtype;
    
  if (qtype === 'Short answer') {
    return <input className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" placeholder="Short answer text" readOnly />;
  }
  
  if (qtype === 'Paragraph') {
    return <textarea className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" placeholder="Long answer text" readOnly rows={3} />;
  }
  
  if (qtype === 'Multiple choice') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {meta.options?.map(opt => (
          <div className="flex items-center gap-3 sm:gap-4" key={opt.id}>
            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 rounded-full"></div>
            </div>
            <input 
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" 
              value={opt.text} 
              onChange={(e)=>updateOptionText(opt.id, e.target.value)} 
            />
            <button 
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300 text-sm"
              onClick={()=>removeOption(opt.id)} 
              aria-label="Remove option"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button 
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium text-sm sm:text-base"
          onClick={addOption}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add option
        </button>
      </div>
    );
  }
  
  if (qtype === 'Checkboxes') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {meta.options?.map(opt => (
          <div className="flex items-center gap-3 sm:gap-4" key={opt.id}>
            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 rounded"></div>
            </div>
            <input 
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" 
              value={opt.text} 
              onChange={(e)=>updateOptionText(opt.id, e.target.value)} 
            />
            <button 
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300 text-sm"
              onClick={()=>removeOption(opt.id)}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button 
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium text-sm sm:text-base"
          onClick={addOption}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add option
        </button>
      </div>
    );
  }
  
  if (qtype === 'Dropdown') {
    return (
      <div className="space-y-3 sm:space-y-4">
        <select className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 text-gray-500 font-medium text-sm sm:text-base" disabled>
          {meta.options?.map(o => <option key={o.id}>{o.text}</option>)}
        </select>
        {meta.options?.map(opt => (
          <div className="flex items-center gap-3 sm:gap-4" key={opt.id}>
            <input 
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" 
              value={opt.text} 
              onChange={(e)=>updateOptionText(opt.id, e.target.value)} 
            />
            <button 
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300 text-sm"
              onClick={()=>removeOption(opt.id)}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button 
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium text-sm sm:text-base"
          onClick={addOption}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add option
        </button>
      </div>
    );
  }
  if (qtype === 'File upload') {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-gray-400 transition-colors cursor-not-allowed">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-500 font-medium text-sm sm:text-base">File upload area</p>
      </div>
    );
  }
  
  if (qtype === 'Date') {
    return <input type="date" className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 text-gray-500 font-medium text-sm sm:text-base" disabled />;
  }
  
  if (qtype === 'Time') {
    return <input type="time" className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 text-gray-500 font-medium text-sm sm:text-base" disabled />;
  }

  return null;
}

function ImageBlock({ block, remove, update }){
  const { id, meta } = block;
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update({ src: ev.target.result, alt: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 my-4 md:my-6 image-block shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 hover:border-gray-400 transition-colors">
              <input 
                className="w-full focus:outline-none text-gray-900 text-sm sm:text-base" 
                type="file" 
                accept="image/*" 
                onChange={onFile} 
              />
            </div>
            <input 
              className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base" 
              placeholder="Image description" 
              value={meta.alt} 
              onChange={(e)=>update({ alt: e.target.value })} 
            />
          </div>
          <button 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium whitespace-nowrap mt-4 lg:mt-0"
            onClick={remove}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
        {meta.src && (
          <div className="mt-4 sm:mt-6 flex justify-center">
            <img src={meta.src} alt={meta.alt} className="max-w-full max-h-64 sm:max-h-80 md:max-h-96 rounded-xl shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ block, remove, update, themeColor }){
  const { id, meta } = block;
  return (
    <div className="bg-white rounded-xl border-t-4 border border-gray-100 my-4 md:my-6 shadow-sm hover:shadow-md transition-shadow" style={{borderTopColor: themeColor}}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <input 
            value={meta.title} 
            onChange={(e)=>update({ title: e.target.value })} 
            className="flex-1 text-lg sm:text-xl font-semibold border-0 border-b-2 border-gray-200 pb-2 sm:pb-3 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 bg-transparent placeholder-gray-400" 
            aria-label="Section title"
            placeholder="Section title"
          />
          <button 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium whitespace-nowrap mt-4 lg:mt-0"
            onClick={remove}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormPage;