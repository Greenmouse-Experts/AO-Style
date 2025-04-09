import { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import ShippingInfo from "./components/ShippingInfo";
import { Link } from "react-router-dom";

export default function JobBoard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Jobs');
    const Breadcrumb = ({ title, subtitle, just, backgroundImage }) => {
        return (
            <div
                className="bg-cover bg-center h-92 flex items-center justify-center text-white"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="Resizer Push">
                    <div className="absolute inset-0"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-semibold">{title}</h1>
                        <nav className="text-sm text-gray-300 mt-2 flex items-center space-x-2">
                            <Link to="/" className="hover:text-white">Home</Link>
                            <span>{">"}</span>
                            <span className="text-white">{subtitle}</span>
                            <span className="text-white">{just}</span>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    const categories = [
        'All Jobs',
        'Sales Rep',
        'Software Dev',
        'Marketing',
        'Customer Service',
        'Finance'
    ];

    const jobs = [
        {
            id: 1,
            title: 'Engineering Manager',
            description: 'We are looking for an experienced engineering manager to join our team',
            type: 'Remote',
            schedule: 'Fulltime',
            category: 'Software Dev'
        },
        {
            id: 2,
            title: 'Engineering Manager',
            description: 'We are looking for an experienced engineering manager to join our team',
            type: 'Remote',
            schedule: 'Fulltime',
            category: 'Software Dev'
        },
        {
            id: 3,
            title: 'Engineering Manager',
            description: 'We are looking for an experienced engineering manager to join our team',
            type: 'Remote',
            schedule: 'Fulltime',
            category: 'Software Dev'
        },
        {
            id: 4,
            title: 'Engineering Manager',
            description: 'We are looking for an experienced engineering manager to join our team',
            type: 'Remote',
            schedule: 'Fulltime',
            category: 'Software Dev'
        },
        {
            id: 5,
            title: 'Engineering Manager',
            description: 'We are looking for an experienced engineering manager to join our team',
            type: 'Remote',
            schedule: 'Fulltime',
            category: 'Software Dev'
        }
    ];

    const filteredJobs = jobs.filter(job => {
        if (activeCategory !== 'All Jobs' && job.category !== activeCategory) {
            return false;
        }

        if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    return (
        <>
            <Breadcrumb
                title="All Jobs"
                subtitle="All Jobs"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744158706/AoStyle/image_i6goh8.jpg"
            />
            <div className="Resizer section px-4">
                <div className="mb-8">
                    <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
                        We're Hiring
                    </div>

                    <h1 className="text-3xl font-meduim mb-4">
                        Join Our Mission to Revolutionize the Fashion Industry
                    </h1>

                    <p className="text-gray-600 mb-6">
                        We are looking for passionate people to join us on our mission. We value good
                        works, clear communications, and responsibilities.
                    </p>

                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Job Role"
                            className="w-full py-3 pl-10 pr-4 bg-purple-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <div className="flex overflow-x-auto">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${activeCategory === category
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="text-sm text-gray-600 mb-4">
                        All Jobs ({filteredJobs.length})
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="border-t pt-6 pb-6">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-meduim">{job.title}</h2>
                                <a
                                    href="#"
                                    className="flex items-center text-purple-600 hover:text-purple-800"
                                >
                                    <span className="mr-1">Apply Now</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            </div>

                            <p className="text-gray-600 mb-4">{job.description}</p>

                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                    {job.type}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                    {job.schedule}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ShippingInfo />
        </>
    );
}
