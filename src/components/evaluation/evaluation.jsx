import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function EvaluationWeight() {
    const [data, setData] = useState([]);
    const [backupData, setBackupData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:4321/v1/evaluation");
            setData(res.data.data);
        } catch (err) {
            Swal.fire("Error", "Gagal mengambil data", "error");
        }
    };

    // 🔥 grouping untuk tampilan
    const grouped = data.reduce((acc, item) => {
        if (!acc[item.evaluation_id]) {
            acc[item.evaluation_id] = {
                evaluation: item.evaluation,
                evaluation_id: item.evaluation_id,
                weights: {}
            };
        }

        acc[item.evaluation_id].weights[item.criteria] = {
            value: item.weight,
            criteria_id: item.criteria_id
        };

        return acc;
    }, {});

    // ✏️ Edit per row
    const handleEdit = (id) => {
        setBackupData(JSON.parse(JSON.stringify(data)));
        setEditingId(id);
    };

    const handleCancel = () => {
        setData(backupData);
        setEditingId(null);
    };

    // 🔥 update state
    const handleChange = (evaluation_id, criteria, value) => {
        setData((prev) =>
            prev.map((item) =>
                item.evaluation_id === evaluation_id &&
                    item.criteria === criteria
                    ? { ...item, weight: Number(value) }
                    : item
            )
        );
    };

    // 🚀 BULK UPDATE
    const handleUpdate = async (evaluation) => {
        try {
            const confirm = await Swal.fire({
                title: "Yakin update?",
                text: "Perubahan akan disimpan",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, simpan",
                cancelButtonText: "Batal"
            });

            if (!confirm.isConfirmed) return;

            const filtered = data.filter(
                (d) => d.evaluation_id === evaluation.evaluation_id
            );

            const payload = {
                evaluation_id: evaluation.evaluation_id,
                weights: filtered.map((item) => ({
                    criteria_id: item.criteria_id,
                    weight: Number(item.weight)
                }))
            };

            await axios.put(
                "http://localhost:4321/v1/evaluation/update",
                payload
            );

            Swal.fire("Success", "Data berhasil diupdate ✅", "success");

            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Update gagal ❌", "error");
        }
    };
    return (
        <div className="p-20 bg-slate-100 min-h-screen">
            <div className="bg-white p-10 rounded-sm shadow-md">
                <h2 className=" text-3xl text-center font-semibold mb-5">
                    Bobot Kriteria Penilaian
                </h2>
                {/* 🔥 Info Bobot */}
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-5 py-4 rounded-lg shadow-sm">
                    <p className="text-sm leading-relaxed">
                        Bobot menunjukkan tingkat kepentingan setiap kriteria dalam proses penilaian.
                        Semakin besar nilai bobot, semakin besar pengaruhnya terhadap hasil.
                        Total seluruh bobot harus berjumlah 1 atau 100%.
                    </p>
                    <p className="text-sm mt-2 font-medium">
                        Contoh: Cost = 0.4, Margin = 0.3, Quantity = 0.3 → Total = 1
                    </p>
                </div>
                <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-center font-semibold border-b">
                                    Nama Penilaian
                                </th>
                                <th className="px-4 py-3 text-center font-semibold border-b">
                                    Margin
                                </th>
                                <th className="px-4 py-3 text-center font-semibold border-b">
                                    Cost
                                </th>
                                <th className="px-4 py-3 text-center font-semibold border-b">
                                    Quantity
                                </th>
                                <th className="px-4 py-3 text-center font-semibold border-b">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {Object.values(grouped).map((item) => (
                                <tr
                                    key={item.evaluation_id}
                                    className="hover:bg-gray-200 transition"
                                >
                                    <td className="px-4 py-3 text-center border-b">
                                        {item.evaluation}
                                    </td>

                                    {["Margin", "Cost", "Quantity"].map((crit) => (
                                        <td
                                            key={crit}
                                            className="px-4 py-3 text-center border-b"
                                        >
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={item.weights[crit]?.value || 0}
                                                disabled={
                                                    editingId !== item.evaluation_id
                                                }
                                                className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                                                onChange={(e) =>
                                                    handleChange(
                                                        item.evaluation_id,
                                                        crit,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                    ))}

                                    <td className="px-4 py-3 text-center border-b">
                                        {editingId !== item.evaluation_id ? (
                                            <button
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                                onClick={() =>
                                                    handleEdit(item.evaluation_id)
                                                }
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                                    onClick={() =>
                                                        handleUpdate(item)
                                                    }
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
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