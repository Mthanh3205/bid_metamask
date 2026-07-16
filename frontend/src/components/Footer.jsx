import React from 'react';
import { FaGavel } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center items-center gap-2 mb-4 text-xl font-bold text-white">
          <FaGavel className="text-blue-500" /> DApp Auction
        </div>
        <p className="mb-2">&copy; {new Date().getFullYear()} Nền tảng đấu giá phi tập trung. Mọi quyền được bảo lưu.</p>
        <p className="text-sm text-gray-500">Tích hợp Blockchain Ethereum & Smart Contract đảm bảo minh bạch tuyệt đối.</p>
      </div>
    </footer>
  );
};

export default Footer;