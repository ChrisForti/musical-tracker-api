import React, { useState } from "react";

interface APIEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: string;
  example: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: "GET",
    endpoint: "/v2/musical",
    description: "Retrieve all verified musicals available to the public",
    parameters: [
      {
        name: "verified",
        type: "boolean",
        required: false,
        description: "Filter by verification status (default: all)"
      }
    ],
    response: "Array of musical objects with title, composer, lyricist, genre, synopsis, and image information",
    example: `[
  {
    "id": 1,
    "title": "Hamilton",
    "composer": "Lin-Manuel Miranda",
    "lyricist": "Lin-Manuel Miranda",
    "genre": "Historical",
    "synopsis": "The story of Alexander Hamilton...",
    "imageUrl": "https://example.com/hamilton.jpg",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]`
  },
  {
    method: "GET",
    endpoint: "/v2/musical/{id}",
    description: "Get detailed information about a specific musical",
    parameters: [
      {
        name: "id",
        type: "number",
        required: true,
        description: "The unique identifier of the musical"
      }
    ],
    response: "Musical object with complete details including roles and upcoming performances",
    example: `{
  "id": 1,
  "title": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "genre": "Historical",
  "synopsis": "The story of Alexander Hamilton...",
  "imageUrl": "https://example.com/hamilton.jpg",
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: "GET",
    endpoint: "/v2/actor",
    description: "Retrieve all verified actors available to the public",
    response: "Array of actor objects with name, bio, and profile information",
    example: `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Experienced theater performer...",
    "profileImageUrl": "https://example.com/john.jpg",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]`
  },
  {
    method: "GET",
    endpoint: "/v2/actor/{id}",
    description: "Get detailed information about a specific actor",
    parameters: [
      {
        name: "id",
        type: "number",
        required: true,
        description: "The unique identifier of the actor"
      }
    ],
    response: "Actor object with complete profile information",
    example: `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Experienced theater performer with over 10 years...",
  "profileImageUrl": "https://example.com/john.jpg",
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: "GET",
    endpoint: "/v2/performance",
    description: "Retrieve all performances with theater and musical information",
    response: "Array of performance objects with date, time, theater, and musical details",
    example: `[
  {
    "id": 1,
    "date": "2024-06-15",
    "time": "19:30",
    "musicalId": 1,
    "theaterId": 1,
    "theater": {
      "name": "Broadway Theater",
      "city": "New York",
      "address": "123 Broadway Ave"
    },
    "musical": {
      "title": "Hamilton",
      "composer": "Lin-Manuel Miranda"
    }
  }
]`
  },
  {
    method: "GET",
    endpoint: "/v2/theater",
    description: "Retrieve all verified theaters",
    response: "Array of theater objects with name, location, and contact information",
    example: `[
  {
    "id": 1,
    "name": "Broadway Theater",
    "city": "New York",
    "address": "123 Broadway Ave",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]`
  },
  {
    method: "GET",
    endpoint: "/v2/role",
    description: "Retrieve character roles for musicals",
    response: "Array of role objects with character names and musical associations",
    example: `[
  {
    "id": 1,
    "characterName": "Alexander Hamilton",
    "musicalId": 1,
    "musical": {
      "title": "Hamilton",
      "composer": "Lin-Manuel Miranda"
    }
  }
]`
  },
  {
    method: "GET",
    endpoint: "/v2/casting",
    description: "Retrieve casting information linking actors to roles in performances",
    response: "Array of casting objects showing which actors play which roles",
    example: `[
  {
    "id": 1,
    "actorId": 1,
    "roleId": 1,
    "performanceId": 1,
    "actor": {
      "name": "John Doe"
    },
    "role": {
      "characterName": "Alexander Hamilton"
    }
  }
]`
  }
];

