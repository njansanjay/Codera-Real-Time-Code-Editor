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

    // 🔥 START TERMINAL
    @MessageMapping("/terminal/start")
    public void startTerminal() {
        try {
            ProcessBuilder builder = new ProcessBuilder("cmd");
            builder.redirectErrorStream(true); // merge stdout + stderr
            process = builder.start();

            writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream())
            );

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            // SINGLE thread → read output
            new Thread(() -> {
                try {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        messagingTemplate.convertAndSend("/topic/terminal", line);
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
                writer.write(input + "\n");
                writer.newLine(); // important
                writer.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}