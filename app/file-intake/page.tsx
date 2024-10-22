'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';

// Mock data for templates
const templates = [
  "Template 1",
  "Template 2",
  "Template 3",
  "Template 4",
  "Template 5",
];

export default function FileIntakePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);

  useEffect(() => {
    // Load saved templates from local storage
    const templates = JSON.parse(localStorage.getItem('savedTemplates') || '{}');
    setSavedTemplates(Object.keys(templates));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const toggleSetupDialog = () => {
    setShowSetupDialog(!showSetupDialog);
  };

  const selectTemplate = (template: string) => {
    setSelectedTemplate(template);
  };

  const confirmTemplateSelection = () => {
    setShowSetupDialog(false);
    // The selected template is already set in the state
  };

  const handleCancel = () => {
    router.push('/');  // Redirect to the home page
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Claim File Upload</h1>
          <div>
            <Button className="bg-white text-blue-600 mr-2">Upload</Button>
            <Button className="bg-white text-blue-600" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Policyholder</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Claim Administrator</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>Select...</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <div className="mb-4 flex items-center">
            <div className="flex-grow mr-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Claim Import Template</label>
              <input 
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                value={selectedTemplate}
                readOnly
                placeholder="Select a template..."
              />
            </div>
            <Button 
              className="mt-6 bg-gray-200 text-gray-700"
              onClick={toggleSetupDialog}
            >
              Setup
            </Button>
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Claims Paid From</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Claims Paid To</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Received Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full p-2 border border-gray-300 rounded-md" rows={3}></textarea>
          </div>
          <div>
            <input
              type="file"
              id="claim-file"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="claim-file">
              <Button className="bg-gray-200 text-gray-700">
                Claim File
              </Button>
            </label>
            {selectedFile && <span className="ml-2">{selectedFile.name}</span>}
          </div>
        </div>
      </div>

      {showSetupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-black">Setup Claim Import Template</h2>
            <h3 className="text-lg font-semibold mb-2 text-black">Available Templates</h3>
            <select
              className="w-full p-2 mb-4 border border-gray-300 rounded-md text-black"
              value={selectedTemplate}
              onChange={(e) => selectTemplate(e.target.value)}
            >
              <option value="" disabled>Select a template</option>
              {savedTemplates.map((template, index) => (
                <option key={index} value={template} className="text-black">
                  {template}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <Button 
                className="bg-gray-200 text-gray-700 mr-2"
                onClick={toggleSetupDialog}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 text-white"
                onClick={confirmTemplateSelection}
                disabled={!selectedTemplate}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
