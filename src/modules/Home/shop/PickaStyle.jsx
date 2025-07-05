import React, { Component } from 'react'
import Details from "../components/Details";
import Breadcrumb from "../components/Breadcrumb";
export default class PickaStyle extends Component {
    render() {
        return (
            <>
                <Breadcrumb
                    title="Pick A Style "
                    subtitle="Luxury Linen"
                    just="Pick A Style"
                    backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744156885/AoStyle/image_1_v4nyzx.jpg"
                />
                <div className="Resizer px-4">
                    <div className="bg-[#FFF2FF] Push p-4 rounded-lg mb-6">
                        {/* Header */}
                        <h2 className="text-sm font-medium text-gray-500 mb-4">FABRIC</h2>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <img
                                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png"
                                    alt="product"
                                    className="w-20 h-20 rounded object-cover"
                                />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-medium">Luxury Embellished Lace Fabrics</h3>
                                <p className="mt-1 text-sm ">X 2 Yards</p>
                                <p className="mt-1 text-[#2B21E5] text-sm ">N 24,000</p>
                            </div>
                        </div>
                    </div>
                    <Details />
                </div>
            </>
        )
    }
}