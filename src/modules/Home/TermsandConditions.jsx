import React from "react";
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";

const TermsAndConditions = () => {
    const introduction = [
        {
            title: "1.1",
            content: `"Oasiyter" is a product name for Carybin Limited. Carybin Limited operates the oasiytes e-commerce platform consisting of a website and mobile application ("marketplace") together with supporting IT logistics and payment infrastructure for the sale and purchase of fabrics ("products").`
        },
        {
            title: "1.2",
            content: "These general terms and conditions shall apply to buyers and sellers on the marketplace and shall govern your use of the marketplace and related services."
        },
        {
            title: "1.3",
            content: "By using our marketplace, you accept these general terms and conditions in full. If you disagree with these general terms and conditions or any part of these general terms and conditions, you must not use our marketplace."
        },
        {
            title: "1.4",
            content: "If you use our marketplace in the course of a business or other organizational project, then by so doing, you:",
            subItems: [
                "Confirm that you have obtained the necessary authority to agree to these general terms and conditions;",
                "Hold both yourself and the person company or other legal entity that operates that business or organizational project to these general terms and conditions; and",
                "agree that you in these general terms and conditions shall reference both the individual user and the relevant person company or legal entity unless the contact requires otherwise."
            ]
        }
    ];

    const registration = [
        {
            title: "2.1",
            content: "You may not register with our marketplace if you are under its years of age (by using our marketplace or agreeing to these general terms and conditions you warrant and represent us us that you are at least 18 years of age)."
        },
        {
            title: "2.2",
            content: "If you register for an account with our marketplace, you will be asked to provide an email address/user ID and password and you agree to:",
            subItems: [
                "keep your password confidential;",
                "Notify us in writing immediately (using our contact details provided at section 1) if you become aware of any disclosure of your password; and be responsible for any activity on our marketplace arising out of any failure to keep your password confidential and that you may be held liable for any losses arising out of such a failure.",
                "Your account shall be used exclusively by you, and you shall not transfer your account to any third party. If you authorize any third party to manage your account on your behalf this shall be at your own risk.",
                "We may suspend or cancel your account and/or edit your account details at any time in our sole discretion and without notice or explanation providing that if we cancel any products or services you have paid for but not received and you have not breached these general terms and conditions, we will refund you in respect of the same."
            ]
        },
        {
            title: "2.3",
            content: "You may cancel your account on our marketplace by contacting us"
        }
    ];

    const termsOfSale = [
        {
            title: "3.1",
            content: "You acknowledge and agree that:",
            subItems: [
                "the marketplace provides an online location for sellers to sell and buyers to purchase products;",
                "we shall accept binding sales on behalf of sellers but Unless Oasiytes is indicated as the seller/ Carybin is not a party to the transaction between the seller and the buyer; and",
                "a contract for the sale and purchase of a product or products will come into force between the buyer and seller and accordingly you commit to buying or selling the relevant product or products upon the buyers' confirmation of purchase via the marketplace."
            ]
        },
        {
            title: "3.2",
            content: "Subject to these general terms and conditions the sellers' terms of business shall govern the contract for sale and purchase between the buyer and the seller. Notwithstanding this the following provisions will be incorporated into the contract of sale and purchase between the buyer and the seller:",
            subItems: [
                "the price for a product will be as stated in the relevant product listing;",
                "the price for the product must include all taxes and comply with applicable laws in force from time to time;",
                "delivery charges, packaging charges, handling charges, administrative charges, insurance costs other ancillary costs and charges where applicable will only be payable by the buyer if this is expressly and clearly stated in the product listing; and delivery of digital products may be made electronically;",
                "products must be of satisfactory quality fit and safe for any purpose specified in and conform in all material respects to the product listing and any other description of the products supplied or made available by the seller to the buyer; and",
                "In respect of physical products sold the seller warrants that the seller has good title to and is the sole legal and beneficial owner of the products and/or has the right to supply the products pursuant to this agreement and that the products are not subject to any third party rights or restrictions including in respect of third party intellectual property rights and/or any criminal inadvertency or tax investigation or proceedings; and in respect of digital products the seller warrants that the seller has the right to supply the digital products to the buyer."
            ]
        }
    ];

    const returnsRefunds = [
        {
            title: "4.1",
            content: "Returns of products by buyers and acceptance of returned products by sellers shall be managed by us in accordance with the returns page on the marketplace as may be amended from time to time. Acceptance of returns shall be in our discretion subject to compliance with applicable laws of the territory."
        },
        {
            title: "4.2",
            content: "Refunds in respect of returned products shall be managed in accordance with the refunds page on the marketplace as may be amended from time to time. Our rates on refunds shall be exercised in our discretion subject to applicable laws of the territory. We may offer refunds in our discretion:",
            subItems: [
                "In respect of the product price;",
                "Deal and/or international shipping fees (as stated on the refunds page); and",
                "by way of store credits vexichers, mobile money transfer, bank transfers or such other methods as we may determine from time to time."
            ]
        },
        {
            title: "4.3",
            content: "Returned products shall be accepted and refunds issued by Carybin acting for and on behalf of the seller. Notwithstanding paragraphs 4.1 and 4.2 above in respect of digital products or services, Carybin shall issue refunds in respect of failures in delivery only. Refunds of payment for such products for any other reasons shall be subject to the sellers' terms and conditions of sale."
        },
        {
            title: "4.4",
            content: "Changes to our returns page or refunds page shall be effective in respect of all purchases made from the date of publication of the change on our website."
        }
    ];
    const contentRights = [
        {
            title: "5.1",
            content: "You grant to us a worldwide irrevocable non-exclusive royalty-free license to use, reproduce, store, adapt, publish, translate, and distribute your content on our marketplace and across our marketing channels and any existing or future media."
        },
        {
            title: "5.2",
            content: "You grant to us the right to sub-license the rights licensed under section 8.1"
        },
        {
            title: "5.3",
            content: "You grant to us the right to bring an action for infringement of the rights licensed under section 8.1"
        },
        {
            title: "5.4",
            content: "You hereby waive all your moral rights in your content to the maximum extent permitted by applicable law; and you warrant and represent that all other moral rights in your content have been waived to the maximum extent permitted by applicable law."
        },
        {
            title: "5.5",
            content: "Without prejudice to our other rights under these general terms and conditions if you breach our rules on content in any way or if we reasonably suspect that you have breached our rules on content, we may delete unpublish or edit any or all of your content."
        }
    ];

    const websiteUse = [
        {
            title: "6.1",
            content: "In this section the words 'marketplace' and 'website' shall be used interchangeably to refer to oasiyle websites and mobile applications."
        },
        {
            title: "6.2",
            content: "You may:",
            subItems: [
                "view pages from our website in a web browser;",
                "download pages from our website for caching in a web browser;",
                "print pages from our website for your own personal and non-commercial use providing that such printing is not systematic or excessive;",
                "stream audio and video files from our website using the media player on our website; and",
                "use our marketplace services by means of a web browser subject to the other provisions of these general terms and conditions."
            ]
        },
        {
            title: "6.3",
            content: "Except as expressly permitted by section 10.2 or the other provisions of these general terms and conditions you must not download any material from our website or save any such material to your computer."
        },
        {
            title: "6.4",
            content: "You may only use our website for your own personal and business purposes in respect of selling or purchasing products on the marketplace."
        },
        {
            title: "6.5",
            content: "Except as expressly permitted by these general terms and conditions you must not edit or otherwise modify any material on our website."
        },
        {
            title: "6.6",
            content: "Unless you own or control the relevant rights in the material you must not:",
            subItems: [
                "republish material from our website (including republication on another website);",
                "sell rent or sub-license material from our website;",
                "show any material from our website in public;",
                "exploit material from our website for a commercial purpose; or",
                "redistribute material from our website."
            ]
        },
        {
            title: "6.7",
            content: "Notwithstanding section 10.6 you may forward links to products on our website and redistribute our newsletter and promotional materials in print and electronic form to any person."
        },
        {
            title: "6.8",
            content: "We reserve the right to suspend or restrict access to our website to areas of our website and/or to functionality upon our website. We may for example suspend access to the website during server maintenance or when we update the website. You must not circumvent or bypass or attempt to circumvent or bypass any access restriction measures on the website."
        },
        {
            title: "6.9",
            content: "You must not:",
            subItems: [
                "use our website in any way or take any action that causes or may cause damage to the website or impairment of the performance availability accessibility integrity or security of the website;",
                "use our website in any way that is unethical, unlawful, illegal, fraudulent or harmful or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity;",
                "hack or otherwise tamper with our website;",
                "probe, scan or test the vulnerability of our website without our permission;",
                "circumvent any authentication or security systems or processes on or relating to our website;",
                "use our website to copy, store, host, transmit, send, use, publish or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm keystroke logger rootkit or other malicious computer software;",
                "impose an unreasonably large load on our website resources (including bandwidth usage capacity and processing capacity);",
                "decrypt or decipher any communications sent by or to our website without our permission;",
                "conduct any systematic or automated data collection activities (including without limitation scraping data mining data extraction and data harvesting) on or in relation to our website without our express written consent;",
                "access or otherwise interact with our website using any robot spider or other automated means except for the purpose of search engine indexing;",
                "use our website except by means of our public interfaces;",
                "violate the directives set out in the robots.txt file for our website;",
                "use data collected from our website for any direct marketing activity (including without limitation email marketing, SMS marketing, telemarketing, and direct mailing); or",
                "do anything that interferes with the normal use of our website."
            ]
        }
    ];

    const copyrightTrademarks = [
        {
            title: "7.1",
            content: "Subject to the express provisions of these general terms and conditions:",
            subItems: [
                "we together with our licensors own and control all the copyright and other intellectual property rights in our website and the material on our website; and",
                "all the copyright and other intellectual property rights in our website and the material on our website are reserved."
            ]
        },
        {
            title: "7.2",
            content: "Oasiyle's logos and our other registered and unregistered trademarks are trademarks belonging to us; we give no permission for the use of these trademarks and such use may constitute an infringement of our rights."
        },
        {
            title: "7.3",
            content: "The third party registered and unregistered trademarks or service marks on our website are the property of their respective owners, and we do not endorse and are not affiliated with any of the holders of any such rights and as such we cannot grant any license to exercise such rights."
        }
    ];

    const dataPrivacy = [
        {
            title: "8.1",
            content: "Buyers agree to processing of their personal data in accordance with the terms of Cabrybin Limited/oasiyle's Privacy and Cookie Notice."
        },
        {
            title: "8.2",
            content: "Carybin shall process all personal data obtained through the marketplace and related services in accordance with the terms of our Privacy and Cookie Notice and Privacy Policy."
        },
        {
            title: "8.3",
            content: "Sellers shall be directly responsible to buyers for any misuse of their personal data and Carybin shall bear no liability to buyers in respect of any misuse by sellers of their personal data."
        }
    ];
    const dueDiligence = [
        {
            title: "9.1",
            content: "We operate an anti-fraud and anti-money laundering compliance program and reserve the right to perform due diligence checks on all users of the marketplace."
        },
        {
            title: "9.2",
            content: "You agree to provide to us all such information documentation and access to your business premises as we may require:",
            subItems: [
                "In order to verify your adherence to and performance of your obligations under these terms and conditions;",
                "for the purpose of disclosures pursuant to a valid order by a court or other governmental body; or",
                "as otherwise required by law or applicable regulation."
            ]
        }
    ];

    const marketplaceRole = [
        {
            title: "10.1",
            content: "You acknowledge that:",
            subItems: [
                "Carybin Limited through oastyles.com facilitates a marketplace for buyers and third party sellers or oastyles where oastyles is the seller of a product;",
                "the relevant seller of the product (whether oastyle is the seller or whether it is a third party seller) shall at all times remain exclusively liable for the products they sell on the marketplace; and",
                "in the event that there is an issue arising from the purchase of a product on the marketplace the buyer should seek recourse from the relevant seller of the product by following the process set out in Carybin's/oastyle Dispute Resolution Policy"
            ]
        },
        {
            title: "10.2",
            content: "We commit to ensure that oastyle or third party sellers as applicable submit information relating to their products on the marketplace that is complete accurate and up to date and pursuant thereto;",
            subItems: [
                "The relevant seller warrants and represents the completeness and accuracy of their information published on our marketplace relating to their products;",
                "the relevant seller warrants and represents that the material on the marketplace is up to date; and",
                "If a buyer has a complaint relating to the accuracy or completeness of the product information received from a seller (including where oastyle is the seller) the buyer can seek recourse from the relevant seller by following the process set out in the Carybin's/oastyle 's Dispute Resolution Policy."
            ]
        },
        {
            title: "10.3",
            content: "We do not warrant or represent that the marketplace will operate without fault; or that the marketplace or any service on the marketplace will remain available during the occurrence of events beyond carybin's control (once majeure events) which include but are not limited to: flood, drought, earthquake or other natural disasters; hacking, viruses, malware or other malicious software attacks on the marketplace; terrorist attacks, civil war, civil commotion or riots; war, threat of or preparation for war; epidemics or pandemics; or extra-constitutional events or circumstances which materially and adversely affect the political or macro-economic stability of the territory as a whole."
        },
        {
            title: "10.4",
            content: "We reserve the right to discontinue or alter any or all of our marketplace services and to stop publishing our marketplace at any time in our sole discretion without notice or explanation; and you will not be entitled to any compensation or other payment upon the discontinuance or alteration of any marketplace services or if we stop publishing the marketplace. This is without prejudice to your rights in respect of any unfulfilled orders or other existing liabilities of Carybin."
        },
        {
            title: "10.5",
            content: "If we discontinue or alter any or all of our marketplace in circumstances not relating to force majeure use will provide prior notice to the buyers and sellers of not less than fifteen (15) days with clear guidance on the way forward for the pending transactions or other existing liabilities of carybin."
        },
        {
            title: "10.6",
            content: "We do not guarantee any commercial results concerning the use of the marketplace. To the maximum extent permitted by applicable law and subject to section 15.1 below we exclude all representations and warranties relating to the subject matter of these general terms and conditions our marketplace and the use of our marketplace."
        }
    ];

    const liabilityLimitations = [
        {
            title: "11.1",
            content: "Nothing in these general terms and conditions will:",
            subItems: [
                "Limit any liabilities in any way that is not permitted under applicable law; or",
                "exclude any liabilities or statutory rights that may not be excluded under applicable law."
            ]
        },
        {
            title: "11.2",
            content: "The limitations and exclusions of liability set out in this section 15 and elsewhere in these general terms and conditions:",
            subItems: [
                "are subject to section 15.1; and",
                "govern all liabilities arising under these general terms and conditions or relating to the subject matter of these general terms and conditions including liabilities arising in contract in tort (including negligence) and for breach of statutory duty except to the extent expressly provided otherwise in these general terms and conditions."
            ]
        },
        {
            title: "11.3",
            content: "In respect of the services offered to you free of charge we will not be liable to you for any loss or damage of any nature whatsoever."
        },
        {
            title: "11.4",
            content: "Our aggregate liability to you in respect of any contract to provide services to you under these general terms and conditions shall not exceed the total amount paid and payable to us under the contract. Each separate transaction on the marketplace shall constitute a separate contract for the purpose of this section 15."
        },
        {
            title: "11.5",
            content: "Notwithstanding section 15.4 above we will not be liable to you for any loss or damage of any nature including in respect of:",
            subItems: [
                "any losses occasioned by any interruption or dysfunction to the website;",
                "any losses arising out of any event or events beyond our reasonable control;",
                "any business losses including (without limitation) loss of or damage to profits, income, revenue, use, production, anticipated savings, business contracts, commercial opportunities or goodwill;",
                "any loss or corruption of any data database or software; or",
                "any special indirect or consequential loss or damage."
            ]
        },
        {
            title: "11.6",
            content: "We accept that we have an interest in limiting the personal liability of our officers and employees and having regard to that interest you acknowledge that we are a limited liability entity; you agree that you will not bring any claim personally against our officers or employees in respect of any losses you suffer in connection with the marketplace or these general terms and conditions (this will not limit or exclude the liability of the limited liability entity itself for the acts and omissions of our officers and employees)."
        },
        {
            title: "11.7",
            content: "Our marketplace includes hyperlinks to other websites owned and operated by third parties; such hyperlinks are not recommendations. We have no control over third party websites and their contents, and we accept no responsibility for them or for any loss or damage that may arise from your use of them."
        }
    ];
    const indemnification = [
        {
            title: "12.1",
            content: "You hereby indemnify us and undertake to keep us indemnified against:",
            subItems: [
                "any and all losses, damages, costs, liabilities and expenses (including without limitation legal expenses and any amounts paid by us to any third party in settlement of a claim or dispute) incurred or suffered by us and arising directly or indirectly out of your use of our marketplace or any breach by you of any provision of these general terms and conditions or the Carybin codes, policies or guidelines; and",
                "any VAT liability or other tax liability that we may incur in relation to any sale supply or purchase made through our marketplace where that liability arises out of your failure to pay, withhold, declare, or register to pay any VAT or other tax properly due in any jurisdiction."
            ]
        }
    ];

    const breaches = [
        {
            title: "13.1",
            content: "If we permit the registration of an account on our marketplace it will remain open indefinitely subject to these general terms and conditions."
        },
        {
            title: "13.2",
            content: "If you breach these general terms and conditions or if we reasonably suspect that you have breached these general terms and conditions or any Carybin codes, policies or guidelines in any way we may:",
            subItems: [
                "temporarily suspend your access to our marketplace;",
                "permanently prohibit you from accessing our marketplace;",
                "block computers using your IP address from accessing our marketplace;",
                "contact any or all of your Internet service providers and request that they block your access to our marketplace;",
                "suspend or delete your account on our marketplace; and/or",
                "commence legal action against you whether for breach of contract or otherwise."
            ]
        },
        {
            title: "13.3",
            content: "Where we suspend, prohibit or block your access to our marketplace or a part of our marketplace you must not take any action to circumvent such suspension or prohibition or blocking (including without limitation creating and/or using a different account)."
        }
    ];

    const entireAgreement = [
        {
            title: "14.1",
            content: "These general terms and conditions and the Carybin codes, policies and guidelines (and in respect of sellers the seller terms and conditions) shall constitute the entire agreement between you and us in relation to your use of our marketplace and shall supersede all previous agreements between you and us in relation to your use of our marketplace."
        }
    ];

    const variation = [
        {
            title: "15.1",
            content: "We may revise these general terms and conditions the seller terms and conditions and the carybin codes, policies and guidelines from time to time."
        },
        {
            title: "15.2",
            content: "The revised general terms and conditions shall apply from the date of publication on the marketplace."
        }
    ];

    const noWaiver = [
        {
            title: "16.1",
            content: "No waiver of any breach of any provision of these general terms and conditions shall be construed as a further or continuing waiver of any other breach of that provision or any breach of any other provision of these general terms and conditions."
        }
    ];

    const severability = [
        {
            title: "17.1",
            content: "If a provision of these general terms and conditions is determined by any court or other competent authority to be unlawful and/or unenforceable the other provisions will continue in effect."
        },
        {
            title: "17.2",
            content: "If any unlawful and/or unenforceable provision of these general terms and conditions would be lawful or enforceable if part of it were deleted that part will be deemed to be deleted and the rest of the provision will continue in effect."
        }
    ];

    const assignment = [
        {
            title: "18.1",
            content: "You hereby agree that we may assign transfer sub-contract or otherwise deal with our rights and/or obligations under these general terms and conditions."
        },
        {
            title: "18.2",
            content: "You may not without our prior written consent assign transfer sub-contract or otherwise deal with any of your rights and/or obligations under these general terms and conditions."
        }
    ];

    const thirdPartyRights = [
        {
            title: "19.1",
            content: "A contract under these general terms and conditions is for our benefit and your benefit and is not intended to benefit or be enforceable by any third party."
        },
        {
            title: "19.2",
            content: "The exercise of the parties' rights under a contract under these general terms and conditions is not subject to the consent of any third party."
        }
    ];

    const lawJurisdiction = [
        {
            title: "20.1",
            content: "These general terms and conditions shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria."
        },
        {
            title: "20.2",
            content: "Any disputes relating to these general terms and conditions shall be subject to the exclusive jurisdiction of the courts of Nigeria."
        }
    ];

    const contentRules = [
        {
            title: "21.1",
            content: "In these general terms and conditions your content means:",
            subItems: [
                "all works and materials (including without limitation text, graphics, images, audio material, video material, audio-visual, material scripts software, and files) that you submit to us or our marketplace for storage or publication processing by or onward transmission; and",
                "all communications on the marketplace including product reviews feedback and comments."
            ]
        },
        {
            title: "21.2",
            content: "Your content and the use of your content by us in accordance with these general terms and conditions must be accurate complete and truthful."
        },
        {
            title: "21.3",
            content: "Your content must be appropriate, civil and tasteful and accord with generally accepted standards of etiquette and behaviour on the internet and must not:",
            subItems: [
                "be offensive, obscene, indecent, pornographic, lewd, suggestive, or sexually explicit;",
                "depict violence in an explicit graphic or gratuitous manner; or",
                "be blasphemous in breach of racial or religious hatred or discrimination legislation;",
                "be deceptive, fraudulent, threatening, abusive, harassing, anti-social, menacing, hateful, discriminatory or inflammatory;",
                "cause annoyance inconvenience or needless anxiety to any person; or",
                "constitute spam."
            ]
        },
        {
            title: "21.4",
            content: "Your content must not be illegal or unlawfully infringe any person's legal rights or be capable of giving rise to legal action against any person (in each case in any jurisdiction and under any applicable law). Your content must not infringe or breach:",
            subItems: [
                "any copyright, moral right, database right, trademark right, design right, right in passing off or other intellectual property right;",
                "any right of confidence, right of privacy or right under data protection legislation;",
                "any contractual obligation owed to any person; or",
                "any court order."
            ]
        },
        {
            title: "21.5",
            content: "You must not use our marketplace to link to any website or web page consisting of or containing material that would were it posted on our marketplace breach the provisions of these general terms and conditions."
        },
        {
            title: "21.6",
            content: "You must not submit to our marketplace any material that is or has ever been the subject of any threatened or actual legal proceedings or other similar complaint."
        },
        {
            title: "21.7",
            content: "The review function on the marketplace may be used to facilitate buyer reviews on products. You shall not use the review function or any other form of communication to provide inaccurate inauthentic or fake reviews."
        },
        {
            title: "21.8",
            content: "You must not interfere with a transaction by",
            subItems: [
                "contacting another user to buy or sell an item listed on the marketplace outside of the marketplace; or",
                "communicating with a user involved in an active or completed transaction to warn them away from a particular buyer seller or item; or",
                "contacting another user with the intent to collect any payments."
            ]
        },
        {
            title: "21.9",
            content: "You acknowledge that all users of the marketplace are solely responsible for interactions with other users, and you shall exercise caution and good judgment in your communication with users. You shall not send them personal information including credit card details."
        },
        {
            title: "21.10",
            content: "We may periodically review your content, and we reserve the right to remove any content at our discretion for any reason whatsoever."
        },
        {
            title: "21.11",
            content: "If you learn of any unlawful material or activity on our marketplace or any material or activity that breaches these general terms and conditions, you may inform us by contacting us as provided at section 22."
        }
    ];

    const companyDetails = [
        {
            title: "22.1",
            content: "You can contact us by using the contact details on the website or incorporation documents as can be viewed on the Corporate Affairs Commission website."
        },
        {
            title: "22.2",
            content: "You may contact our sellers for after-sales queries including any disputes by requesting their contact details from us in accordance with the Dispute Resolution Policy pursuant to which Carybin shall be obliged to ensure that the seller is clearly identifiable."
        },
        {
            title: "22.3",
            content: "You consent to receive notices electronically from us. We may provide all communications and information related to your use of the marketplace in electronic format either by posting to our website or application or by email to the email address on your account. All such communications will be deemed to be notices in writing and received by and properly given to you."
        }
    ];


    return (
        <>
            <Breadcrumb
                title="Terms and Conditions"
                subtitle="General Terms and Conditions of Use"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg"
            />
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="mt-14 mb-8">
                        <h1 className="text-lg font-bold text-center text-black mb-8">
                            General Terms and Conditions of Use of the oasiyes Marketplace for Buyers and Sellers
                        </h1>

                        {/* Introduction Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                1. Introduction
                            </h2>
                            {introduction.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Registration and Account Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                2. Registration and account
                            </h2>
                            {registration.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Terms and Conditions of Sale Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                3. Terms and conditions of sale
                            </h2>
                            {termsOfSale.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Returns and Refunds Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                4. Returns and refunds
                            </h2>
                            {returnsRefunds.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Our Rights to Use Your Content Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                5. Our rights to use your content
                            </h2>
                            {contentRights.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Use of Website and Mobile Applications Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                6. Use of website and mobile applications
                            </h2>
                            {websiteUse.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Copyright and Trademarks Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                7. Copyright and trademarks
                            </h2>
                            {copyrightTrademarks.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Data Privacy Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                8. Data privacy
                            </h2>
                            {dataPrivacy.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Due Diligence and Audit Rights Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                9. Due diligence and audit rights
                            </h2>
                            {dueDiligence.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Oastyle's Role as a Marketplace Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                10. Oastyle's role as a marketplace
                            </h2>
                            {marketplaceRole.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Limitations and Exclusions of Liability Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                11. Limitations and exclusions of liability
                            </h2>
                            {liabilityLimitations.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Indemnification Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                12. Indemnification
                            </h2>
                            {indemnification.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Breaches Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                13. Breaches of these general terms and conditions
                            </h2>
                            {breaches.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Entire Agreement Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                14. Entire agreement
                            </h2>
                            {entireAgreement.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Variation Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                15. Variation
                            </h2>
                            {variation.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* No Waiver Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                16. No waiver
                            </h2>
                            {noWaiver.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Severability Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                17. Severability
                            </h2>
                            {severability.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Assignment Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                18. Assignment
                            </h2>
                            {assignment.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Third Party Rights Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                19. Third party rights
                            </h2>
                            {thirdPartyRights.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Law and Jurisdiction Section */}
                        <div className="mb-16">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                20. Law and jurisdiction
                            </h2>
                            {lawJurisdiction.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Rules About Your Content Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                21. Rules about your content
                            </h2>
                            {contentRules.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                    {item.subItems && (
                                        <ul className="list-disc pl-5">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex} className="text-black mb-2 leading-loose">{subItem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Our Company Details and Notices Section */}
                        <div className="mb-16">
                            <h2 className="text-lg font-semibold text-center text-black bg-[#FFEAFF] py-4 mb-4">
                                22. Our company details and notices
                            </h2>
                            {companyDetails.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-black font-medium mb-2">{item.title}. {item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="just"></div>
            <ShippingInfo />
        </>
    );
};

export default TermsAndConditions;