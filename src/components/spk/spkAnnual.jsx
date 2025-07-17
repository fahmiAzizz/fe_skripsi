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


    useEffect(() => {
        const fetchData = async () => {
            await updateDataAnnualSale();
            if (year) {
                await fetchSales();
            }
        };

        fetchData();
    }, [year, spkType]);

    const fetchSales = async () => {
        if (!year || !spkType) return;

        try {
            const response = await axios.post(
                `http://localhost:4321/v1/annualSaleItem/spk/${spkType}?year=${year}`,
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
            console.error("Gagal ambil data:", error.response || error);
        }
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

    const getSpkTitle = () => {
        switch (spkType) {
            case "best-item":
                return "Ranking Produk Terbaik";
            case "worst-item":
                return "Ranking Produk Terburuk";
            case "fitured-item":
                return "Produk Rekomendasi Untuk Promosi";
            default:
                return "Ranking Produk";
        }
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
        <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
                {getSpkTitle(spkType)}
            </h2>

            {/* Filter Form */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    fetchSales();
                }}
                className="flex items-center gap-4 mb-6"
            >
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Tahun (cth: 2025)"
                    required
                />

                <select
                    value={spkType}
                    onChange={(e) => setSpkType(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="best-item">Best Produk</option>
                    <option value="worst-item">Worst Produk</option>
                    <option value="fitured-item">Featured Produk</option>
                </select>
            </form>

            {/* Chart Type Switcher */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setChartType("bar")}
                    className={`px-4 py-2 rounded font-medium ${chartType === "bar" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Bar Chart
                </button>
                <button
                    onClick={() => setChartType("doughnut")}
                    className={`px-4 py-2 rounded font-medium ${chartType === "doughnut" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Doughnut Chart
                </button>
            </div>
            <div className="max-full">
                {/* Chart Renderer */}
                {chartType === "bar" ? (
                    <Bar data={chartDataBar} options={optionsBar} />
                ) : (
                    <Doughnut data={chartDataDoughnut} options={optionsDoughnut} />
                )}
            </div>
            <h3 className="text-xl font-semibold mt-10 mb-2 text-gray-700 text-center">Detail Perhitungan SPK</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Item</th>
                            <th className="border p-2">Margin</th>
                            <th className="border p-2">Cost</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Preference</th>
                            <th className="border p-2">Score</th>
                            <th className="border p-2">Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((item, idx) => (
                            <tr key={idx} className="text-center hover:bg-gray-50">
                                <td className="border p-2">{item.item_name}</td>
                                <td className="border p-2">Rp{item.total_margin.toLocaleString("id-ID")}</td>
                                <td className="border p-2">Rp{item.total_cost.toLocaleString("id-ID")}</td>
                                <td className="border p-2">{item.total_amount}</td>
                                <td className="border p-2">{item.preference.toFixed(4)}</td>
                                <td className="border p-2">{item.score.toFixed(4)}</td>
                                <td className="border p-2">{item.rank}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
