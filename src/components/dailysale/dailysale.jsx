import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function DailySaleItem() {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchSales();
        fetchItems();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await axios.get("http://localhost:4321/v1/dailySaleItem", { withCredentials: true });
            setSales(response.data);
        } catch (error) {
            console.error("Gagal mengambil data penjualan:", error.response || error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await axios.get("http://localhost:4321/v1/item", { withCredentials: true });
            setItems(response.data);
        } catch (error) {
            console.error("Gagal mengambil daftar item:", error.response || error);
        }
    };

    const fetchSaleById = async (external_id) => {
        try {
            const response = await axios.get(`http://localhost:4321/v1/dailySaleItem/${external_id}`, { withCredentials: true });
            console.log(response);

            setFormData({
                item_name: response.data.name,
                amount: response.data.amount,
                date: response.data.date,
            });
            setEditId(external_id);
        } catch (error) {
            console.error("Gagal mengambil data penjualan:", error.response || error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`http://localhost:4321/v1/dailySaleItem/${editId}`, formData, { withCredentials: true });
                Swal.fire("Berhasil!", "Data penjualan berhasil diperbarui.", "success");
            } else {
                await axios.post("http://localhost:4321/v1/dailySaleItem", formData, { withCredentials: true });
                Swal.fire("Berhasil!", "Data penjualan berhasil ditambahkan.", "success");
            }
            setFormData({ item_name: "", amount: "", });
            setEditId(null);
            fetchSales();
        } catch (error) {
            console.error("Gagal menyimpan data penjualan:", error.response || error);
            Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
        }
    };

    const handleDelete = async (external_id) => {
        const result = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data penjualan akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:4321/v1/dailySaleItem/${external_id}`, { withCredentials: true });
                fetchSales();
                Swal.fire("Terhapus!", "Data penjualan berhasil dihapus.", "success");
            } catch (error) {
                console.error("Gagal menghapus penjualan:", error.response || error);
                Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Manajemen Penjualan Harian</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                <select
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                >
                    <option value="">Pilih Item</option>
                    {items.map((item) => (
                        <option key={item.id} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Jumlah Terjual"
                    className="border p-2 rounded w-full"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {editId ? "Update" : "Tambah"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300 text-center">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Nama Item</th>
                        <th className="border p-2">Jumlah</th>
                        <th className="border p-2">Income</th>
                        <th className="border p-2">Cost</th>
                        <th className="border p-2">Margin</th>
                        <th className="border p-2">Tanggal</th>
                        <th className="border p-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.external_id} className="hover:bg-gray-100">


                            <td className="border p-2">{sale.name}</td>
                            <td className="border p-2">{sale.amount}</td>
                            <td className="border p-2">{sale.revenue}</td>
                            <td className="border p-2">{sale.cost}</td>
                            <td className="border p-2">{sale.margin}</td>
                            <td className="border p-2">
                                {new Date(sale.date).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </td>
                            <td className="border p-2 flex justify-center gap-2">
                                <button
                                    onClick={() => fetchSaleById(sale.external_id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(sale.external_id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
