package com.example.demo.controller;

import com.example.demo.model.CodeRequest;
import org.springframework.web.bind.annotation.*;

import java.io.*;

@RestController
@CrossOrigin
public class RunController {

    @PostMapping("/run")
    public String runCode(@RequestBody CodeRequest request) {
        try {

            if (request.getLanguage().equals("python")) {
                String fileName = "temp.py";
                writeToFile(fileName, request.getCode());
                return executeCommand("python " + fileName, request.getInput());
            }

            if (request.getLanguage().equals("java")) {
                String fileName = "Main.java";
                writeToFile(fileName, request.getCode());

                executeCommand("javac " + fileName, null);
                return executeCommand("java Main", request.getInput());
            }

            return "Language not supported";

        } catch (Exception e) {
            return e.getMessage();
        }
    }

    private void writeToFile(String fileName, String code) throws IOException {
        FileWriter writer = new FileWriter(fileName);
        writer.write(code);
        writer.close();
    }

    private String executeCommand(String command, String input) throws IOException {
    Process process = Runtime.getRuntime().exec(command);

    // 🔥 SEND INPUT TO PROGRAM
    if (input != null && !input.isEmpty()) {
        OutputStream os = process.getOutputStream();
        os.write((input + "\n").getBytes());
        os.flush();
        os.close();
    }

    BufferedReader reader = new BufferedReader(
            new InputStreamReader(process.getInputStream())
    );

    BufferedReader errorReader = new BufferedReader(
            new InputStreamReader(process.getErrorStream())
    );

    StringBuilder output = new StringBuilder();
    String line;

    while ((line = reader.readLine()) != null) {
        output.append(line).append("\n");
    }

    while ((line = errorReader.readLine()) != null) {
        output.append(line).append("\n");
    }

    return output.toString();
}
}