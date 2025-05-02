import { useEffect, useRef, useState } from "react";
import { FaSearch, FaPaperPlane, FaPlus, FaFile, FaImage, FaMapMarkerAlt, FaBars, FaSmile, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";

const conversations = [
    { id: 1, name: "Hamzat Adeleke", message: "Hi, I want to make enquiries about...", time: "12:55 am", unread: 2, avatar: "https://i.pravatar.cc/40?img=1" },
    { id: 2, name: "Janet Adebayo", message: "Can I get more details about the product?", time: "1:10 am", unread: 1, avatar: "https://i.pravatar.cc/40?img=2" },
    { id: 3, name: "Kunle Adekunle", message: "Is there a discount available?", time: "12:40 am", unread: 3, avatar: "https://i.pravatar.cc/40?img=3" },
    { id: 4, name: "Daniel Johnson", message: "I need to return my order. Help?", time: "11:30 pm", unread: 0, avatar: "https://i.pravatar.cc/40?img=4" },
    { id: 5, name: "Sophia Williams", message: "Do you deliver outside Lagos?", time: "10:15 pm", unread: 1, avatar: "https://i.pravatar.cc/40?img=5" },
    { id: 6, name: "Emeka Okonkwo", message: "What’s the estimated delivery time?", time: "9:50 pm", unread: 0, avatar: "https://i.pravatar.cc/40?img=6" },
    { id: 7, name: "Fatima Bello", message: "Can I pay on delivery?", time: "8:30 pm", unread: 2, avatar: "https://i.pravatar.cc/40?img=7" },
    { id: 8, name: "Richard Adams", message: "I want to bulk order, can we discuss?", time: "7:45 pm", unread: 1, avatar: "https://i.pravatar.cc/40?img=8" }
];

const messages = [
    { id: 1, sender: "Hamzat Adeleke", text: "I have other gowns that can work for the color you've selected", time: "12:55 am", type: "received" },
    { id: 2, sender: "You", text: "Alright, can I get a link to those ones?", time: "12:57 am", type: "sent" },
    { id: 3, sender: "You", text: "Include any other accessory that might work with it as well", time: "12:57 am", type: "sent" },
    { id: 4, sender: "Jane Doe", text: "Ok, I’ll do that, give me a bit.", time: "12:58 am", type: "received" },
    { id: 5, sender: "Jane Doe", text: "I just sent you the links now.", time: "1:00 am", type: "received" },
    { id: 6, sender: "You", text: "Got them, thanks! Do you have them in size 10?", time: "1:02 am", type: "sent" },
    { id: 7, sender: "Jane Doe", text: "Yes, but only in red and blue.", time: "1:05 am", type: "received" },
    { id: 8, sender: "You", text: "I’ll take the blue one then.", time: "1:07 am", type: "sent" },
    { id: 9, sender: "Jane Doe", text: "Great choice! Would you like to add matching shoes?", time: "1:10 am", type: "received" },
    { id: 10, sender: "You", text: "Yes, what do you have?", time: "1:12 am", type: "sent" },
    { id: 11, sender: "Jane Doe", text: "I have some options in stock, I’ll send them now.", time: "1:15 am", type: "received" },
    { id: 12, sender: "Jane Doe", text: "Here are three pairs that would match perfectly.", time: "1:16 am", type: "received" },
    { id: 13, sender: "You", text: "I love the second pair! Let’s add that to my order.", time: "1:18 am", type: "sent" },
    { id: 14, sender: "Jane Doe", text: "Perfect! I’ll process it now.", time: "1:20 am", type: "received" }
];

export default function InboxPage() {
    const [selectedChat, setSelectedChat] = useState(conversations[0]);
    const [messageList, setMessageList] = useState(messages);
    const [newMessage, setNewMessage] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const dropdownRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const newMsg = {
            id: messageList.length + 1,
            sender: "You",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: "sent",
        };
        setMessageList([...messageList, newMsg]);
        setNewMessage("");
    };

    return (
        <>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Inbox</h1>
                <p className="text-gray-500">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Inbox
                </p>
            </div>
            <div className="flex h-screen bg-gray-100 overflow-x-hidden">
                <div className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 p-4 h-full w-56 transition-transform duration-300 md:relative md:w-1/3 ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        <button className="md:hidden text-gray-500" onClick={() => setShowSidebar(false)}>
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3 top-4 text-gray-400" size={14} />
                        <input type="text" placeholder="Search" className="w-full py-3 pl-10 pr-3 border border-gray-200 rounded-md outline-none text-sm" />
                    </div>
                    <div className="space-y-3 overflow-auto h-[calc(100vh-150px)]">
                        {conversations.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center p-2 rounded-lg cursor-pointer transition ${selectedChat.id === chat.id ? "bg-purple-100" : "hover:bg-gray-100"}`}
                                onClick={() => {
                                    setSelectedChat(chat);
                                    setShowSidebar(false);
                                }}
                            >
                                <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-full mr-2" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium truncate">{chat.name}</h4>
                                        <span className="text-xs text-gray-500">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-white h-screen">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center">
                            <button className="md:hidden text-gray-500 mr-2" onClick={() => setShowSidebar(true)}>
                                <FaBars size={18} />
                            </button>
                            <img src={selectedChat.avatar} alt={selectedChat.name} className="w-8 h-8 rounded-full mr-2" />
                            <div>
                                <h4 className="text-sm font-medium">{selectedChat.name}</h4>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>
                        <button className="text-xs text-purple-500">View Profile</button>
                    </div>

                    <div className="flex-1 p-3 overflow-auto space-y-3">
                        {messageList.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                                <div className={`px-3 py-2 rounded-lg max-w-[70%] ${msg.type === "sent" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <span className="block text-xs text-right mt-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-gray-200 flex flex-col xs:flex-row items-center relative gap-2">
                        <div className="flex items-center w-full">
                            <button onClick={() => setShowOptions(!showOptions)} className="p-2 bg-gray-200 rounded-full">
                                <FaPlus className="text-gray-500" size={16} />
                            </button>

                            {showOptions && (
                                <div className="absolute bottom-20 xs:bottom-14 left-2 w-36 bg-white shadow-sm rounded-lg p-2 space-y-1 z-10">
                                    <button className="flex items-center w-full px-2 py-1 text-xs text-gray-700 hover:bg-gray-100">
                                        <FaFile className="mr-2 text-blue-500" size={14} /> Attach File
                                    </button>
                                    <button className="flex items-center w-full px-2 py-1 text-xs text-gray-700 hover:bg-gray-100">
                                        <FaImage className="mr-2 text-green-500" size={14} /> Send Image
                                    </button>
                                    <button className="flex items-center w-full px-2 py-1 text-xs text-gray-700 hover:bg-gray-100">
                                        <FaMapMarkerAlt className="mr-2 text-red-500" size={14} /> Share Location
                                    </button>
                                </div>
                            )}

                            <input type="text" placeholder="Your message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 mx-2 py-3 px-3 border border-gray-200 rounded-md outline-none text-sm" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2">
                                <FaSmile className="text-gray-500" size={20} />
                            </button>

                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} className="absolute bottom-20 xs:bottom-14 right-2 bg-white shadow-lg rounded-lg z-10">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} width={250} height={350} />
                                </div>
                            )}
                            <button onClick={sendMessage} className="bg-purple-500 text-white px-3 py-3 rounded-lg">
                                <FaPaperPlane size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}