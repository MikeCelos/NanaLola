package com.nanowrimo.app.config;

import com.zaxxer.hikari.HikariConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DatabaseConfigTest {

    @Test
    void testNeonUrlParsing() {
        String neonUrl = "postgresql://neondb_owner:npg_SecretPass123@ep-cool-123.eu-central-1.aws.neon.tech/neondb?sslmode=require";
        HikariConfig config = DatabaseConfig.buildPostgresConfig(neonUrl, null, null);

        assertEquals("jdbc:postgresql://ep-cool-123.eu-central-1.aws.neon.tech/neondb?sslmode=require", config.getJdbcUrl());
        assertEquals("neondb_owner", config.getUsername());
        assertEquals("npg_SecretPass123", config.getPassword());
        assertEquals("org.postgresql.Driver", config.getDriverClassName());
    }

    @Test
    void testSupabaseUrlWithoutSslAppendsSsl() {
        String supabaseUrl = "postgresql://postgres:MyComplexPass@db.tmbxrvvmuwpsusrzlime.supabase.co:5432/postgres";
        HikariConfig config = DatabaseConfig.buildPostgresConfig(supabaseUrl, null, null);

        assertEquals("jdbc:postgresql://db.tmbxrvvmuwpsusrzlime.supabase.co:5432/postgres?sslmode=require", config.getJdbcUrl());
        assertEquals("postgres", config.getUsername());
        assertEquals("MyComplexPass", config.getPassword());
    }

    @Test
    void testSupabasePoolerWithSpecialChars() {
        String poolerUrl = "postgres://postgres.tmbxrvvmuwpsusrzlime:Pass%40Word%21@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
        HikariConfig config = DatabaseConfig.buildPostgresConfig(poolerUrl, null, null);

        assertEquals("jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require", config.getJdbcUrl());
        assertEquals("postgres.tmbxrvvmuwpsusrzlime", config.getUsername());
        assertEquals("Pass@Word!", config.getPassword());
    }

    @Test
    void testDirectJdbcUrl() {
        String jdbcUrl = "jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
        HikariConfig config = DatabaseConfig.buildPostgresConfig(jdbcUrl, "user1", "pass1");

        assertEquals("jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require", config.getJdbcUrl());
        assertEquals("user1", config.getUsername());
        assertEquals("pass1", config.getPassword());
    }
}
