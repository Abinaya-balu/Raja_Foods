import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, Calendar } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "../../config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "../../store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "../../store/shop/cart-slice";
import { Label } from "../ui/label";
import { FaOilCan } from "react-icons/fa";
import { motion } from "framer-motion";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <motion.div
          key={menuItem.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-sm font-medium cursor-pointer hover:text-white transition-colors duration-200 relative group px-2 py-1"
            key={menuItem.id}
          >
            {menuItem.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </Label>
        </motion.div>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  console.log(cartItems, "sangam");

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4 ">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setOpenCartSheet(true)}
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-teal-500 transition-colors duration-200"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems?.items?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-teal-900 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {cartItems?.items?.length}
              </span>
            )}
            <span className="sr-only">User cart</span>
          </Button>
        </motion.div>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="bg-teal-900 border-2 border-teal-200 cursor-pointer">
              <AvatarFallback className="bg-teal-900 text-white font-extrabold">
                {user?.userName && user.userName[0] ? user.userName[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56 bg-white border border-teal-100 shadow-lg">
          <DropdownMenuLabel className="text-teal-800">Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-teal-100" />
          <DropdownMenuItem 
            onClick={() => navigate("/shop/account")}
            className="cursor-pointer hover:bg-teal-50 transition-colors duration-200"
          >
            <UserCog className="mr-2 h-4 w-4 text-teal-600" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/shop/grinding-bookings")}
            className="cursor-pointer hover:bg-teal-50 transition-colors duration-200"
          >
            <Calendar className="mr-2 h-4 w-4 text-teal-600" />
            <span>Grinding Service</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-teal-100" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-teal-700 bg-gradient-to-r from-teal-700 to-teal-600 text-zinc-50 shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2 group">
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <FaOilCan className="h-6 w-6 text-amber-300" />
          </motion.div>
          <span className="font-bold text-white text-lg tracking-wide group-hover:text-amber-300 transition-colors duration-300">
            SRI RAJA FOOD PRODUCTS
          </span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden border-teal-500 text-white hover:bg-teal-500">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs bg-teal-700 text-white border-none">
            <div className="flex items-center gap-2 mb-6 pt-4">
              <FaOilCan className="h-6 w-6 text-amber-300" />
              <span className="font-bold text-lg">SRI RAJA FOOD PRODUCTS</span>
            </div>
            <MenuItems />
            <div className="mt-6 pt-6 border-t border-teal-600">
              <HeaderRightContent />
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
