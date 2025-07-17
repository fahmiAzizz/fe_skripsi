import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4321/v1/dailySaleItem", {
      withCredentials: true
    })
      .then(response => setSalesData(response.data))
      .catch(error => console.error("Error fetching sales data:", error));
  }, []);

  // Filter hanya data bulan ini
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthData = salesData.filter(sale => {
    if (!sale.date) return false;
    const saleDate = new Date(sale.date);
    return (
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  // Group data berdasarkan item
  const groupedData = currentMonthData.reduce((acc, sale) => {
    if (!acc[sale.item_name]) {
      acc[sale.item_name] = { amount: 0, income: 0 };
    }
    acc[sale.item_name].amount += sale.amount;
    acc[sale.item_name].income += sale.income;
    return acc;
  }, {});

  const items = Object.keys(groupedData);
  const amounts = items.map(item => groupedData[item].amount);
  const incomes = items.map(item => groupedData[item].income);

  const filteredData = currentMonthData.filter(sale => sale.date !== null);

  const incomeByDateMap = filteredData.reduce((acc, sale) => {
    const dateStr = new Date(sale.date).toISOString().split("T")[0]; // yyyy-mm-dd
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr] += sale.income;
    return acc;
  }, {});

  const sortedDates = Object.keys(incomeByDateMap).sort((a, b) => new Date(a) - new Date(b));
  const incomePerDate = sortedDates.map(date => incomeByDateMap[date]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 Dashboard Penjualan</h2>

      {/* Bar Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold mb-2">Jumlah Penjualan per Item (Bulan Ini)</h3>
        <Bar data={{
          labels: items,
          datasets: [{
            label: "Jumlah Terjual",
            data: amounts,
            backgroundColor: "#4CAF50",
          }]
        }} />
      </div>

      {/* Line Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Pendapatan Harian (Bulan Ini)</h3>
        <Line data={{
          labels: sortedDates.map(d => new Date(d).toLocaleDateString("id-ID")),
          datasets: [{
            label: "Pendapatan",
            data: incomePerDate,
            borderColor: "#FF9800",
            fill: false,
          }]
        }} />
      </div>
    </div>
  );
}
