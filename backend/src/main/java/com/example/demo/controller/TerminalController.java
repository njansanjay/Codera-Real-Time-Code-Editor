package com.example.demo.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.io.*;

@Controller
public class TerminalController {

    private final SimpMessagingTemplate messagingTemplate;

    private Process process;
    private BufferedWriter writer;

    public TerminalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

@MessageMapping("/terminal/start")
public void startTerminal() {
    try {

        // kill old process if exists
        if (process != null) {
            process.destroy();
        }

        ProcessBuilder builder = new ProcessBuilder("python", "-u", "temp.py");
        builder.redirectErrorStream(true);

        process = builder.start();

        writer = new BufferedWriter(
                new OutputStreamWriter(process.getOutputStream())
        );

        InputStream inputStream = process.getInputStream();

        new Thread(() -> {
            try {
                int ch;
                StringBuilder output = new StringBuilder();

                while ((ch = inputStream.read()) != -1) {
                    output.append((char) ch);

                    // send character immediately
                    messagingTemplate.convertAndSend("/topic/terminal", output.toString());
                    output.setLength(0);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

    } catch (Exception e) {
        e.printStackTrace();
    }
}

    // 🔥 RECEIVE USER INPUT
    @MessageMapping("/terminal/input")
    public void sendInput(String input) {
        try {
            if (writer != null) {
                writer.write(input);
                writer.newLine(); 
                writer.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}