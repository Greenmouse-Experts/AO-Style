import CaryBinApi from "../../CarybinBaseUrl";

const subscribeNewsletter = (email) => {
  console.log("NewsletterService.subscribeNewsletter - Email:", email);
  return CaryBinApi.post("/contact/subscribe-newsletter", { email })
    .then(response => {
      console.log("NewsletterService.subscribeNewsletter - Response:", response);
      return response;
    })
    .catch(error => {
      console.error("NewsletterService.subscribeNewsletter - Error:", error);
      throw error;
    });
};

const NewsletterService = {
  subscribeNewsletter,
};

export default NewsletterService;