export const PublicAPIDocumentation: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  const baseURL = "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Musical Tracker API Documentation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Public API endpoints for accessing musical theater data. All endpoints return JSON and require no authentication for public data.
          </p>
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 mb-8 lg:mb-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Navigation
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection("overview")}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    activeSection === "overview"
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection("endpoints")}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    activeSection === "endpoints"
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  API Endpoints
                </button>
                <button
                  onClick={() => setActiveSection("examples")}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    activeSection === "examples"
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Examples
                </button>
                <button
                  onClick={() => setActiveSection("support")}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    activeSection === "support"
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Support
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeSection === "overview" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  API Overview
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Base URL
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md font-mono text-sm">
                      {baseURL}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Response Format
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      All API endpoints return JSON formatted responses. Successful requests return a 200 status code with the requested data.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                      <pre className="text-sm text-gray-800 dark:text-gray-200">
{`{
  "success": true,
  "data": [...],
  "message": "Data retrieved successfully"
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Rate Limiting
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Currently, there are no rate limits on public API endpoints. However, please use the API responsibly to ensure good performance for all users.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Data Availability
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Public endpoints only return verified data that has been approved by administrators:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>Musicals must be verified to appear in public results</li>
                      <li>Actors must be verified to have public profiles</li>
                      <li>Theaters must be verified to appear in public listings</li>
                      <li>Performance data is available for all verified entities</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "endpoints" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  API Endpoints
                </h2>
                
                <div className="space-y-6">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            endpoint.method === "GET"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <button
                          onClick={() => setSelectedEndpoint(selectedEndpoint?.endpoint === endpoint.endpoint ? null : endpoint)}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-500 text-sm font-medium"
                        >
                          {selectedEndpoint?.endpoint === endpoint.endpoint ? "Hide Details" : "Show Details"}
                        </button>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {endpoint.description}
                      </p>

                      {selectedEndpoint?.endpoint === endpoint.endpoint && (
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {endpoint.parameters && (
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Parameters:</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <div key={paramIndex} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {param.name}
                                      </code>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({param.type})
                                      </span>
                                      {param.required && (
                                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {param.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Response:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {endpoint.response}
                            </p>
                            <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-md overflow-x-auto">
                              <pre className="text-sm text-green-400">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "examples" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Usage Examples
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Fetch All Musicals
                    </h3>
                    <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`// JavaScript/Fetch
fetch('${baseURL}/v2/musical')
  .then(response => response.json())
  .then(data => console.log(data));

// cURL
curl -X GET "${baseURL}/v2/musical"`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Search for Specific Musical
                    </h3>
                    <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`// JavaScript/Fetch
fetch('${baseURL}/v2/musical/1')
  .then(response => response.json())
  .then(musical => {
    console.log('Musical:', musical.title);
    console.log('Composer:', musical.composer);
  });

// cURL
curl -X GET "${baseURL}/v2/musical/1"`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Get Upcoming Performances
                    </h3>
                    <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`// JavaScript/Fetch - Filter for future performances
fetch('${baseURL}/v2/performance')
  .then(response => response.json())
  .then(performances => {
    const upcoming = performances.filter(p => 
      new Date(p.date) > new Date()
    );
    console.log('Upcoming performances:', upcoming.length);
  });`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Build a Musical Directory
                    </h3>
                    <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`// React Component Example
import React, { useState, useEffect } from 'react';

function MusicalDirectory() {
  const [musicals, setMusicals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('${baseURL}/v2/musical')
      .then(response => response.json())
      .then(data => {
        setMusicals(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {musicals.map(musical => (
        <div key={musical.id}>
          <h3>{musical.title}</h3>
          <p>by {musical.composer}</p>
          <p>{musical.genre}</p>
        </div>
      ))}
    </div>
  );
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "support" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Support & Resources
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Common Issues
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-4 rounded-md">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          CORS Issues
                        </h4>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          If you're making requests from a browser, ensure your domain is allowed. Contact support for CORS configuration.
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded-md">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Empty Results
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          Only verified content appears in public API responses. If you expect data that's not showing, it may need admin approval.
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-4 rounded-md">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                          404 Errors
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          Check that you're using the correct endpoint paths. All public endpoints are prefixed with '/v2/'.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Best Practices
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                      <li>Cache responses when possible to reduce API calls</li>
                      <li>Handle errors gracefully and provide fallback content</li>
                      <li>Respect the verification status of content</li>
                      <li>Use appropriate HTTP status code handling</li>
                      <li>Implement loading states for better user experience</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        For technical support or questions about the API:
                      </p>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Email: api-support@musicaltracker.com</li>
                        <li>• Documentation: This page</li>
                        <li>• Status: Check our homepage for service status</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contributing Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Want to add your musical, theater, or performance to our database?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/login"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                      >
                        Create Account
                      </a>
                      <a
                        href="/public/musicals"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Browse Current Data
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};