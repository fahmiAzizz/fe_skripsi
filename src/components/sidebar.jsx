import { MoreVertical, ChevronLast, ChevronFirst, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { IoFastFoodSharp } from "react-icons/io5";
import { MdOutlinePointOfSale } from "react-icons/md";
import { VscGraphLine } from "react-icons/vsc";
import { LuWeight } from "react-icons/lu";
import axios from "axios";
import Swal from "sweetalert2";

export default function Sidebar({ setActivePage, onLogout, user }) {
    const [expanded, setExpanded] = useState(true);
    const isManager = user?.responseData?.user?.role?.role_name === "Manager";
    useEffect(() => {
        console.log(user);

    }, [user]);

    const handleLogout = async () => {
        const confirm = await Swal.fire({
            title: "Yakin ingin logout?",
            text: "Sesi kamu akan diakhiri.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Logout",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            try {
                await axios.post("http://localhost:4321/v1/logout", {}, { withCredentials: true });
                localStorage.removeItem("userData");
                Swal.fire({
                    icon: "success",
                    title: "Logout berhasil",
                    showConfirmButton: false,
                    timer: 1500
                });
                onLogout();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Logout gagal",
                    text: error.response?.data?.message || "Terjadi kesalahan saat logout",
                });
            }
        }
    };

    // Ambil employee dari dalam user.user
    const employee = user?.responseData.user.employee;

    return (
        <aside className="h-screen">
            <nav className="h-full inline-flex flex-col bg-white border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src="../logo.jpg"
                        className=' w-14'
                        alt="Logo"
                    />
                    <p className={`${expanded ? "flex text-2xl font-semibold" : "hidden"}`}>Kopi Malabar 22</p>
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <ul className="flex-1 px-3">
                    <li onClick={() => setActivePage("app")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                        <MdDashboard size={25} />
                        <p className={`${expanded ? "flex" : "hidden"}`}>Dashboard</p>
                    </li>
                    <li onClick={() => setActivePage("sale")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                        <MdOutlinePointOfSale size={25} />
                        <p className={`${expanded ? "flex" : "hidden"}`}>Penjualan</p>
                    </li>
                    {isManager && (
                        <>
                            <li onClick={() => setActivePage("employee")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                                <BsFillPersonLinesFill size={25} />
                                <p className={`${expanded ? "flex" : "hidden"}`}>Karyawan</p>
                            </li>
                            <li onClick={() => setActivePage("item")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                                <IoFastFoodSharp size={25} />
                                <p className={`${expanded ? "flex" : "hidden"}`}>Produk</p>
                            </li>
                            <li onClick={() => setActivePage("evaluation")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                                <LuWeight size={25} />
                                <p className={`${expanded ? "flex" : "hidden"}`}>Penilaian</p>
                            </li>
                            <li onClick={() => setActivePage("spk-monthly")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                                <VscGraphLine size={25} />
                                <p className={`${expanded ? "flex" : "hidden"}`}>SPK Bulanan</p>
                            </li>
                            <li onClick={() => setActivePage("spk-annual")} className="flex mx-auto items-center gap-2 cursor-pointer p-2 hover:bg-gray-200">
                                <VscGraphLine size={25} />
                                <p className={`${expanded ? "flex" : "hidden"}`}>SPK Tahunan</p>
                            </li>
                        </>)}
                </ul>

                <div className="border-t flex flex-col p-3">
                    <div className="flex items-center">
                        <img
                            src={`https://ui-avatars.com/api/?name=${employee ? `${employee.first_name}+${employee.last_name}` : "User"}&background=c7d2fe&color=3730a3&bold=true`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-md"
                        />
                        <div className={`overflow-hidden transition-all ${expanded ? " w-32 ml-3" : "w-0"}`}>
                            {employee ? (
                                <>
                                    <h4 className="font-semibold">
                                        {user.responseData.user.employee.first_name} {user.responseData.user.employee.last_name}
                                    </h4>
                                    <span className="text-xs text-gray-600">{user.responseData.user.employee.phone_number}</span>
                                </>
                            ) : (
                                <>
                                    <h4 className="font-semibold">User</h4>
                                    <span className="text-xs text-gray-600">12345</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center mt-3 p-2 rounded-md hover:bg-red-100 text-red-600 transition-all"
                    >
                        <LogOut size={20} />
                        <span className={`ml-2 ${expanded ? "block" : "hidden"}`}>Logout</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
