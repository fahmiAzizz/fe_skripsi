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
            setEmployees([]); // fallback untuk mencegah undefined
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
        <div className="container mx-auto p-4">
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
                <div>
                    <h2 className="text-2xl font-bold mb-4">Daftar Karyawan</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        + Tambah Karyawan
                    </button>
                    <table className="w-full border">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Nama</th>
                                <th className="border px-4 py-2">NIK</th>
                                <th className="border px-4 py-2">Role</th>
                                <th className="border px-4 py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td className="border px-4 py-2">{emp.first_name}</td>
                                        <td className="border px-4 py-2">{emp.nik}</td>
                                        <td className="border px-4 py-2">
                                            {emp.role_name || "Tidak ada peran"}
                                        </td>
                                        <td className="border px-4 py-2 flex gap-2">
                                            <button
                                                onClick={() => setEditingEmployee(emp)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.external_id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center border px-4 py-2 text-gray-500"
                                    >
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
