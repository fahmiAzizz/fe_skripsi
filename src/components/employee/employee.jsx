import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import EmployeeFormAdd from "./employeeFormAdd.jsx";
import EmployeeFormEdit from "./employeeFormEdit.jsx";
export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const API_URL = "http://localhost:4321/v1/employee";

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(API_URL);
            const data = response?.data;
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            Swal.fire("Gagal", "Gagal mengambil data karyawan.", "error");
            setEmployees([]);
        }
    };


    const handleDelete = async (external_id) => {
        const result = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Karyawan akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:4321/v1/userEmployee/${external_id}`, {
                    withCredentials: true,
                });
                setEmployees(employees.filter(emp => emp.external_id !== external_id));
                Swal.fire("Terhapus!", "Data karyawan berhasil dihapus.", "success");
            } catch (error) {
                console.error("Gagal menghapus data:", error);
                Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
            }
        }
    };

    return (
        <div className="p-20 bg-slate-100 min-h-screen">
            {isAdding ? (
                <EmployeeFormAdd
                    onCancel={() => setIsAdding(false)}
                    onRefresh={fetchEmployees}
                />
            ) : editingEmployee ? (
                <EmployeeFormEdit
                    onCancel={() => setEditingEmployee(null)}
                    onRefresh={fetchEmployees}
                    editData={editingEmployee}
                />
            ) : (
                <div className="max-w-5xl mx-auto bg-white p-5 shadow-lg">
                    {/* Header */}
                    <div className=" justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-center text-gray-800">
                            Daftar Karyawan
                        </h2>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-green-500 text-white px-5 py-2 text-right items-end  rounded-lg shadow hover:bg-green-600 transition"
                        >
                            + Tambah Karyawan
                        </button>
                    </div>

                    {/* Card Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 text-left">Nama</th>
                                    <th className="px-6 py-4 text-left">NIK</th>
                                    <th className="px-6 py-4 text-left">Role</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.length > 0 ? (
                                    employees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="border-t hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {emp.first_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {emp.nik}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                    {emp.role_name || "Tidak ada peran"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setEditingEmployee(emp)}
                                                        className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp.external_id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center py-6 text-gray-400"
                                        >
                                            Tidak ada data karyawan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
