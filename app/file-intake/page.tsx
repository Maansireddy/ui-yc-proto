'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { setGlobalSavedTemplate } from '../playground/page';

interface PolicyData {
  PolicyName: string;
  ClaimAdministrator1: string;
  ClaimAdministrator2: string;
}

export default function FileIntakePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [confirmedTemplate, setConfirmedTemplate] = useState<string>('');
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [policyData, setPolicyData] = useState<PolicyData[]>([]);
  const [selectedPolicyHolder, setSelectedPolicyHolder] = useState<string>('');
  const [selectedClaimAdministrator, setSelectedClaimAdministrator] = useState<string>('');
  const [availableClaimAdministrators, setAvailableClaimAdministrators] = useState<string[]>([]);
  const [claimsPaidFrom, setClaimsPaidFrom] = useState<string>('');
  const [claimsPaidTo, setClaimsPaidTo] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isMappingComplete, setIsMappingComplete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mappings, setMappings] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  useEffect(() => {
    console.log('FileIntakePage component mounted');
    checkSupabaseConnection();
    fetchPolicyData();
    loadSavedTemplates();
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
    // Check for a saved template when opening the dialog
    const globalSavedTemplate = typeof window !== 'undefined' ? window.localStorage.getItem('globalSavedTemplate') : null;
    if (globalSavedTemplate && !savedTemplates.includes(globalSavedTemplate)) {
      setSavedTemplates(prev => [...prev, globalSavedTemplate]);
    }
    setShowSetupDialog(!showSetupDialog);
    if (!showSetupDialog) {
      setSelectedTemplate('');
    }
  };

  const selectTemplate = (template: string) => {
    setSelectedTemplate(template);
  };

  const confirmTemplateSelection = () => {
    setConfirmedTemplate(selectedTemplate);
    setShowSetupDialog(false);
  };

  const cancelTemplateSelection = () => {
    setSelectedTemplate('');
    setShowSetupDialog(false);
  };

  const handleCancel = () => {
    // Instead of navigating away, we'll just hide the form and show the Import button
    setShowImportForm(false);
    // Reset any form-related state if necessary
    setSelectedPolicyHolder('');
    setSelectedClaimAdministrator('');
    setConfirmedTemplate('');
    setClaimsPaidFrom('');
    setClaimsPaidTo('');
    setSelectedFile(null);
    setFormError('');
  };

  const handlePolicyHolderChange = (policyName: string) => {
    setSelectedPolicyHolder(policyName);
    setSelectedClaimAdministrator(''); // Reset the selected claim administrator

    const selectedPolicy = policyData.find(policy => policy.PolicyName === policyName);
    if (selectedPolicy) {
      const administrators = [
        selectedPolicy.ClaimAdministrator1,
        selectedPolicy.ClaimAdministrator2
      ].filter(Boolean); // Remove any undefined or empty values
      setAvailableClaimAdministrators(administrators);
    } else {
      setAvailableClaimAdministrators([]);
    }
  };

  const policyHolders = policyData.map(policy => policy.PolicyName);
  const claimAdministrators = policyData.map(policy => policy.ClaimAdministrator1).filter(Boolean);

  console.log('Rendering with policyHolders:', policyHolders);
  console.log('Rendering with availableClaimAdministrators:', availableClaimAdministrators);

  const handleUpload = () => {
    if (!selectedPolicyHolder || !selectedClaimAdministrator || !confirmedTemplate || !claimsPaidFrom || !claimsPaidTo || !selectedFile) {
      setFormError('Please fill in all required fields and select a file.');
      return;
    }
    if (new Date(claimsPaidFrom) > new Date(claimsPaidTo)) {
      setFormError('Claims Paid From date must be earlier than Claims Paid To date.');
      return;
    }
    setFormError('');
    // Proceed with upload logic here
    console.log('Uploading file...');
  };

  const handleSaveTemplate = async () => {
    if (fileName) {
      setIsSaving(true);
      try {
        const { data, error } = await supabase
          .from('claim_templates')
          .insert({ template_name: fileName, mappings: mappings })
          .select();

        if (error) throw error;

        console.log('Template saved successfully:', data);
        setGlobalSavedTemplate(fileName);
        setShowSaveSuccess(true);
        setSavedTemplates(prev => [...prev, fileName]);
        setTimeout(() => {
          setShowSaveSuccess(false);
          setIsMappingComplete(false);
          setIsModalOpen(false);
        }, 2000);
      } catch (error) {
        console.error('Error saving template:', error);
        setFormError('Failed to save template. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      setFormError('Please enter a file name before saving the template.');
    }
  };

  const handleImportClick = () => {
    setShowImportForm(true);
  };

  const loadSavedTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('claim_templates')
        .select('template_name');

      if (error) throw error;

      const templateNames = data.map(template => template.template_name);
      setSavedTemplates(templateNames);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!showImportForm && (
        <div className="mb-4">
          <Button 
            className="bg-blue-600 text-white"
            onClick={handleImportClick}
          >
            Import
          </Button>
        </div>
      )}

      {showImportForm ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-3xl mx-auto">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">Claim File Upload</h1>
            <div>
              <Button className="bg-white text-blue-600 text-sm mr-2" onClick={handleUpload}>Upload</Button>
              <Button className="bg-white text-blue-600 text-sm" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policyholder <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black"
                  value={selectedPolicyHolder}
                  onChange={(e) => handlePolicyHolderChange(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {policyHolders.map((policyName, index) => (
                    <option key={index} value={policyName}>{policyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Administrator <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black"
                  value={selectedClaimAdministrator}
                  onChange={(e) => setSelectedClaimAdministrator(e.target.value)}
                  disabled={!selectedPolicyHolder}
                  required
                >
                  <option value="">Select...</option>
                  {availableClaimAdministrators.map((admin, index) => (
                    <option key={index} value={admin}>{admin}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-grow mr-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Import Template <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black"
                  value={confirmedTemplate}
                  readOnly
                  placeholder="Select a template..."
                  required
                />
              </div>
              <Button 
                className="mt-5 bg-gray-200 text-gray-700 text-sm"
                onClick={toggleSetupDialog}
              >
                Setup
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claims Paid From <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black"
                  value={claimsPaidFrom}
                  onChange={(e) => setClaimsPaidFrom(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claims Paid To <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black"
                  value={claimsPaidTo}
                  onChange={(e) => setClaimsPaidTo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                <input type="date" className="w-full p-1.5 border border-gray-300 rounded-md text-sm text-black" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full p-1.5 border border-gray-300 rounded-md text-sm" rows={2}></textarea>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="claim-file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  required
                />
                <label htmlFor="claim-file" className="cursor-pointer">
                  <span className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1.5 rounded text-sm">
                    Choose File
                  </span>
                </label>
                {selectedFile && (
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3">Welcome to File Intake</h2>
          <p className="mb-3">Click the Import button above to start uploading a claim file.</p>
        </div>
      )}

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
                onClick={cancelTemplateSelection}
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

      {formError && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{formError}</div>
      )}

      {isMappingComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-black">Mapping Successful</h2>
            <p className="mb-4">Your mapping has been completed successfully.</p>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter template name"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md text-black"
            />
            <div className="flex justify-end">
              <Button 
                className="bg-green-600 text-white mr-2"
                onClick={handleSaveTemplate}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
              <Button 
                className="bg-gray-200 text-gray-700"
                onClick={() => {
                  setIsMappingComplete(false);
                  setIsModalOpen(false);
                }}
              >
                Close
              </Button>
            </div>
            {showSaveSuccess && (
              <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
                Template saved successfully!
              </div>
            )}
            {formError && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                {formError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
