'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

const predefinedColumns = [
  "Benefit Type", 
  "Claimant Name", 
  "DateOfBirth", 
  "Gender", 
  "Relation", 
  "GroupNo", 
  "MemberNo", 
  "ServiceBegDate",
  "ServiceEndDate", 
  "PaidDate", 
  "Provider TIN", 
  "Provider NPI", 
  "DiagnosisCode", 
  "ClaimNo",
  "Billed", 
  "Paid" 
];

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#7986CB', '#4DB6AC', '#FFD54F'
];

interface TemplateMappings {
  templateName: string;
  sheets: {
    sheetName: string;
    mappings: {
      [key: string]: string;
    };
  }[];
}

// Add this function at the top level of the file
export function setGlobalSavedTemplate(templateName: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('globalSavedTemplate', templateName);
  }
}

// Add this near the top of your file
const logNetworkRequest = async (url: string, options: RequestInit) => {
  console.log('Network request:', url, options);
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('Network response:', data);
  } catch (error) {
    console.error('Network error:', error);
  }
};

export default function PlaygroundPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMappingComplete, setIsMappingComplete] = useState(false);
  const [mappings, setMappings] = useState<{[sheet: string]: {[key: string]: string}}>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files);
      setFiles(uploadedFiles);

      if (uploadedFiles.length > 0 && uploadedFiles[0].type.includes('sheet')) {
        const file = uploadedFiles[0];
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        loadSheetData(wb, wb.SheetNames[0]);
        setIsModalOpen(true);
        // Initialize mappings for each sheet
        const initialMappings = wb.SheetNames.reduce((acc, sheet) => {
          acc[sheet] = {};
          return acc;
        }, {} as {[sheet: string]: {[key: string]: string}});
        setMappings(initialMappings);
      }
    }
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    
    // Get the used range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    let headerRowIndex = -1;
    let maxColumns = 0;
    
    // Find the first row with the maximum number of non-empty cells
    for (let R = range.s.r; R <= range.e.r; ++R) {
      let columnsInRow = 0;
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = {c: C, r: R};
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = worksheet[cellRef];
        if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
          columnsInRow++;
        }
      }
      if (columnsInRow > maxColumns) {
        maxColumns = columnsInRow;
        headerRowIndex = R;
      }
      // Don't break here, continue checking all rows
    }

    if (headerRowIndex === -1) {
      console.error('Could not find a header row');
      return;
    }

    console.log("Header row found at index:", headerRowIndex);  // For debugging

    // Extract column names from the header row
    const columns = [];
    for (let C = range.s.c; C < range.s.c + maxColumns; ++C) {
      const cellAddress = {c: C, r: headerRowIndex};
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];
      if (cell && cell.v !== undefined && cell.v !== null) {
        columns.push(cell.v.toString().trim());
      } else {
        columns.push(`Column ${C + 1}`);
      }
    }

    setColumns(columns);

    console.log("Extracted columns:", columns);  // For debugging
  };

  const handleSheetSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = event.target.value;
    setSelectedSheet(sheetName);
    if (workbook) {
      loadSheetData(workbook, sheetName);
    }
  };

  const handleColumnClick = (column: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setSelectedLeft(column);
    } else if (selectedLeft) {
      setMappings(prev => ({
        ...prev,
        [selectedSheet]: {
          ...prev[selectedSheet],
          [selectedLeft]: column
        }
      }));
      setSelectedLeft(null);
      drawLines();
    }
  };

  const drawLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentMappings = mappings[selectedSheet] || {};
    Object.entries(currentMappings).forEach(([left, right], index) => {
      const leftElem = document.getElementById(`left-${left}`);
      const rightElem = document.getElementById(`right-${right}`);
      if (leftElem && rightElem) {
        const leftRect = leftElem.getBoundingClientRect();
        const rightRect = rightElem.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const color = colors[index % colors.length];
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(leftRect.right - canvasRect.left, leftRect.top + leftRect.height / 2 - canvasRect.top);
        ctx.lineTo(rightRect.left - canvasRect.left, rightRect.top + rightRect.height / 2 - canvasRect.top);
        ctx.stroke();

        // Draw arrowhead
        const arrowSize = 10;
        const angle = Math.atan2(rightRect.top - leftRect.top, rightRect.left - leftRect.right);
        ctx.beginPath();
        ctx.moveTo(rightRect.left - canvasRect.left, rightRect.top + rightRect.height / 2 - canvasRect.top);
        ctx.lineTo(rightRect.left - canvasRect.left - arrowSize * Math.cos(angle - Math.PI / 6), rightRect.top + rightRect.height / 2 - canvasRect.top - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(rightRect.left - canvasRect.left - arrowSize * Math.cos(angle + Math.PI / 6), rightRect.top + rightRect.height / 2 - canvasRect.top - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  useEffect(() => {
    drawLines();
  }, [mappings, selectedSheet]);

  const closeModal = () => {
    setIsModalOpen(false);
    setIsMappingComplete(false);
    setMappings({});
    setSelectedLeft(null);
  };

  const completeMappingAndShowResults = () => {
    setIsMappingComplete(true);
  };

  const getColumnColor = (column: string, side: 'left' | 'right') => {
    const currentMappings = mappings[selectedSheet] || {};
    const index = side === 'left' 
      ? Object.keys(currentMappings).indexOf(column)
      : Object.values(currentMappings).indexOf(column);
    return index !== -1 ? colors[index % colors.length] : '';
  };

  const handleSheetClick = (sheet: string) => {
    setActiveSheet(sheet);
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const handleSaveToFileIntake = () => {
    // Implement the logic to save the file to file intake
    console.log('Saving file to file intake:', fileName);
    // You can add your actual save logic here
  };

  const handleSaveTemplate = async () => {
    console.log('Save Template button clicked');
    console.log('Template Name:', templateName);
    console.log('Mappings:', mappings);

    if (!templateName || templateName.trim() === '') {
      console.log('Template name is missing or empty');
      setFormError('Please enter a valid template name.');
      return;
    }

    if (Object.keys(mappings).length === 0) {
      console.log('Mappings are empty');
      setFormError('Please complete the mappings before saving.');
      return;
    }

    try {
      console.log('Attempting to save template to Supabase');
      console.log('Template data:', { template_name: templateName, mappings: mappings });

      const { data, error } = await supabase
        .from('claim_templates')
        .insert({ 
          template_name: templateName, 
          mappings: mappings
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        setFormError(`Failed to save template: ${error.message}`);
        throw error;
      }

      console.log('Template saved successfully:', data);
      setGlobalSavedTemplate(templateName);
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        setIsMappingComplete(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving template:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setFormError(`Error saving template: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        setFormError('An unknown error occurred while saving the template.');
      }
    }
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('claim_templates')
        .select('count(*)')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Supabase connection successful. Row count:', data?.count);
    } catch (error) {
      console.error('Supabase connection error:', error);
    }
  };

  // Make sure to call this function in useEffect
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Claim Ground</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">File Upload</h2>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">Excel files only</p>
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Uploaded File:</h3>
            <p className="text-gray-600">{files[0].name}</p>
          </div>
        )}
      </div>

      {isModalOpen && !isMappingComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-black">Map Excel Columns</h2>
            <div className="mb-6 pb-4 border-b border-gray-200">
              <label htmlFor="sheet-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Sheet:
              </label>
              <div className="relative">
                <select
                  id="sheet-select"
                  value={selectedSheet}
                  onChange={handleSheetSelect}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white border shadow-sm appearance-none text-black"
                >
                  {sheets.map((sheet, index) => (
                    <option key={index} value={sheet} className="text-black">
                      {sheet}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="w-1/2 pr-4">
                <h3 className="text-lg font-semibold mb-2 text-black">Excel Columns</h3>
                <ul className="space-y-2">
                  {columns.map((column, index) => {
                    const color = getColumnColor(column, 'left');
                    return (
                      <li 
                        key={index} 
                        id={`left-${column}`}
                        className={`cursor-pointer p-2 rounded text-black ${
                          color ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColumnClick(column, 'left')}
                      >
                        {column} {mappings[selectedSheet][column] && '➔'}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="w-1/2 pl-4">
                <h3 className="text-lg font-semibold mb-2 text-black">Predefined Columns</h3>
                <ul className="space-y-2">
                  {predefinedColumns.map((column, index) => {
                    const color = getColumnColor(column, 'right');
                    return (
                      <li 
                        key={index}
                        id={`right-${column}`}
                        className={`cursor-pointer p-2 rounded text-black ${
                          color ? 'text-white' : 'hover:bg-gray-100'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColumnClick(column, 'right')}
                      >
                        {column}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={completeMappingAndShowResults}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Mapping Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {isMappingComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-black">Mapping Successful</h2>
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2">
                {Object.keys(mappings).map((sheet) => (
                  <button
                    key={sheet}
                    className={`px-4 py-2 rounded-md ${
                      activeSheet === sheet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                    onClick={() => handleSheetClick(sheet)}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            </div>
            {activeSheet && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-black">Mapped Fields for {activeSheet}:</h3>
                <ul className="list-disc pl-5">
                  {Object.entries(mappings[activeSheet]).map(([excelColumn, predefinedColumn], index) => (
                    <li key={index} className="text-black">
                      {excelColumn} ➔ {predefinedColumn}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center space-x-4 mt-6">
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  console.log('Template name changed:', e.target.value);
                  setTemplateName(e.target.value);
                }}
                placeholder="Enter template name"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                disabled={!templateName}
              >
                Save Template
              </button>
              <button
                onClick={() => {
                  setIsMappingComplete(false);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
            {showSaveSuccess && (
              <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
                Template saved successfully!
              </div>
            )}
          </div>
        </div>
      )}
      {formError && (
        <div className="text-red-500 mt-2">{formError}</div>
      )}
    </div>
  );
}
