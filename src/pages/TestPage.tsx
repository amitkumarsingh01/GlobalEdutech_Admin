import React from 'react';
import { FileText } from 'lucide-react';

const TestPage: React.FC = () => (
  <div className="bg-white rounded-xl p-8 shadow-lg">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Management</h1>
    <div className="text-center py-16">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
        <FileText className="h-14 w-14 text-white" />
      </div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Test Section</h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
        This section is yet to be implemented. Here you'll be able to create comprehensive tests, 
        manage questions and answers, set time limits, view detailed results, and generate performance reports.
      </p>
      <div className="mt-8">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Coming Soon
        </button>
      </div>
    </div>
  </div>
);

export default TestPage;


