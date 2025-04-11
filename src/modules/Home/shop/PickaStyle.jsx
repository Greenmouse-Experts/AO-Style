import React, { Component } from 'react'
import Details from "../components/Details";

export default class PickaStyle extends Component {
    render() {
        const Breadcrumb = ({ title, subtitle, just, backgroundImage }) => {
            return (
                <div
                    className="bg-cover bg-center h-92 flex items-center justify-center text-white"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    <div className="Resizer Push">
                        <div className=" text-white">
                            <h1 className="text-4xl font-semibold mb-2">{title}</h1>
                            <div className="">
                                <span>{subtitle}</span>
                                <span className="mx-2">{just}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        return (
            <>
                <Breadcrumb
                    title="Pick A Style "
                    subtitle="Home > Oshodi Market >  Luxury Linen >"
                    just="Pick A Style"
                    backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744156885/AoStyle/image_1_v4nyzx.jpg"
                />
                <div className="Resizer px-4">
                    <div className="bg-[#FFF2FF] Push p-4 rounded-lg mb-6">
                        {/* Header */}
                        <h1 className="text-2xl font-medium mb-4">Order Details</h1>
                        {/* Order Info */}
                        {/* <div className="p-4 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                                <div>
                                    <p className="font-medium">Order ID</p>
                                    <p>#ORD123456</p>
                                </div>
                                <div>
                                    <p className="font-medium">Order Date</p>
                                    <p>April 8, 2025</p>
                                </div>
                                <div>
                                    <p className="font-medium">Status</p>
                                    <span className="text-green-600 font-medium">In progress</span>
                                </div>
                            </div>
                        </div> */}
                        {/* Product List */}
                        <div className="rounded-lg p-4">
                            <h3 className="font-medium text-base mb-4">Items Ordered</h3>
                            <div className="divide-y">
                                {/* Example Product */}
                                {[1, 2].map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-3">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png"
                                                alt="product"
                                                className="w-16 h-16 rounded object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">Luxury Lace Fabric</p>
                                                <p className="text-sm text-gray-500">Quantity: 3 yards</p>
                                            </div>
                                        </div>
                                        <p className="font-light text-gray-700">₦15,000</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Action Buttons */}
                        {/* <div className="flex gap-4 float-end">
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
                                Download Invoice
                            </button>
                            <button className="bg-gray-100 text-gray-800 px-6 py-2 rounded border hover:bg-gray-200">
                                Track Order
                            </button>
                        </div> */}
                    </div>
                    <Details />
                </div>
            </>
        )
    }
}
