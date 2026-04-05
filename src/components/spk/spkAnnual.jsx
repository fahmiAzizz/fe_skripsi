import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SPKAnnuallyChart() {
    const [sales, setSales] = useState([]);
    const today = new Date();
    const [year, setYear] = useState(String(today.getFullYear()));
    const [chartType, setChartType] = useState("bar");
    const [spkType, setSpkType] = useState("best-item");
    const [type, setType] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            await updateDataAnnualSale();
            if (year) {
                await fetchSales();
            }
        };

        fetchData();
    }, [year, spkType, type]);

    const fetchSales = async () => {
        if (!year || !spkType) return;

        try {
            const response = await axios.post(
                `http://localhost:4321/v1/annualSaleItem/spk/${spkType}?year=${year}&type=${type}`,
                {},
                { withCredentials: true }
            );
            setSales(response.data);
        } catch (error) {
            console.error("Gagal ambil data:", error.response || error);
        }
    };

    const updateDataAnnualSale = async () => {
        try {
            await axios.post(
                `http://localhost:4321/v1/annualSaleItem`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Gagal update data:", error.response || error);
        }
    };

    const getSpkTitle = () => {
        let title = "";
        switch (spkType) {
            case "best-item":
                title = " Ranking Produk Terbaik";
            case "worst-item":
                title = "Ranking Produk Terburuk";
            case "featured-item":
                title = "Ranking Produk Rekomendasi";
            default:
                title = "Ranking Produk";
        }
        if (type === "FOOD") return title + " (Food)";
        if (type === "DRINK") return title + " (Drink)";
        return title + " (Semua)";
    };

    // ==========================
    // 🔥 TAMBAHAN PRINT KHUSUS
    // ==========================
    const handlePrintReport = () => {
        const printWindow = window.open("", "_blank");

        const sortedData = [...sales].sort((a, b) => a.rank - b.rank);

        const html = `
        <html>
        <head>
            <title>Laporan SPK</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h1, h3 { text-align: center; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid black;
                    padding: 6px;
                    text-align: center;
                    font-size: 12px;
                }
                th { background: #eee; }
            </style>
        </head>
        <body>

            <h1>LAPORAN SPK PENJUALAN</h1>v b  
            <p><b>Tahun:</b> ${year}</p>
            <p><b>Jenis:</b> ${getSpkTitle()}</p>

            <h3>Ranking Produk</h3>
            <ol>
                ${sortedData.map(item => `
                    <li>${item.item_name} - Score: ${item.score.toFixed(4)} (Rank ${item.rank})</li>
                `).join("")}
            </ol>

            <h3>Detail Data</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Amount</th>
                        <th>Revenue</th>
                        <th>Cost</th>
                        <th>Margin</th>
                        <th>Preference</th>
                        <th>Score</th>
                        <th>Rank</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedData.map(item => `
                        <tr>
                            <td>${item.item_name}</td>
                            <td>${item.total_amount}</td>
                            <td>Rp${item.total_revenue.toLocaleString("id-ID")}</td>
                            <td>Rp${item.total_cost.toLocaleString("id-ID")}</td>
                            <td>Rp${item.total_margin.toLocaleString("id-ID")}</td>
                            <td>${item.preference.toFixed(4)}</td>
                            <td>${item.score.toFixed(4)}</td>
                            <td>${item.rank}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

        </body>
        </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const chartDataBar = {
        labels: sales.map(item => item.item_name),
        datasets: [
            {
                label: "Score",
                data: sales.map(item => item.score),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const optionsBar = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const item = sales[context.dataIndex];
                        return [
                            `Score: ${item.score.toFixed(2)}`,
                            `Margin: Rp${item.total_margin.toLocaleString("id-ID")}`,
                            `Cost: Rp${item.total_cost.toLocaleString("id-ID")}`,
                            `Amount: ${item.total_amount}`,
                            `Preference: ${item.preference.toFixed(2)}`,
                            `Rank: ${item.rank}`,
                        ];
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Score" },
            },
            x: {
                title: { display: true, text: "Nama Produk" },
            },
        },
    };

    const chartDataDoughnut = {
        labels: sales.map(item => item.item_name),
        datasets: [
            {
                data: sales.map(item => item.preference),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                ],
                borderWidth: 1,
            },
        ],
    };

    const optionsDoughnut = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const item = sales[context.dataIndex];
                        return `${item.item_name}: ${(item.preference * 100).toFixed(2)}%`;
                    },
                },
            },
            legend: {
                position: "bottom",
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        {getSpkTitle()}
                    </h2>
                    <p className="text-center text-gray-500 mt-1">
                        Sistem Pendukung Keputusan Produk
                    </p>
                </div>

                {/* FILTER CARD */}
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchSales();
                        }}
                        className="flex flex-wrap items-center gap-4 justify-center"
                    >
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="border p-2 rounded-lg"
                            placeholder="Tahun"
                            required
                        />

                        <select
                            value={spkType}
                            onChange={(e) => setSpkType(e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="best-item">Best Produk</option>
                            <option value="worst-item">Worst Produk</option>
                            <option value="featured-item">Featured Produk</option>
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Semua Produk</option>
                            <option value="FOOD">Food</option>
                            <option value="DRINK">Drink</option>
                        </select>

                        <button
                            onClick={handlePrintReport}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            Print Laporan
                        </button>
                    </form>
                </div>

                {/* CHART CARD */}
                <div className="bg-white p-6 rounded-xl shadow mb-6">

                    {/* Chart Switch */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={() => setChartType("bar")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${chartType === "bar"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            Bar Chart
                        </button>
                        <button
                            onClick={() => setChartType("doughnut")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${chartType === "doughnut"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            Doughnut Chart
                        </button>
                    </div>

                    <div className="w-full h-96 flex justify-center items-center">
                        {chartType === "bar" ? (
                            <Bar data={chartDataBar} options={optionsBar} />
                        ) : (
                            <Doughnut data={chartDataDoughnut} options={optionsDoughnut} />
                        )}
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                        Detail Perhitungan SPK
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
                                    <th className="p-2 border">Preference</th>
                                    <th className="p-2 border">Score</th>
                                    <th className="p-2 border">Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className={`text-center transition hover:bg-gray-50 ${item.rank === 1 ? "bg-green-50 font-semibold" : ""
                                            }`}
                                    >
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
                                        <td className="p-2 border">{item.preference.toFixed(4)}</td>
                                        <td className="p-2 border">{item.score.toFixed(4)}</td>
                                        <td className="p-2 border font-semibold">
                                            {item.rank}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
}