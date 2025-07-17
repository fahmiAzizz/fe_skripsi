import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Role() {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({ role_name: "", permissions: [] });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get("http://localhost:5000/v1/role", { withCredentials: true });
            setRoles(response.data);
        } catch (error) {
            Swal.fire("Error", "Gagal mengambil data role.", "error");
        }
    };

    const fetchRoleById = async (external_id) => {
        try {
            const response = await axios.get(`http://localhost:5000/v1/role/${external_id}`, { withCredentials: true });
            const role = response.data;
            setFormData({
                role_name: role.role,
                permissions: role.permissions || []
            });
            setEditId(external_id);
        } catch (error) {
            Swal.fire("Error", "Gagal mengambil data role.", "error");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (id) => {
        setFormData((prevData) => {
            const updatedPermissions = prevData.permissions.map((perm) =>
                perm.permission_id === id ? { ...perm, allowed: !perm.allowed } : perm
            );
            return { ...prevData, permissions: updatedPermissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const payload = {
                    permissions: formData.permissions.map((perm) => ({
                        external_id: perm.external_id,
                        allowed: perm.allowed
                    }))
                };

                await axios.put(`http://localhost:5000/v1/role/permission/${editId}`, payload, {
                    withCredentials: true,
                });

                Swal.fire("Berhasil", "Role berhasil diperbarui", "success");
            } else {
                await axios.post("http://localhost:5000/v1/role", formData, {
                    withCredentials: true,
                });
                Swal.fire("Berhasil", "Role berhasil ditambahkan", "success");
            }

            setFormData({ role_name: "", permissions: [] });
            setEditId(null);
            fetchRoles();
        } catch (error) {
            console.error("Submit Error:", error);
            Swal.fire("Error", "Gagal menyimpan role", "error");
        }
    };

    const handleDelete = async (external_id) => {
        const result = await Swal.fire({
            title: "Yakin ingin menghapus?",
            text: "Data role yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/v1/role/${external_id}`, { withCredentials: true });
                Swal.fire("Dihapus!", "Role berhasil dihapus.", "success");
                fetchRoles();
            } catch (error) {
                Swal.fire("Error", "Gagal menghapus role", "error");
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Manajemen Role</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                <input
                    type="text"
                    name="role_name"
                    value={formData.role_name}
                    onChange={handleChange}
                    placeholder="Nama Role"
                    className="border p-2 rounded w-full"
                    required
                    disabled={!!editId} // Nama role tidak bisa diubah saat edit permissions
                />
                <div>
                    <h3 className="text-lg font-medium mb-2">Permissions:</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {formData.permissions.map((perm) => (
                            <label key={perm.permission_id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={perm.allowed}
                                    onChange={() => handlePermissionChange(perm.permission_id)}
                                />
                                {perm.subject} - {perm.action}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {editId ? "Update Permissions" : "Tambah Role"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300 text-center">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Nama Role</th>
                        <th className="border p-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.external_id} className="hover:bg-gray-100">
                            <td className="border p-2">{role.role_name}</td>
                            <td className="border p-2 flex justify-center gap-2">
                                <button
                                    onClick={() => fetchRoleById(role.external_id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(role.external_id)}
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
