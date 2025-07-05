import React from "react";
import Breadcrumb from "./components/Breadcrumb";

const CookiesPolicy = () => {
    return (
        <>
            <Breadcrumb
                title="Cookies Policy"
                subtitle="Our Use of Cookies and Similar Technologies"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg"
            />
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="mt-14 mb-8">
                        <p className="text-black text-base leading-loose mb-8">
                            At <span className="font-bold">CARYBIN LTD</span> we value transparency and your privacy. This Cookies Policy explains how we use cookies and similar technologies on our website to enhance your experience, improve our services, and tailor content to your preferences. By using our website, you consent to the use of cookies as described in this policy.
                        </p>

                        {/* What Are Cookies Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                What Are Cookies?
                            </h2>
                            <p className="text-black leading-loose mb-4">
                                Cookies are small text files stored on your device (computer, smartphone, or tablet) when you visit a website. They help websites remember your preferences, track user behavior, and enable features like shopping carts or personalized ads.
                            </p>
                        </div>

                        {/* Types of Cookies Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Types of Cookies
                            </h2>
                            <p className="text-black leading-loose mb-4">
                                We use the following categories of cookies:
                            </p>

                            <div className="space-y-6">
                                {/* Strictly Necessary Cookies */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-md font-semibold text-black mb-2">1. Strictly Necessary Cookies</h3>
                                    <p className="text-black mb-1"><span className="font-medium">Purpose:</span> Essential for website functionality (e.g., enabling login, processing payments, or saving items in your shopping cart).</p>
                                    <p className="text-black mb-1"><span className="font-medium">Example:</span> Session cookies that expire when you close your browser.</p>
                                    <p className="text-black"><span className="font-medium">Consent:</span> These cookies cannot be disabled as they are required for the website to operate.</p>
                                </div>

                                {/* Performance/Analytics Cookies */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-md font-semibold text-black mb-2">2. Performance/Analytics Cookies</h3>
                                    <p className="text-black mb-1"><span className="font-medium">Purpose:</span> Collect anonymous data to analyze website traffic, user behavior, and improve performance.</p>
                                    <p className="text-black mb-1"><span className="font-medium">Example:</span> Google Analytics cookies to track page views, bounce rates, and popular products.</p>
                                    <p className="text-black"><span className="font-medium">Consent:</span> Enabled only with your permission.</p>
                                </div>

                                {/* Functionality Cookies */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-md font-semibold text-black mb-2">3. Functionality Cookies</h3>
                                    <p className="text-black mb-1"><span className="font-medium">Purpose:</span> Remember your preferences (e.g., language, currency, or size selections) for personalized experience.</p>
                                    <p className="text-black mb-1"><span className="font-medium">Example:</span> Cookies that retain your location settings display prices in your local currency.</p>
                                </div>

                                {/* Targeting/Advertising Cookies */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-md font-semibold text-black mb-2">4. Targeting/Advertising Cookies</h3>
                                    <p className="text-black mb-1"><span className="font-medium">Purpose:</span> Deliver tailored ads based on your browsing habits (on our site and third-party platforms).</p>
                                    <p className="text-black mb-1"><span className="font-medium">Example:</span> cookies will help show you relevant fashion items you viewed.</p>
                                    <p className="text-black"><span className="font-medium">Note:</span> These cookies may share data with trusted advertising partners.</p>
                                </div>

                                {/* Third-Party Cookies */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-md font-semibold text-black mb-2">5. Third-Party Cookies</h3>
                                    <p className="text-black mb-1"><span className="font-medium">Purpose:</span> Embedded services (e.g., social media plugins, payment gateways, or live chat tools) may set their own cookies.</p>
                                    <p className="text-black"><span className="font-medium">Examples:</span> Payment processors (e.g., PayPal, Stripe) for transaction security. Social media buttons (e.g., Pinterest 'Save' buttons) for sharing products.</p>
                                </div>
                            </div>
                        </div>

                        {/* How to Manage Cookies Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                How to Manage Cookies
                            </h2>
                            <p className="text-black leading-loose mb-4">
                                You can control or disable cookies through:
                            </p>
                            <ol className="list-decimal pl-5 space-y-3 mb-4">
                                <li className="text-black">
                                    <span className="font-medium">Browser Settings:</span> Adjust preferences in Chrome, Firefox, Safari, or other browsers.
                                    <div className="mt-2 space-x-4">
                                        <a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline">Link to Chrome cookie settings</a>
                                        <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline">Link to Safari cookie settings</a>
                                    </div>
                                </li>
                                <li className="text-black">
                                    <span className="font-medium">Consent Banner:</span> When you first visit our site, you can accept/reject non-essential cookies via our pop-up banner.
                                </li>
                            </ol>
                            <p className="text-black italic">
                                Note: Disabling cookies may limit website functionality (e.g., unable to checkout or save preferences).
                            </p>
                        </div>

                        {/* Changes to This Policy Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Changes to This Policy
                            </h2>
                            <p className="text-black leading-loose">
                                We may update this policy to reflect changes in technology, laws, or our services. The "Last Updated" date at the top will reflect revisions. Check this page periodically for updates.
                            </p>
                        </div>

                        {/* Contact Us Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-black mb-4">
                                Contact Us
                            </h2>
                            <p className="text-black leading-loose mb-2">
                                For questions about our Cookies Policy or data practices, contact us at:
                            </p>
                            <p className="text-black">
                                Email: <a href="mailto:info@carybin.com" className="text-blue-600 hover:underline">info@carybin.com</a>
                            </p>
                        </div>

                        {/* Closing Note */}
                        <div className="py-6 border-t border-gray-200">
                            <p className="text-black text-center">
                                Thank you for choosing <span className="font-bold">Oastyles</span>, a product of <span className="font-bold">CARYBIN LTD</span>
                            </p>
                        </div>

                        {/* Compliance Note */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-black text-sm">
                                This policy complies with the Nigeria Data Protection Act 2023 (NDPA), EU General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CookiesPolicy;