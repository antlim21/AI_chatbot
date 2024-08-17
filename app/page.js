"use client";
import { Box, Stack, Button, TextField, Typography, Paper, Avatar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

const AlignedList = ({ ordered, children, ...props }) => {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      style={{
        paddingLeft: "20px",
        listStylePosition: "outside",
        listStyleType: ordered ? "decimal" : "disc",
      }}
      {...props}
    >
      {children}
    </ListTag>
  );
};

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi I'm the CodeHire Support Agent, how can I assist you today?`,
    },
  ]);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ];
    setMessages(newMessages);
    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessages),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((prevMessages) => {
        let lastMessage = prevMessages[prevMessages.length - 1];
        let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f0f2f5",
        fontFamily: "inherit",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "90%",
          maxWidth: "800px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ p: 2, bgcolor: "primary.main", color: "white" }}
        >
          CodeHire Support Chat
        </Typography>
        <Stack
          direction="column"
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2,
          }}
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
                mb={1}
              >
                {message.role === "assistant" && (
                  <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                    <SupportAgentIcon />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    bgcolor:
                      message.role === "assistant"
                        ? "primary.light"
                        : "secondary.light",
                    borderRadius:
                      message.role === "assistant"
                        ? "20px 20px 20px 5px"
                        : "20px 20px 5px 20px",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      ol: (props) => <AlignedList ordered {...props} />,
                      ul: (props) => <AlignedList {...props} />,
                      li: ({ children, ...props }) => (
                        <li {...props}>{children}</li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Paper>
                {message.role === "user" && (
                  <Avatar sx={{ bgcolor: "secondary.main", ml: 1 }}>
                    <PersonIcon />
                  </Avatar>
                )}
              </Box>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Box sx={{ p: 2, bgcolor: "background.paper" }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Type your message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              endIcon={<SendIcon />}
              sx={{ minWidth: "120px" }}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}