export const maskEmail = (email) => {
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return email;
  }

  const maskedLocalPart = "*****" + localPart.slice(-1); 
  return `${maskedLocalPart}@${domain}`;
};