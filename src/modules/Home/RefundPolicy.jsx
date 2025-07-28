import React from "react";
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";

const ReturnsPolicy = () => {
  return (
    <>
      <Breadcrumb
        title="Return Policy"
        subtitle="Our Return Policy"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg"
      />
      <div className="w-full flex flex-col">
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
          <header className="mt-10">
            <p className="text-base mb-6 leading-loose">
              At Carybin ltd, we want you to have a positive experience every
              time you shop with us. Occasionally though, we know you may want
              to return items you have purchased. This Returns Refunds Policy
              sets out our conditions for accepting returns and issuing refunds
              for items purchased on Carybin on behalf of our sellers. It also
              sets out when we will not accept returns or issue refunds.
            </p>
          </header>

          <section className="">
            <h2 className="text-xl font-medium mb-4">
              1. Return period and conditions for acceptance of returns
            </h2>
            <p className="mb-4 leading-loose">
              Subject to the rules set out in this Returns and Refunds Policy,
              sellers on Carybin offer returns for most items within 7 days post
              delivery. We do not accept returns, for any reason whatsoever,
              after the returns period has lapsed. This does not affect your
              legal rights against the seller. You may return items purchased on
              Carybin within the returns period, for the reasons listed below:
            </p>

            <div className="border border-gray-300 rounded-md overflow-hidden mb-4 leading-loose">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left border-b border-gray-300">
                      Reason for Return
                    </th>
                    <th className="p-4 text-left border-b border-gray-300">
                      Applicable Product Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b border-gray-200">
                      Size is correct but doesn't fit as a result of the tailors
                      fault 
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      All tailored outfits 
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-gray-200">
                      Item received defective (Stains, torn, incomplete
                      measurement) 
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      All product categories  
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-gray-200">
                      Item does not match chosen style 
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      All tailored outfits 
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-gray-200">
                      Wrong item/color/size/model 
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      All product categories
                    </td>
                  </tr>
                  {/* <tr>
                                        <td className="p-4 border-b border-gray-200">Item received with missing parts or accessories</td>
                                        <td className="p-4 border-b border-gray-200">All product categories</td>
                                    </tr> */}
                </tbody>
              </table>
            </div>
          </section>

          <section className="">
            <h2 className="text-xl font-medium mb-4 leading-loose">
              2. Items that cannot be returned
            </h2>
            <p className="mb-4 leading-loose">
              You shall only be entitled to return and refund in respect of
              these items if you received the wrong item, a damaged or defective
              item, or a fake or inauthentic item. We do not accept returns of
              customized items, items you have damaged after delivery, or
              used/worn items unless they became damaged or defective after
              reasonable use.
            </p>
          </section>

          <section className="">
            <h2 className="text-xl font-medium mb-4 leading-loose">
              3. Packaging returns
            </h2>
            <p className="mb-4 leading-loose">
              When returning an item for any reason, you must do so in the exact
              condition you received it from Jumia, with its original packaging
              and all tags and labels attached. Returned items are your
              responsibility until they reach us, so ensure they are packaged
              properly and can't get damaged on the way.
            </p>
          </section>

          <section className="">
            <h2 className="text-xl font-medium mb-4 leading-loose">
              4. Refunds
            </h2>
            <p className="mb-4 leading-loose">
              If we accept your return, we aim to refund you the purchase price
              of the item within the period stated on the return timelines page.
              For incorrect, defective, or damaged items, you will also be
              refunded for the delivery costs.
            </p>
          </section>

          <section className="">
            <h2 className="text-xl font-medium mb-4 leading-loose">
              5. Rejected return and refund requests
            </h2>
            <p className="mb-4 leading-loose">
              All items are inspected on return to verify the reasons provided.
              If your return request is not approved, we will make two
              re-delivery attempts. If unsuccessful, you must collect the item
              within 60 days, failing which the item will be forfeited.
            </p>
          </section>

          <section className="">
            <h2 className="text-xl font-medium mb-4 leading-loose">
              6. No Exchange
            </h2>
            <p className="mb-4 leading-loose">
              We do not offer exchanges. If you would like a different size or
              color, please return your unwanted item and place a new order.
            </p>
          </section>
        </div>
      </div>
      <ShippingInfo />
    </>
  );
};

export default ReturnsPolicy;
