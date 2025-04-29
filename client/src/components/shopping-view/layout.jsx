import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import { FaOilCan } from "react-icons/fa";
import Disclaimer from "./disclaimer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-repeat opacity-5 z-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23075985\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      {/* Disclaimer */}
      <Disclaimer />

      {/* Header */}
      <ShoppingHeader />
      
      {/* Main content */}
      <main className="flex-grow w-full relative z-10">
        <Outlet />
      </main>

      {/* Developer Credit Section */}
      <div className="py-4 bg-white border-t relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Developed by <span className="font-semibold">Abinaya B T</span>
            </p>
            <p className="text-sm text-gray-600">
              M.Sc Software Systems Student
            </p>
            <p className="text-sm text-gray-600">
              Kongu Engineering College, Perundurai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingLayout;
