import {
  ChartNoAxesCombined,
  CircleCheckBig,
  Package,
  ShoppingBag,
  FileBarChart,
  Calendar,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { cn } from "@/lib/utils";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <ChartNoAxesCombined size={24} />,
  },
  {
    id: "features",
    label: "Features",
    path: "/admin/features",
    icon: <CircleCheckBig size={24} />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <Package size={24} />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingBag size={24} />,
  },
  {
    id: "grinding-bookings",
    label: "Grinding Bookings",
    path: "/admin/grinding-bookings",
    icon: <Calendar size={24} />,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: <FileBarChart size={24} />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            setOpen ? setOpen(false) : null;
          }}
          className={cn(
            "flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-white",
            pathname === menuItem.path
              ? "bg-white/10"
              : "hover:bg-teal-700"
          )}
        >
          {menuItem.icon}
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 bg-teal-600 text-white">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="text-white">Admin Panel</SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-teal-600 text-white p-6 lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <ChartNoAxesCombined size={30} className="text-white" />
          <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
