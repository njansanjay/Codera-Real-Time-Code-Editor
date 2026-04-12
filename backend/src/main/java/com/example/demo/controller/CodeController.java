package com.example.demo.controller;

import com.example.demo.model.CodeMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;

@Controller
public class CodeController {

    private final SimpMessagingTemplate messagingTemplate;

    // store users per room
    private final Map<String, Set<String>> roomUsers = new HashMap<>();

    public CodeController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // REAL-TIME CODE
    @MessageMapping("/code")
    public void sendCode(CodeMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/code/" + message.getRoomId(),
                message
        );
    }

    // USER JOIN
    @MessageMapping("/join")
    public void join(CodeMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = message.getRoomId();
        String sessionId = headerAccessor.getSessionId();

        roomUsers.putIfAbsent(roomId, new HashSet<>());
        roomUsers.get(roomId).add(sessionId);

        messagingTemplate.convertAndSend(
                "/topic/users/" + roomId,
                roomUsers.get(roomId).size()
        );
    }

    // TYPING
    @MessageMapping("/typing")
    public void typing(CodeMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/typing/" + message.getRoomId(),
                "TYPING"
        );
    }

    // 🔥 DISCONNECT (MUST BE INSIDE CLASS)
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        for (String roomId : roomUsers.keySet()) {
            Set<String> users = roomUsers.get(roomId);

            if (users.remove(sessionId)) {
                messagingTemplate.convertAndSend(
                        "/topic/users/" + roomId,
                        users.size()
                );
            }
        }
    }
}