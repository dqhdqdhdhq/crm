import React from 'react';

export function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        🎉 App is Working!
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        This test page confirms that React is rendering correctly.
      </p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-blue-800">
          If you can see this, the basic app infrastructure is working.
        </p>
      </div>
    </div>
  );
} 