import { useState } from "react";
import GrindingBookingForm from "../../components/ui/GrindingBookingForm";
import MyBookingsList from "../../components/ui/MyBookingsList";
import AuthTestComponent from "../../components/ui/AuthTestComponent";

const ShoppingGrindingBookings = () => {
  const [activeTab, setActiveTab] = useState("book"); // "book" or "history"
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Grinding Service</h1>
      
      <div className="mb-8">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "book"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("book")}
          >
            Book a Service
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Booking History
          </button>
          <button
            className="ml-auto py-2 px-4 text-sm text-gray-500"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </div>
      
      {showDebug && (
        <div className="mb-8">
          <AuthTestComponent />
        </div>
      )}
      
      {activeTab === "book" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Book Your Grinding Service</h2>
            <p className="text-gray-600 mb-6">
              Select a date and time slot to book our grinding service for your products.
              Our expert team will ensure your products are ground to perfection.
            </p>
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>Select your preferred date</li>
                <li>Choose an available time slot</li>
                <li>Add any special instructions (optional)</li>
                <li>Submit your booking request</li>
                <li>Wait for confirmation by our team</li>
              </ol>
            </div>
          </div>
          <div>
            <GrindingBookingForm />
          </div>
        </div>
      ) : (
        <MyBookingsList />
      )}
    </div>
  );
};

export default ShoppingGrindingBookings; 