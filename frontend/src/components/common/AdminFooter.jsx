import React from "react";
import { Mail, Phone, MapPin, Clock, Shield, Award } from "lucide-react";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-50 to-indigo-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Footer Box */}
        <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-3">
                <Shield className="text-blue-600 mr-2" size={24} />
                <h3 className="text-lg font-bold text-gray-900">DocBook</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Professional appointment scheduling platform for all businesses.
              </p>
              <p className="text-gray-400 text-xs mt-2">Version 1.0.0</p>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="text-blue-600 mr-2" size={18} />
                Support
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <button className="hover:text-blue-600 transition">
                    support@docbook.com
                  </button>
                </li>
                <li>
                  <button className="hover:text-blue-600 transition">
                    mrvoid_24@docbook.com
                  </button>
                </li>
                <li>
                  <button className="hover:text-blue-600 transition">
                    help@docbook.com
                  </button>
                </li>
              </ul>
            </div>

            {/* Operating Hours */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="text-blue-600 mr-2" size={18} />
                Support Hours
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Monday - Friday: 9:00 - 18:00</li>
                <li>Saturday: 10:00 - 15:00</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="text-blue-600 mr-2" size={18} />
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Phone size={14} className="mr-2" /> +1-800-DOCBOOK
                </li>
                <li className="flex items-center">
                  <MapPin size={14} className="mr-2" /> Headquarters
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            {/* Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">24/7</p>
                <p className="text-xs text-gray-600">Service Available</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-gray-600">Uptime</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">5★</p>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <div className="flex items-center mb-4 md:mb-0">
                <Award className="text-blue-600 mr-2" size={18} />
                <p>&copy; {currentYear} DocBook Admin Platform. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <button className="hover:text-blue-600 transition">Privacy Policy</button>
                <button className="hover:text-blue-600 transition">Terms of Service</button>
                <button className="hover:text-blue-600 transition">Contact Us</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
