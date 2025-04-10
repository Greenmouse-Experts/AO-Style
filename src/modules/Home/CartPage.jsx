import React, { useState, useEffect } from 'react';
import Breadcrumb from "./components/Breadcrumb";
// import { Link } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      style: {
        name: 'Ankara Gown',
        qty: '1 Piece',
        price: 24000,
        image: 'https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png',
      },
      fabric: {
        name: 'Luxury Embellished Lace Fabrics',
        qty: '2 Yards',
        price: 24000,
        image: 'https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png',
      },
      total: 126000,
    },
    {
      id: 2,
      style: {
        name: 'Ankara Gown',
        qty: '1 Piece',
        price: 24000,
        image: 'https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png',
      },
      fabric: null,
      total: 126000,
    },
    {
      id: 3,
      style: null,
      fabric: {
        name: 'Luxury Embellished Lace Fabrics',
        qty: '2 Yards',
        price: 24000,
        image: 'https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png',
      },
      total: 126000,
    },
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    setTotal(subtotal);
  }, [cartItems]);

  const handleRemove = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    setDropdownOpen(null);
  };

  return (
    <>
      <Breadcrumb
        title="Cart Page"
        subtitle="Cart"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />
      <div className="Resizer section px-4">
        <h2 className="text-lg font-medium mb-6">Cart ({cartItems.length})</h2>

        <div className="hidden md:grid grid-cols-[4fr_2fr_2fr_1fr] gap-8 text-sm font-medium text-gray-500 mb-4">
          <div>STYLE</div>
          <div>FABRIC</div>
          <div className="text-right">TOTAL AMOUNT</div>
          <div className="text-right">ACTION</div>
        </div>


        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* Style */}
              <div className="flex items-center gap-4 w-full md:w-1/3">
                {item.style ? (
                  <>
                    <img
                      src={item.style.image}
                      alt="Style"
                      className="w-20 h-24 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.style.name}</p>
                      <p className="text-sm text-gray-500">{item.style.qty}</p>
                      <p className="text-purple-600 font-medium mt-1">
                        ₦{item.style.price.toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 italic">-</div>
                )}
              </div>

              {/* Fabric */}
              <div className="flex items-center gap-4 w-full md:w-1/3">
                {item.fabric ? (
                  <>
                    <img
                      src={item.fabric.image}
                      alt="Fabric"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.fabric.name}</p>
                      <p className="text-sm text-gray-500">{item.fabric.qty}</p>
                      <p className="text-purple-600 font-medium mt-1">
                        ₦{item.fabric.price.toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 italic">-</div>
                )}
              </div>

              {/* Total & Dropdown Action */}
              <div className="flex items-center justify-between w-full md:w-auto md:gap-16 relative">
                <div className="text-purple-600 font-semibold">
                  ₦{item.total.toLocaleString()}
                </div>

                <div className="relative ml-14">
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === item.id ? null : item.id)
                    }
                    className="text-gray-600 hover:text-black"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="8" viewBox="0 0 28 8" fill="none">
                      <path d="M1.48645 6.35355C2.1447 7.01181 2.9672 7.34 3.92 7.34C4.8511 7.34 5.65872 7.00839 6.31355 6.35355C6.9718 5.6953 7.3 4.8728 7.3 3.92C7.3 2.9672 6.9718 2.1447 6.31355 1.48645C5.65872 0.831614 4.8511 0.5 3.92 0.5C2.9672 0.5 2.1447 0.828195 1.48645 1.48645C0.828195 2.1447 0.5 2.9672 0.5 3.92C0.5 4.8728 0.828195 5.6953 1.48645 6.35355ZM11.1349 6.35355C11.7931 7.01181 12.6156 7.34 13.5684 7.34C14.4995 7.34 15.3072 7.00839 15.962 6.35355C16.6202 5.6953 16.9484 4.8728 16.9484 3.92C16.9484 2.9672 16.6202 2.1447 15.962 1.48645C15.3072 0.831614 14.4995 0.5 13.5684 0.5C12.6156 0.5 11.7931 0.828195 11.1349 1.48645C10.4766 2.1447 10.1484 2.9672 10.1484 3.92C10.1484 4.8728 10.4766 5.6953 11.1349 6.35355ZM20.7833 6.35355C21.4416 7.01181 22.2641 7.34 23.2169 7.34C24.148 7.34 24.9556 7.00839 25.6104 6.35355C26.2687 5.6953 26.5969 4.8728 26.5969 3.92C26.5969 2.9672 26.2687 2.1447 25.6104 1.48645C24.9556 0.831614 24.148 0.5 23.2169 0.5C22.2641 0.5 21.4416 0.828195 20.7833 1.48645C20.1251 2.1447 19.7969 2.9672 19.7969 3.92C19.7969 4.8728 20.1251 5.6953 20.7833 6.35355Z" fill="#AB52EE" stroke="white" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen === item.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-lg z-50">
                      <button
                        onClick={() => alert('Edit not implemented')}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Field */}
        <div className="mt-10">
          <label className="block mb-2 text-sm text-gray-700">Coupon</label>
          <input
            type="text"
            placeholder="Enter coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full max-w-sm border border-gray-300 outline-none rounded-lg p-3"
          />
        </div>

        {/* Summary */}
        <div className="mt-10 border-t border-gray-300 pt-6">
          <div className="flex flex-col w-full space-y-2 text-sm text-gray-700">
            <div className="flex justify-between w-full max-w-md">
              <span className="font-light">Sub-Total :</span>
              <span className="font-medium">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-full max-w-md">
              <span className="font-light">Discount :</span>
              <span className="font-medium">₦0</span>
            </div>
            <div className="flex justify-between w-full max-w-md">
              <span className="font-medium text-lg">Total :</span>
              <span className="font-medium text-lg">₦{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="flex justify-center mt-8">
            <button className="bg-gradient text-white font-medium px-16 py-3 cursor-pointer">
              Checkout | ₦{total.toLocaleString()}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default CartPage;
