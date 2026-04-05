import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:4321/v1/item";

const Item = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [type, setType] = useState("FOOD");
    const [price, setPrice] = useState("");
    const [cost, setCost] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchItems();
        console.log(document.cookie);

    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(API_URL, {
                withCredentials: true,
            });
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            Swal.fire("Gagal", "Gagal memuat data item.", "error");
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemData = { name, type, price: parseFloat(price), cost };

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, itemData, {
                    withCredentials: true,
                });
                Swal.fire("Berhasil", "Item berhasil diperbarui.", "success");
            } else {
                await axios.post(API_URL, itemData, {
                    withCredentials: true,
                });
                Swal.fire("Berhasil", "Item berhasil ditambahkan.", "success");
            }
            fetchItems();
            resetForm();
        } catch (error) {
            console.error("Error saving item:", error);
            Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan item.", "error");
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.external_id);
        setName(item.name);
        setType(item.type);
        setPrice(item.price);
        setCost(item.cost);
    };

    const handleDelete = async (external_id) => {
        const result = await Swal.fire({
            title: "Yakin ingin menghapus?",
            text: "Data item akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${external_id}`, {
                    withCredentials: true,
                });
                fetchItems();
                Swal.fire("Terhapus", "Item berhasil dihapus.", "success");
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire("Gagal", "Gagal menghapus item.", "error");
            }
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setType("FOOD");
        setPrice("");
        setCost("");
    };

    return (
        <div className="bg-slate-100 p-10">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-semibold p-4 text-center">
                    {editingId ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 bg-white p-6 rounded-lg shadow-md"
                >
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="FOOD">Food</option>
                        <option value="DRINK">Drink</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        placeholder="Cost"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                        >
                            {editingId ? "Update" : "Create"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition duration-200"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <h2 className="text-2xl font-semibold mt-6 text-center">List Produk</h2>
                <table className="w-full border-collapse border border-gray-300 text-center mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Nama Produk</th>
                            <th className="border p-2">Tipe</th>
                            <th className="border p-2">Harga</th>
                            <th className="border p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.external_id} className="hover:bg-gray-100">
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">{item.type}</td>
                                <td className="border p-2">{formatRupiah(item.price)}</td>
                                <td className="border p-2 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.external_id)}
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
        </div>
    );
};

export default Item;
