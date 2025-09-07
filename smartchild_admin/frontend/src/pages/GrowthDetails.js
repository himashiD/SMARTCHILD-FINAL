import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, TrendingUp, Calendar, User, Ruler, Weight, Activity } from "lucide-react";
import "../styles/growthdetails.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

export default function ChildGrowthHistory() {
  const { id } = useParams(); // child_id
  const [child, setChild] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/growth`, {
          params: { child_id: id, page, limit }
        });
        setChild(data.child || null);
        setRows(data.items || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, page]);

  const pages = Math.max(1, Math.ceil(total / limit));

  // Get BMI status color
  const getBMIStatus = (bmi) => {
    if (!bmi) return { color: 'text-gray-500', status: 'N/A' };
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { color: 'text-blue-600', status: 'Underweight' };
    if (bmiNum < 25) return { color: 'text-green-600', status: 'Normal' };
    if (bmiNum < 30) return { color: 'text-yellow-600', status: 'Overweight' };
    return { color: 'text-red-600', status: 'Obese' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading growth data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Growth Monitoring</h1>
                {child && (
                  <p className="text-lg text-gray-600 mt-1">
                    <User className="w-5 h-5 inline mr-2" />
                    {child.name}
                  </p>
                )}
              </div>
            </div>
            <Link 
              to={`/ViewChild/${id}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Child
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-blue-600">{total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Latest Height</p>
                <p className="text-3xl font-bold text-green-600">
                  {rows[0]?.height ? `${rows[0].height} cm` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Ruler className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Latest Weight</p>
                <p className="text-3xl font-bold text-purple-600">
                  {rows[0]?.weight ? `${rows[0].weight} kg` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Weight className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Records Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Growth Records History
            </h3>
            <p className="text-gray-600 mt-1">Complete timeline of growth measurements</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recorded By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Height</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BMI</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((g, i) => {
                  const bmiStatus = getBMIStatus(g.bmi);
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {(page - 1) * limit + i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {(g.insert_date || "").slice(0, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {g.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900">{g.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                          <Ruler className="w-4 h-4 mr-1" />
                          {g.height} cm
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
                          <Weight className="w-4 h-4 mr-1" />
                          {g.weight} kg
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{g.bmi}</div>
                          <div className={`text-xs font-medium ${bmiStatus.color}`}>
                            {bmiStatus.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(g.insert_date).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Growth Records</h3>
                        <p className="text-gray-600">No growth measurements have been recorded yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} records
            </div>
            <div className="flex items-center space-x-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(5, pages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2 + i, pages - 4 + i));
                  if (pageNum > pages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}