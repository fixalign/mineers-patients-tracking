"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RevenueStats {
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  totalOwedToUs?: number;
  totalOwedToPatients?: number;
  proceduresCount: number;
}

interface ServiceStats {
  service_id: string | null;
  service_name: string;
  total_revenue: number;
  total_paid: number;
  total_balance: number;
  total_owed_to_us: number;
  total_owed_to_patients: number;
  procedure_count: number;
}

interface PatientStats {
  patient_id: string;
  patient_name: string;
  total_revenue: number;
  total_paid: number;
  total_balance: number;
  total_owed_to_us: number;
  total_owed_to_patients: number;
  procedure_count: number;
}

export default function StatsPage() {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();

      setRevenueStats(data.revenue);
      setServiceStats(data.services);
      setPatientStats(data.patients);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col items-center justify-center gap-4 min-h-64">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-lg">Loading statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Revenue & Statistics
          </h1>
        </div>

        {/* Overall Revenue Stats */}
        {revenueStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                ${revenueStats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Paid
              </h3>
              <p className="text-3xl font-bold text-green-600">
                ${revenueStats.totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Owed To Us
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                ${(revenueStats.totalOwedToUs || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Owed To Patients
              </h3>
              <p className="text-3xl font-bold text-red-600">
                ${(revenueStats.totalOwedToPatients || 0).toFixed(2)}
              </p>
            </div>
            {/* <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Net Balance
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                ${revenueStats.totalBalance.toFixed(2)}
              </p>
            </div> */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Procedures
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {revenueStats.proceduresCount}
              </p>
            </div>
          </div>
        )}

        {/* Service Statistics */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Revenue by Service
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              See which services generate the most revenue
            </p>
          </div>

          {/* Visual Revenue Distribution */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Revenue Distribution
            </h3>
            <div className="space-y-4">
              {serviceStats.map((service, index) => {
                const totalRevenue = serviceStats.reduce(
                  (sum, s) => sum + s.total_revenue,
                  0
                );
                const percentage =
                  totalRevenue > 0
                    ? (service.total_revenue / totalRevenue) * 100
                    : 0;
                const colors = [
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-pink-500",
                  "bg-indigo-500",
                  "bg-red-500",
                  "bg-teal-500",
                ];
                const barColor = colors[index % colors.length];

                return (
                  <div
                    key={service.service_id || `no-service-${index}`}
                    className="flex items-center gap-4"
                  >
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {service.service_name || "No Service"}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`${barColor} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage >= 15 && (
                            <span className="text-white text-xs font-bold">
                              {percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-32 shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${service.total_revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Procedures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Collection Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceStats.map((service, index) => {
                  const collectionRate =
                    service.total_revenue > 0
                      ? (service.total_paid / service.total_revenue) * 100
                      : 0;
                  return (
                    <tr key={service.service_id || `no-service-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.service_name || "No Service"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {service.procedure_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${service.total_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${service.total_paid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${collectionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {collectionRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Top Patients by Revenue
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patients with the highest outstanding balances
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Procedures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Payment Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientStats.map((patient) => {
                  const paymentRate =
                    patient.total_revenue > 0
                      ? (patient.total_paid / patient.total_revenue) * 100
                      : 0;
                  return (
                    <tr key={patient.patient_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link
                          href={`/patients/${patient.patient_id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {patient.patient_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.procedure_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${patient.total_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${patient.total_paid.toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          patient.total_balance > 0
                            ? "text-orange-600"
                            : patient.total_balance < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        ${patient.total_balance >= 0 ? "" : "-"}
                        {Math.abs(patient.total_balance).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${paymentRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {paymentRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
