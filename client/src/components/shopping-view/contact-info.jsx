import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

function ContactInfo() {
  return (
    <div className="bg-teal-800 text-white py-6 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <div className="flex flex-col items-center text-center">
            <FaMapMarkerAlt className="h-6 w-6 mb-2" />
            <h3 className="font-semibold mb-1">Our Location</h3>
            <p className="text-sm text-teal-100">
              123 Market Street,<br />
              Elumathur,<br />
              Tamil Nadu 600001,<br />
              India
            </p>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center text-center">
            <FaPhone className="h-6 w-6 mb-2" />
            <h3 className="font-semibold mb-1">Contact Us</h3>
            <p className="text-sm text-teal-100">
              +91 98765 43210
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center text-center">
            <FaEnvelope className="h-6 w-6 mb-2" />
            <h3 className="font-semibold mb-1">Email Us</h3>
            <p className="text-sm text-teal-100">
              info@srirajafoods.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactInfo; 