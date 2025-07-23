import { useMutation } from "@tanstack/react-query";
import NewsletterService from "../../services/api/newsletter/index";

const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (email) => NewsletterService.subscribeNewsletter(email),
  });
};

export default useSubscribeNewsletter;
