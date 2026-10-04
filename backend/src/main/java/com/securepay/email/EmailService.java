package com.securepay.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${mail.smtp.host:localhost}")
    private String smtpHost;

    @Value("${mail.smtp.port:1025}")
    private int smtpPort;

    @Value("${mail.smtp.from:no-reply@securepay.local}")
    private String fromAddress;

    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetToken) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
        String subject = "SecurePay — Password Reset Request";

        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Valued Customer";

        String textBody = "Hello " + name + ",\n\n"
                + "We received a request to reset the password for your SecurePay account.\n\n"
                + "To set a new password, click the link below or paste it into your browser:\n"
                + resetUrl + "\n\n"
                + "This link is valid for 15 minutes and can only be used once.\n\n"
                + "If you did not request a password reset, please ignore this email or contact support immediately.\n\n"
                + "Regards,\n"
                + "SecurePay Security Team\n";

        sendEmail(recipientEmail, subject, textBody);
    }

    public void sendEmail(String toEmail, String subject, String body) {
        log.info("Sending email via SMTP {}:{} to {}", smtpHost, smtpPort, toEmail);

        try (Socket socket = new Socket(smtpHost, smtpPort);
             BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
             BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8))) {

            readResponse(reader, "220");
            sendCommand(writer, "HELO localhost");
            readResponse(reader, "250");
            sendCommand(writer, "MAIL FROM:<" + fromAddress + ">");
            readResponse(reader, "250");
            sendCommand(writer, "RCPT TO:<" + toEmail + ">");
            readResponse(reader, "250");
            sendCommand(writer, "DATA");
            readResponse(reader, "354");

            // Email headers & body
            writer.write("From: SecurePay <" + fromAddress + ">\r\n");
            writer.write("To: <" + toEmail + ">\r\n");
            writer.write("Subject: " + subject + "\r\n");
            writer.write("Content-Type: text/plain; charset=UTF-8\r\n");
            writer.write("\r\n");
            writer.write(body);
            writer.write("\r\n.\r\n");
            writer.flush();
            readResponse(reader, "250");

            sendCommand(writer, "QUIT");
            log.info("Email delivered successfully to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to deliver email to {} via SMTP {}:{}: {}", toEmail, smtpHost, smtpPort, e.getMessage());
            throw new IllegalStateException("Failed to deliver email via mail server: " + e.getMessage(), e);
        }
    }

    private void sendCommand(BufferedWriter writer, String command) throws IOException {
        writer.write(command + "\r\n");
        writer.flush();
    }

    private void readResponse(BufferedReader reader, String expectedPrefix) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            log.debug("SMTP << {}", line);
            if (line.length() >= 4 && line.charAt(3) == '-') {
                // Continuation line in multi-line reply
                continue;
            }
            if (!line.startsWith(expectedPrefix)) {
                throw new IOException("Unexpected SMTP response: " + line + " (expected prefix " + expectedPrefix + ")");
            }
            break;
        }
    }
}
