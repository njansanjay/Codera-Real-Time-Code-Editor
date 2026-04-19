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

    @PostMapping("/save")
    public void saveCode(@RequestBody CodeRequest request) {
        try {
            String fileName = "temp.py";
            FileWriter writer = new FileWriter(fileName);
            writer.write(request.getCode());
            writer.close();
        }   catch (Exception e) {
                e.printStackTrace();
        }
}

    private void writeToFile(String fileName, String code) throws IOException {
        FileWriter writer = new FileWriter(fileName);
        writer.write(code);
        writer.close();
    }

    private String executeCommand(String command, String input) throws IOException {
    ProcessBuilder builder = new ProcessBuilder(command.split(" "));
    builder.redirectErrorStream(true);

    Process process = builder.start();

    // send input
    if (input != null && !input.isEmpty()) {
        BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(process.getOutputStream())
        );
        writer.write(input);
        writer.newLine();
        writer.flush();
        writer.close();
    }

    BufferedReader reader = new BufferedReader(
            new InputStreamReader(process.getInputStream())
    );

    StringBuilder output = new StringBuilder();
    String line;

    while ((line = reader.readLine()) != null) {
        output.append(line).append("\n");
    }

    return output.toString();
}
}