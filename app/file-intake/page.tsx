'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';

interface PolicyData {
  PolicyName: string;
  ClaimAdministrator1: string;
}

export default function FileIntakePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [policyData, setPolicyData] = useState<PolicyData[]>([]);
  const [selectedPolicyHolder, setSelectedPolicyHolder] = useState<string>('');
  const [selectedClaimAdministrator, setSelectedClaimAdministrator] = useState<string>('');

  useEffect(() => {
    console.log('FileIntakePage component mounted');
    checkSupabaseConnection();
    fetchPolicyData();
  }, []);

  const checkSupabaseConnection = async () => {
    console.log('Checking Supabase connection...');
    try {
      const response = await fetch('/api/supabase-proxy?table=PlcPolicy');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Supabase connection successful. Sample data:', data.slice(0, 1));
    } catch (error) {
      console.error('Error checking Supabase connection:', error);
    }
  };

  const fetchPolicyData = async () => {
    console.log('Fetching policy data...');
    try {
      const response = await fetch('/api/supabase-proxy?table=PlcPolicy');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log('Raw fetched data from PlcPolicy table:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Number of rows in PlcPolicy table:', data.length);
        console.log('First row of data:', data[0]);
        setPolicyData(data);
      } else {
        console.log('No data found in PlcPolicy table or data is not an array');
      }
    } catch (error) {
      console.error('Error fetching policy data:', error);
    }
  };

  useEffect(() => {
    console.log('policyData updated:', policyData);
  }, [policyData]);

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
  };

  const handleCancel = () => {
    router.push('/');  // Redirect to the home page
  };

  const policyHolders = policyData.map(policy => policy.PolicyName);
  const claimAdministrators = policyData.map(policy => policy.ClaimAdministrator1).filter(Boolean);

  console.log('Rendering with policyHolders:', policyHolders);
  console.log('Rendering with claimAdministrators:', claimAdministrators);

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
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedPolicyHolder}
              onChange={(e) => setSelectedPolicyHolder(e.target.value)}
            >
              <option value="">Select...</option>
              {policyHolders.map((policyName, index) => (
                <option key={index} value={policyName}>
                  {policyName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Claim Administrator</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedClaimAdministrator}
              onChange={(e) => setSelectedClaimAdministrator(e.target.value)}
            >
              <option value="">Select...</option>
              {claimAdministrators.map((admin, index) => (
                <option key={index} value={admin}>
                  {admin}
                </option>
              ))}
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
