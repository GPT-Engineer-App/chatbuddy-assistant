import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, PaperclipIcon, Image as ImageIcon } from "lucide-react";
import { sendMessage, uploadFile, accessUrl, createTextFile, sendEmail } from '../services/api';

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage([...messages, newMessage]);
      if (response && response.content) {
        setMessages(prevMessages => [...prevMessages, response]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error calling ChatGPT4o API:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadFile(file);
        const newMessage = { role: 'user', content: `Uploaded file: ${file.name}` };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleSpecialCommands = async (command) => {
    if (command.startsWith('/url ')) {
      const url = command.slice(5);
      try {
        const data = await accessUrl(url);
        const newMessage = { role: 'assistant', content: `Content from ${url}: ${JSON.stringify(data)}` };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      } catch (error) {
        console.error('Error accessing URL:', error);
      }
    } else if (command.startsWith('/createfile ')) {
      const [, filename, ...contentArr] = command.split(' ');
      const content = contentArr.join(' ');
      createTextFile(content, filename);
      const newMessage = { role: 'assistant', content: `File ${filename} created and downloaded.` };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } else if (command.startsWith('/email ')) {
      const [, to, subject, ...bodyArr] = command.split(' ');
      const body = bodyArr.join(' ');
      try {
        await sendEmail(to, subject, body);
        const newMessage = { role: 'assistant', content: `Email sent to ${to}` };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => document.getElementById('file-upload').click()}>
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
          <Button variant="outline" size="icon" onClick={() => document.getElementById('image-upload').click()}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.startsWith('/')) {
                  handleSpecialCommands(input);
                } else {
                  handleSend();
                }
              }
            }}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
