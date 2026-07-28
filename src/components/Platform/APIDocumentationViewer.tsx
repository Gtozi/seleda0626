/**
 * API Documentation Viewer
 * Swagger/OpenAPI integration for viewing API documentation
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Globe,
  Search,
  FolderTree,
  FileText,
  CheckCircle,
  XCircle,
  Copy,
  Play,
  Lock,
  Unlock,
  Zap,
  Database,
  Settings,
  ChevronRight,
  ChevronDown,
  Download
} from 'lucide-react';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    contentType: string;
    schema: string;
  };
  responses: Array<{
    code: number;
    description: string;
    example?: string;
  }>;
  tags: string[];
  authenticated: boolean;
}

interface APICategory {
  name: string;
  endpoints: APIEndpoint[];
}

const mockAPIDoc: APICategory[] = [
  {
    name: 'Reservations',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/reservations',
        summary: 'List all reservations',
        description: 'Retrieve a paginated list of all reservations with optional filtering.',
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page (default: 20)' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'property_id', type: 'string', required: false, description: 'Filter by property' }
        ],
        responses: [
          { code: 200, description: 'Successfully retrieved reservations', example: '{"data": [...], "total": 100}' },
          { code: 401, description: 'Unauthorized' },
          { code: 403, description: 'Forbidden' }
        ],
        tags: ['reservations', 'read'],
        authenticated: true
      },
      {
        method: 'POST',
        path: '/api/v1/reservations',
        summary: 'Create reservation',
        description: 'Create a new reservation with guest details and room allocation.',
        requestBody: {
          contentType: 'application/json',
          schema: '{\n  "guest_name": "string",\n  "guest_email": "string",\n  "check_in": "date",\n  "check_out": "date",\n  "room_type_id": "string"\n}'
        },
        responses: [
          { code: 201, description: 'Reservation created successfully', example: '{"id": "RES-001", ...}' },
          { code: 400, description: 'Invalid request data' },
          { code: 409, description: 'Room not available' }
        ],
        tags: ['reservations', 'write'],
        authenticated: true
      },
      {
        method: 'GET',
        path: '/api/v1/reservations/{id}',
        summary: 'Get reservation by ID',
        description: 'Retrieve detailed information about a specific reservation.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Reservation ID' }
        ],
        responses: [
          { code: 200, description: 'Successfully retrieved reservation', example: '{...}' },
          { code: 404, description: 'Reservation not found' }
        ],
        tags: ['reservations', 'read'],
        authenticated: true
      }
    ]
  },
  {
    name: 'Guests',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/guests',
        summary: 'List all guests',
        description: 'Retrieve a list of all registered guests.',
        parameters: [
          { name: 'search', type: 'string', required: false, description: 'Search by name or email' },
          { name: 'loyalty_tier', type: 'string', required: false, description: 'Filter by loyalty tier' }
        ],
        responses: [
          { code: 200, description: 'Successfully retrieved guests' },
          { code: 401, description: 'Unauthorized' }
        ],
        tags: ['guests', 'read'],
        authenticated: true
      },
      {
        method: 'POST',
        path: '/api/v1/guests',
        summary: 'Create guest profile',
        description: 'Register a new guest profile in the system.',
        requestBody: {
          contentType: 'application/json',
          schema: '{\n  "first_name": "string",\n  "last_name": "string",\n  "email": "string",\n  "phone": "string"\n}'
        },
        responses: [
          { code: 201, description: 'Guest created successfully' },
          { code: 400, description: 'Invalid guest data' },
          { code: 409, description: 'Email already exists' }
        ],
        tags: ['guests', 'write'],
        authenticated: true
      }
    ]
  },
  {
    name: 'Rooms',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/rooms',
        summary: 'List available rooms',
        description: 'Get list of rooms with availability status.',
        parameters: [
          { name: 'property_id', type: 'string', required: false, description: 'Filter by property' },
          { name: 'room_type', type: 'string', required: false, description: 'Filter by room type' },
          { name: 'available_only', type: 'boolean', required: false, description: 'Show only available rooms' }
        ],
        responses: [
          { code: 200, description: 'Successfully retrieved rooms' }
        ],
        tags: ['rooms', 'read'],
        authenticated: true
      },
      {
        method: 'GET',
        path: '/api/v1/rooms/{id}',
        summary: 'Get room details',
        description: 'Retrieve detailed information about a specific room.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Room ID' }
        ],
        responses: [
          { code: 200, description: 'Successfully retrieved room details' },
          { code: 404, description: 'Room not found' }
        ],
        tags: ['rooms', 'read'],
        authenticated: true
      }
    ]
  },
  {
    name: 'Public',
    endpoints: [
      {
        method: 'GET',
        path: '/api/public/availability',
        summary: 'Check availability',
        description: 'Public endpoint to check room availability for given dates.',
        parameters: [
          { name: 'check_in', type: 'date', required: true, description: 'Check-in date' },
          { name: 'check_out', type: 'date', required: true, description: 'Check-out date' },
          { name: 'guests', type: 'integer', required: false, description: 'Number of guests' }
        ],
        responses: [
          { code: 200, description: 'Availability data returned', example: '{"available": true, "rooms": [...]}' }
        ],
        tags: ['public', 'availability'],
        authenticated: false
      },
      {
        method: 'POST',
        path: '/api/public/bookings',
        summary: 'Create booking',
        description: 'Public endpoint to create a new booking reservation.',
        requestBody: {
          contentType: 'application/json',
          schema: '{\n  "guest_details": {...},\n  "room_selection": {...},\n  "dates": {...}\n}'
        },
        responses: [
          { code: 201, description: 'Booking created successfully' },
          { code: 400, description: 'Invalid booking data' }
        ],
        tags: ['public', 'bookings'],
        authenticated: false
      }
    ]
  }
];

export default function APIDocumentationViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>(mockAPIDoc[0].name);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([mockAPIDoc[0].name]));

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[method as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = mockAPIDoc.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(endpoint =>
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.endpoints.length > 0);

  const currentCategory = mockAPIDoc.find(c => c.name === selectedCategory);
  const currentEndpoints = selectedEndpoint ? [selectedEndpoint] : (currentCategory?.endpoints || []);

  return (
    <div className="space-y-6 animate-fade-in" id="api-documentation">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">API Documentation</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Download size={14} /> Download OpenAPI Spec
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xs text-white flex items-center gap-2">
            <Globe size={14} /> View on Swagger UI
          </button>
        </div>
      </div>

      {/* API Info */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Hotel ERP API</h3>
            <p className="text-sm text-white/80 mb-3">RESTful API for hotel management operations including reservations, guests, rooms, and public booking.</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                <Zap size={12} /> v2.1.0
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                <Globe size={12} /> https://api.hotel-erp.com
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                <Database size={12} /> REST
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree size={16} className="text-purple-500" />
              Endpoints
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</span>
                  {expandedCategories.has(category.name) ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>
                {expandedCategories.has(category.name) && (
                  <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                    {category.endpoints.map((endpoint) => (
                      <button
                        key={endpoint.path}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setSelectedEndpoint(endpoint);
                        }}
                        className={`w-full p-3 pl-4 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors ${
                          selectedEndpoint?.path === endpoint.path ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{endpoint.path}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel - Endpoint Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEndpoint ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
              {/* Endpoint Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-xs font-black ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedEndpoint.summary}</h3>
                    <code className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded">
                      {selectedEndpoint.path}
                    </code>
                  </div>
                  {selectedEndpoint.authenticated ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                      <Lock size={12} /> Auth Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                      <Unlock size={12} /> Public
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEndpoint.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  {selectedEndpoint.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Settings size={16} className="text-purple-500" />
                    Parameters
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="text-left p-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Name</th>
                          <th className="text-left p-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Type</th>
                          <th className="text-left p-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Required</th>
                          <th className="text-left p-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEndpoint.parameters.map((param) => (
                          <tr key={param.name} className="border-b border-slate-100 dark:border-slate-900">
                            <td className="p-2">
                              <code className="text-xs font-bold text-purple-600 dark:text-purple-400">{param.name}</code>
                            </td>
                            <td className="p-2 text-xs text-slate-600 dark:text-slate-400">{param.type}</td>
                            <td className="p-2">
                              {param.required ? (
                                <CheckCircle size={14} className="text-emerald-500" />
                              ) : (
                                <XCircle size={14} className="text-slate-300 dark:text-slate-700" />
                              )}
                            </td>
                            <td className="p-2 text-xs text-slate-600 dark:text-slate-400">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Request Body */}
              {selectedEndpoint.requestBody && (
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    Request Body
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 relative group">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                      {selectedEndpoint.requestBody.schema}
                    </pre>
                    <button className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy size={14} className="text-slate-500" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Content-Type: <code className="text-purple-600 dark:text-purple-400">{selectedEndpoint.requestBody.contentType}</code>
                  </div>
                </div>
              )}

              {/* Responses */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Responses
                </h4>
                <div className="space-y-3">
                  {selectedEndpoint.responses.map((response) => (
                    <div key={response.code} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-black ${
                          response.code < 300 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          response.code < 400 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {response.code}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{response.description}</span>
                      </div>
                      {response.example && (
                        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 relative group">
                          <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                            {response.example}
                          </pre>
                          <button className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-950 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={14} className="text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Try It Out */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2">
                  <Play size={14} /> Try it out
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-12 text-center">
              <Code size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select an Endpoint</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose an endpoint from the sidebar to view its documentation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
