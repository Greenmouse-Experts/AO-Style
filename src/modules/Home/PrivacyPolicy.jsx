import React from "react";
import Breadcrumb from "./components/Breadcrumb";

const Privacy = () => {
   
    const dataCollection = [
        {
            description: "Personal data means any information that can be used to identify directly or indirectly a specific individual. We collect your personal data in order to provide tailored products and services and in order to analyse and continually improve our products and services. We may collect, use, store and transfer different kinds of personal data for marketing and personal data optimization purposes. Oastyles also uses Google Digital Marketing to propose targeted offers for certain products and services to our customers.You provide us with your personal data when you register your personal details on our website and mobile platforms and transact with the same."
        },
        {
            description: "The personal data we collect includes:  Information you provide to us: We receive and store the information you provide to us including your identity data, contact data, biometric data, delivery address and financial data. These types of personal data may include:  contact details (such as your name, postal addresses, phone numbers and email addresses),  demographic information (such as your date of birth, age or age range and gender),  online registration information (such as your password and other authentication information),  payment information (such as your credit card information and billing address),  information provided as part of online questionnaires (such as responses to any customer satisfaction surveys or market research), competition entries/submissions, and in certain cases your marketing preferences.  Information we automatically collect/generate or obtain from third parties: We automatically collect and store certain types of information regarding your use of the oastyles marketplace including information about your searches, views, downloads and purchases. In addition, we may receive information about you from third parties including our carriers; payment service providers; merchants/brands; and advertising service providers.  These types of personal data may relate to your device (such as your PC, tablet or other mobile device), your use of our websites and apps (as well as certain third-party websites with whom we have partnered), and/or your personal preferences, interests, or geographic location."
        },
        {
            description: "Examples of these types of information include: name and age (or predicted age range), information about your device, operating system, browser and IP address, unique identifiers associated with your device, details of web pages that you have visited, which products you have looked at online (including information about products you have searched for or viewed, purchased or added to an online shopping basket), how long you spend on certain areas of a website or app together with the date and time of your visit/usage, personal data contained within user-generated content (such as blogs and social media postings), social media username or ID, and social media profile photo and other social media profile information (such as number of followers). We strive to provide you with choices regarding the Personal Data that you provide to us. Where required by law, if you wish to have your Personal Data used by oastyles to provide you with a personalized experience/targeted advertising & content, you can indicate so through the relevant tick-box(es) located on the registration form or by answering the question(s) presented by oastyles representatives. If you decide that you no longer wish to benefit from this personalization, you can opt-out or adjust your preferences at any time by closing your account or by sending an email to info@carybin.com. You can close your account by clicking on this link and following the instructions. Once your account is closed, all products and services that you access through your account will no longer be available. "
        },
    ];

    const cookiesInfo = {
        text: "A cookie is a small file of letters and numbers that we put on your computer, mobile phone or tablet if you agree. Cookies allow us to distinguish you from other users of our website and mobile applications, which helps us to provide you with an enhanced browsing experience. For more information about cookies and how we use them, please read our Cookie Notice: "
    };

    const dataUsage = [
        {
            description: "We use your personal data to operate, provide, develop and improve the products and services that we offer, including the following:  Registering you as a new customer. Processing and delivering your orders. Managing your relationship with us. Enabling you to participate in promotions, competitions and surveys.  Improving our website, applications, products and services. Recommending/advertising products or services which may be of interest to you.  Enabling you to access certain products and services offered by our partners and vendors.  Complying with our legal obligations, including verifying your identity where necessary. n Detecting fraud. "
        },
    ];

    const sharingData = {
        text: "We will only process your personal data where we have a legal basis to do so. The legal basis will depend on the purposes for which we have collected and used your personal data. In almost every case the legal basis will be one of the following: Consent: For example, where you have provided your consent to receive certain marketing from us. You can withdraw your consent at any time, including by clicking on the 'unsubscribe' link at the bottom of any marketing email we send you  Our legitimate business interests: Where it is necessary for us to understand our customers, promote our services and operate effectively, provided in each case that this is done in a legitimate way which does not unduly affect your privacy and other rights.  Performance of a contract with you: This would also apply where we need to take steps prior to entering into a contract with you. For example, where you have purchased a product from us and we need to use your contact details and payment information in order to process your order and send the product to you.  Compliance with law: Where we are subject to a legal obligation and need to use your personal data in order to comply with that obligation. :"
    };

    // New sections from the screenshot
    const dataSharing = [
        {
            title: "A. We may need to share your personal data with third parties for the following purposes:",
            items: [
                "Sale of products and services in order to deliver products and services purchased on our marketplace from third parties, we may be required to provide your personal data to such third parties.",
                "Working with third party service providers: We engage third parties to perform certain functions on our behalf. Examples include fulfilling orders for products or services, delivering packages, analyzing data, providing marketing assistance, processing payments, transmitting content, extending and managing credit risk, and providing customer service.",
                "Business transfers: As we continue to develop our business, we might sell or buy other businesses or services. In such transactions, customer information may be transferred together with other business assets.",
                "Detecting fraud and abuse, the relative account and other personal data to other companies and organizations for fraud protection and credit risk reduction, and to comply with applicable law."
            ]
        },
        {
            title: "B. When we share your personal data with third parties, we:",
            items: [
                "require them to agree to use your data in accordance with the terms of this Privacy Notice, our Privacy Policy and in accordance with applicable law; and only permit them to process your personal data for specified purposes and in accordance with our instructions. We do not allow our third-party service providers to use your personal data for their own purposes."
            ]
        }
    ];

    const internationalTransfers = {
        description: "We may transfer your personal data to locations in another country, if this is permissible pursuant to applicable laws in your location. These are relevant risks in such transfers.",
        points: [
            "In the event of international transfers of your personal data, we shall put in place measures necessary to protect your data and ensure the same trend of protection available in the country of data origin. We shall continue to respect your legal rights pursuant to the terms of this Privacy Notice and applicable laws in your location."
        ]
    };

    const dataRetention = {
        description: "We will take every reasonable step to ensure that your personal data is processed for the minimum period necessary for the purposes set out in this Privacy Notice. Your Personal Data may be retained in a form that allows for identification only for as long as:",
        points: [
            "We maintain an ongoing relationship with you. This will enable us to improve your experience with us and to ensure that you receive communications from us",
            "Your personal data is necessary in connection with the purposes set out in this Privacy Notice and we have a valid legal basis.",
            "The duration of all any applicable limitation period (i.e., any period during which a person could bring a legal claim against us), and",
            "We will actively review the personal data we had and delete it securely, or in some cases anonymize it, when there is no longer a legal, business or consumer need for it to be retained."
        ]
    };

    const dataSecurity = {
        description: "We have put in place security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.",
        points: [
            "In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions, and they are subject to a duty of confidentiality.",
            "We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so."
        ]
    };

    const legalRights = {
        description: "All it is important that the personal data we hold about you is accurate and current. Please keep us informed if your personal data changes during your relationship with us.",
        points: [
            "Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct or erase your personal data, object to or restrict processing of your personal data, right to ask that we transfer your personal data to a third party, and unsubscribe from our emails and newsletters.",
            "Where you wish to permanently delete your data from our website and other applications, you can choose the option of closing your account. You can close your account by clicking on this link and following the instructions. Once your account is closed, all products and services that you access through your account will no longer be available.",
            "We can refuse to accede to your request where it is unreasonable or where you have failed to provide additional information necessary to confirm your identity."
        ]
    };

    const dataControllers = {
        description: "If you have any questions or concerns about Oasiyahs Privacy Notice or you are looking for more information on how we process your personal data, or wish to exercise your legal rights in respect of your personal data, please contact the Data Privacy Officer by email at datan@partylink.com.",
        points: [
            "We will investigate any complaint about the way we manage Personal Data and ensure that we respond to all administered complaints within prescribed timelines."
        ]
    };

    return (
        <>
            <Breadcrumb
                title="Privacy Policy"
                subtitle="Our Commitment to Privacy"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg"
            />
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="">
                        <div className="mt-14 mb-8">
                            <p className="text-black text-base leading-loose mb-16">
                            This Privacy Notice provides information on how Carybin/Oastyles collects and processes your personal data when you visit our website or mobile applications. It sets out what we do with your personal data and how we keep it secure and explains the rights that you have in relation to your personal data.  
                            </p>
                        </div>
                       

                        {/* Data Collection Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                THE DATA WE COLLECT ABOUT YOU
                            </h2>
                            {dataCollection.map((item, index) => (
                                <p key={index} className="text-black mb-2 leading-loose">- {item.description}</p>
                            ))}
                        </div>

                        {/* Cookies Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                COOKIES AND OTHER IDENTIFIERS
                            </h2>
                            <p className="text-black leading-loose mb-2">{cookiesInfo.text}</p>
                        </div>

                        {/* How We Use Your Data Section */}
                        <div className="mb-8">
                            <h2 className="text-lg  text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                HOW WE USE YOUR PERSONAL DATA
                            </h2>
                            {dataUsage.map((item, index) => (
                                <p key={index} className="text-black mb-2 leading-loose">- {item.description}</p>
                            ))}
                        </div>

                        {/* How We Share Your Data Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                LEGAL BASIS FOR THE PROCESSING OF PERSONAL DATA  
                            </h2>
                            <p className="text-black mb-2 leading-loose">{sharingData.text}</p>
                        </div>

                        {/* HOW WE SHARE YOUR PERSONAL DATA Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                HOW WE SHARE YOUR PERSONAL DATA
                            </h2>
                            {dataSharing.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-4">
                                    <p className="text-black font-medium mb-2">{section.title}</p>
                                    <ul className="list-disc pl-5">
                                        {section.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="text-black mb-2 leading-loose">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* INTERNATIONAL TRANSFERS Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                INTERNATIONAL TRANSFERS
                            </h2>
                            <p className="text-black mb-2 leading-loose">{internationalTransfers.description}</p>
                            <ul className="list-disc pl-5">
                                {internationalTransfers.points.map((point, index) => (
                                    <li key={index} className="text-black mb-2 leading-loose">{point}</li>
                                ))}
                            </ul>
                        </div>

                        {/* DATA RETENTION Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                DATA RETENTION
                            </h2>
                            <p className="text-black mb-2 leading-loose">{dataRetention.description}</p>
                            <ul className="list-disc pl-5">
                                {dataRetention.points.map((point, index) => (
                                    <li key={index} className="text-black mb-2 leading-loose">{point}</li>
                                ))}
                            </ul>
                        </div>

                        {/* DATA SECURITY Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                DATA SECURITY
                            </h2>
                            <p className="text-black mb-2 leading-loose">{dataSecurity.description}</p>
                            <ul className="list-disc pl-5">
                                {dataSecurity.points.map((point, index) => (
                                    <li key={index} className="text-black mb-2 leading-loose">{point}</li>
                                ))}
                            </ul>
                        </div>

                        {/* YOUR LEGAL RIGHTS Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                YOUR LEGAL RIGHTS
                            </h2>
                            <p className="text-black mb-2 leading-loose">{legalRights.description}</p>
                            <ul className="list-disc pl-5">
                                {legalRights.points.map((point, index) => (
                                    <li key={index} className="text-black mb-2 leading-loose">{point}</li>
                                ))}
                            </ul>
                        </div>

                        {/* DATA CONTROLLERS & CONTACT Section */}
                        <div className="mb-8">
                            <h2 className="text-lg text-center font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                DATA CONTROLLERS & CONTACT
                            </h2>
                            <p className="text-black mb-2 leading-loose">{dataControllers.description}</p>
                            <ul className="list-disc pl-5">
                                {dataControllers.points.map((point, index) => (
                                    <li key={index} className="text-black mb-2 leading-loose">{point}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Privacy;