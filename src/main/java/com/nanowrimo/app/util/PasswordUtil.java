package com.nanowrimo.app.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {

    private static final String PEPPER = "NanaLola_Cozy_Secret_2026";

    public static String hashPassword(String password) {
        try {
            byte[] salt = new byte[16];
            new SecureRandom().nextBytes(salt);
            String saltStr = Base64.getEncoder().encodeToString(salt);

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(saltStr.getBytes(StandardCharsets.UTF_8));
            md.update(PEPPER.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(password.getBytes(StandardCharsets.UTF_8));
            String hashStr = Base64.getEncoder().encodeToString(hashed);

            return saltStr + ":" + hashStr;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash de senha", e);
        }
    }

    public static boolean checkPassword(String plainPassword, String storedHash) {
        if (storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        try {
            String[] parts = storedHash.split(":", 2);
            String saltStr = parts[0];
            String expectedHash = parts[1];

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(saltStr.getBytes(StandardCharsets.UTF_8));
            md.update(PEPPER.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            String actualHash = Base64.getEncoder().encodeToString(hashed);

            return actualHash.equals(expectedHash);
        } catch (Exception e) {
            return false;
        }
    }
}
