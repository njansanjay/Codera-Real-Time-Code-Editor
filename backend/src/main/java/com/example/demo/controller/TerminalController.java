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
            process = Runtime.getRuntime().exec("cmd"); // Windows terminal

            writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream())
            );

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            // 🔥 READ OUTPUT CONTINUOUSLY
            new Thread(() -> {
                try {
                    String line;
                    new Thread(() -> {
                            try {
                                InputStream is = process.getInputStream();
                                int ch;
                                StringBuilder output = new StringBuilder();

                                while ((ch = is.read()) != -1) {
                                    output.append((char) ch);

                                    if (ch == '\n') {
                                        messagingTemplate.convertAndSend("/topic/terminal", output.toString());
                                        output.setLength(0);
                                    }
                                }
                    } catch (Exception e) {
                                e.printStackTrace();
                    }
            }).start();


            new Thread(() -> {
                try {
                    InputStream es = process.getErrorStream();
                    int ch;
                    StringBuilder output = new StringBuilder();

                    while ((ch = es.read()) != -1) {
                        output.append((char) ch);

                        if (ch == '\n') {
                            messagingTemplate.convertAndSend("/topic/terminal", output.toString());
                            output.setLength(0);
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
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
                writer.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}