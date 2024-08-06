import axios from 'axios';

const API_URL = 'https://api.chatgpt4o.com/v1/chat/completions';
const API_KEY = 'your-chatgpt4o-api-key-here'; // Replace with your actual API key

export const sendMessage = async (messages) => {
  try {
    const response = await axios.post(API_URL, {
      model: "gpt-4",
      messages: messages,
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error calling ChatGPT4o API:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  // TODO: Implement file upload to a server or cloud storage
  console.log('File upload not implemented yet');
};

export const accessUrl = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error accessing URL:', error);
    throw error;
  }
};

export const createTextFile = (content, filename) => {
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const sendEmail = async (to, subject, body) => {
  // TODO: Implement email sending functionality
  // This would typically be done through a backend service
  console.log('Email sending not implemented yet');
};
