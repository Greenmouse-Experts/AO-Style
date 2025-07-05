import CaryBinApi from "../../CarybinBaseUrl";

const sendMessage = (payload) => {
  // The payload should contain: token, chatBuddy, message
  // This will be handled via Socket.IO primarily
  return CaryBinApi.post(`/chat/send-message`, payload);
};

const getMessages = (chatId) => {
  return CaryBinApi.get(`/chat/messages/${chatId}`);
};

const getChats = () => {
  return CaryBinApi.get(`/chat/conversations`);
};

const retrieveChats = (payload) => {
  return CaryBinApi.post(`/chat/retrieve-chats`, payload);
};

const retrieveMessages = (payload) => {
  return CaryBinApi.post(`/chat/retrieve-messages`, payload);
};

const MessagingService = {
  sendMessage,
  getMessages,
  getChats,
  retrieveChats,
  retrieveMessages,
};

export default MessagingService;
