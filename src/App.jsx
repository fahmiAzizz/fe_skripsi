import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [monthlySales, setMonthlySales] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const monthQuery = query.get("month");
  const yearQuery = query.get("year");

  const now = new Date();
  const effectiveMonth = monthQuery ?? String(now.getMonth() + 1);
  const effectiveYear = yearQuery ?? String(now.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, summaryRes] = await Promise.all([
          axios.get(`http://localhost:4321/v1/monthlySaleItem/date?month=${effectiveMonth}&year=${effectiveYear}`, {
            withCredentials: true,
          }),
          axios.get(`http://localhost:4321/v1/monthlySaleSummary/date?month=${effectiveMonth}&year=${effectiveYear}`, {
            withCredentials: true,
          }),
        ]);

        setMonthlySales(itemRes.data);
        setMonthlySummary(summaryRes.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, [effectiveMonth, effectiveYear]);

  const chartData = {
    labels: monthlySales.map(item => item.item_name),
    datasets: [
      {
        label: "Jumlah Terjual",
        data: monthlySales.map(item => item.total_amount),
        backgroundColor: "#4CAF50",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Penjualan
        </h1>
        <p className="text-gray-500">
          Bulan {effectiveMonth} / {effectiveYear}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {monthlySummary && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Total Item</p>
            <h2 className="text-xl font-bold">{monthlySummary.total_amount}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Revenue</p>
            <h2 className="text-xl font-bold text-green-600">
              Rp{monthlySummary.total_revenue.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Cost</p>
            <h2 className="text-xl font-bold text-red-500">
              Rp{monthlySummary.total_cost.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Margin</p>
            <h2 className="text-xl font-bold text-blue-600">
              Rp{monthlySummary.total_margin.toLocaleString("id-ID")}
            </h2>
          </div>

        </div>
      )}

      {/* CHART */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Grafik Penjualan per Item
        </h3>

        {monthlySales.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p className="text-gray-500">Tidak ada data penjualan.</p>
        )}
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">
          Detail Penjualan
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Revenue</th>
                <th className="p-2 border">Cost</th>
                <th className="p-2 border">Margin</th>
              </tr>
            </thead>
            <tbody>
              {monthlySales.map((item, i) => (
                <tr key={i} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{item.item_name}</td>
                  <td className="p-2 border">{item.total_amount}</td>
                  <td className="p-2 border">
                    Rp{item.total_revenue.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 border">
                    Rp{item.total_cost.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 border">
                    Rp{item.total_margin.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}