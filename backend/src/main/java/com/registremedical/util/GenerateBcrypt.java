package com.registremedical.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBcrypt {
    public static void main(String[] args) {
        String plain = args != null && args.length > 0 ? args[0] : "29690600";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(plain);
        System.out.println(hash);
    }
}


