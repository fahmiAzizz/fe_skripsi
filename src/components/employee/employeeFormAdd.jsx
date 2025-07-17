import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function EmployeeForm({ onCancel, onRefresh }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        nik: "",
        gender: "male",
        role_name: "",
        phone_number: "",
        address: "",
        date_of_birth: "",
    });

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get("http://localhost:4321/v1/role", {
                    withCredentials: true
                });
                setRoles(response.data);
            } catch (error) {
                console.error("Gagal mengambil data role:", error);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:4321/v1/userEmployee", formData, {
                withCredentials: true
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: response.data.message || "Karyawan berhasil ditambahkan",
            });

            setFormData({
                first_name: "",
                last_name: "",
                nik: "",
                gender: "male",
                role_name: "",
                phone_number: "",
                address: "",
                date_of_birth: "",
            });
            onRefresh();
            onCancel();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.response?.data?.message || "Terjadi kesalahan",
            });
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Form Registrasi Karyawan</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">Nama Depan</label>
                        <input type="text" name="first_name" className="w-full p-2 border rounded-lg" value={formData.first_name} onChange={handleChange} required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">Nama Belakang</label>
                        <input type="text" name="last_name" className="w-full p-2 border rounded-lg" value={formData.last_name} onChange={handleChange} required />
                    </div >

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">NIK</label>
                        < input type="text" name="nik" className="w-full p-2 border rounded-lg" value={formData.nik} onChange={handleChange} required />
                    </div >

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">Jenis Kelamin</label>
                        <select name="gender" className="w-full p-2 border rounded-lg" value={formData.gender} onChange={handleChange} >
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </select >
                    </div >

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">Role</label>
                        <select name="role_name" className="w-full p-2 border rounded-lg" value={formData.role_name} onChange={handleChange} required >
                            <option value="">Pilih Role</option>
                            {
                                roles.map((role) => (
                                    <option key={role.id} value={role.role_name}>{role.role_name}</option>
                                ))
                            }
                        </select >
                    </div >

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600">Nomor Telepon</label>
                        < input type="text" name="phone_number" className="w-full p-2 border rounded-lg" value={formData.phone_number} onChange={handleChange} required />
                    </div >

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Alamat</label>
                        <textarea name="address" className="w-full p-2 border rounded-lg" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Tanggal Lahir</label>
                        <input type="date" name="date_of_birth" className="w-full p-2 border rounded-lg" value={formData.date_of_birth} onChange={handleChange} required />
                    </div>

                    <button type="submit" className={` px-5 flex justify-center col-span-2 p-2 mx-auto text-white font-semibold rounded-lg ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`} disabled={loading}>
                        {loading ? "Menyimpan..." : "Daftar"}
                    </button>
                </form >
            </div >
        </div >
    );
}
