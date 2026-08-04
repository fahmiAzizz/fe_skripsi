import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [monthlySales, setMonthlySales] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );

  const generateMonthlyData = async () => {
    try {
      await axios.post(
        "http://localhost:4321/v1/monthlySaleSummary",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Gagal generate data:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        setMonthlySales([]);
        setMonthlySummary(null);

        await generateMonthlyData();
        await new Promise((resolve) => setTimeout(resolve, 500));

        const [itemRes, summaryRes] = await Promise.all([
          axios.get(
            `http://localhost:4321/v1/monthlySaleItem/date?month=${selectedMonth}&year=${selectedYear}`,
            { withCredentials: true }
          ),
          axios.get(
            `http://localhost:4321/v1/monthlySaleSummary/date?month=${selectedMonth}&year=${selectedYear}`,
            { withCredentials: true }
          ),
        ]);

        setMonthlySales(itemRes.data || []);
        setMonthlySummary(summaryRes.data || null);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setMonthlySales([]);
        setMonthlySummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const chartData = {
    labels: monthlySales.map((item) => item.item_name),
    datasets: [
      {
        label: "Jumlah Terjual",
        data: monthlySales.map((item) => item.total_amount),
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
          Bulan {selectedMonth} / {selectedYear}
        </p>
      </div>

      {/* SUMMARY + FILTER (SELALU TAMPIL) */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

          {/* Skeleton atau Data */}
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow animate-pulse"
              >
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Total Item</p>
                <h2 className="text-xl font-bold">
                  {monthlySummary?.total_amount ?? 0}
                </h2>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Revenue</p>
                <h2 className="text-xl font-bold text-green-600">
                  Rp{(monthlySummary?.total_revenue ?? 0).toLocaleString("id-ID")}
                </h2>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Cost</p>
                <h2 className="text-xl font-bold text-red-500">
                  Rp{(monthlySummary?.total_cost ?? 0).toLocaleString("id-ID")}
                </h2>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Margin</p>
                <h2 className="text-xl font-bold text-blue-600">
                  Rp{(monthlySummary?.total_margin ?? 0).toLocaleString("id-ID")}
                </h2>
              </div>
            </>
          )}

          {/* FILTER (SELALU ADA) */}
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Filter</p>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-1 m-1 rounded-lg w-full"
            >
              <option value="">Pilih Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-1 m-1 rounded-lg w-full"
            >
              <option value="">Pilih Tahun</option>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info jika kosong */}
        {!loading && !monthlySummary && (
          <p className="text-sm text-gray-400 mt-2">
            Data belum tersedia untuk bulan ini
          </p>
        )}
      </div>

      {/* CHART */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Grafik Penjualan per Item
        </h3>

        {loading ? (
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        ) : monthlySales.length > 0 ? (
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

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
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

            {monthlySales.length === 0 && (
              <p className="text-gray-500 text-center mt-4">
                Tidak ada data penjualan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}