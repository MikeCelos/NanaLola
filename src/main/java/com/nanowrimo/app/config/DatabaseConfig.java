package com.nanowrimo.app.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_URL:#{null}}")
    private String springDatasourceUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:#{null}}")
    private String springDatasourceUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:#{null}}")
    private String springDatasourcePassword;

    private static volatile boolean persistentDatabaseActive = false;
    private static volatile String activeDatabaseType = "H2 (Local/Ephemeral)";
    private static volatile String activeDatabaseHost = "local-file";

    public static boolean isPersistentDatabaseActive() {
        return persistentDatabaseActive;
    }

    public static String getActiveDatabaseType() {
        return activeDatabaseType;
    }

    public static String getActiveDatabaseHost() {
        return activeDatabaseHost;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. Resolve raw URL from properties or system environment
        String rawUrl = databaseUrl;
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = springDatasourceUrl;
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        // If PostgreSQL or external database URL is configured
        if (rawUrl != null && !rawUrl.isBlank() && !rawUrl.contains(":h2:")) {
            try {
                HikariConfig config = buildPostgresConfig(rawUrl, springDatasourceUsername, springDatasourcePassword);
                HikariDataSource ds = new HikariDataSource(config);

                persistentDatabaseActive = true;
                activeDatabaseType = "PostgreSQL (Cloud Persistent)";

                String cleanJdbc = config.getJdbcUrl();
                String sanitized = cleanJdbc.replaceAll("password=[^&]*", "password=***");

                System.out.println("================================================================================");
                System.out.println(">>> [NANALOLA] PERSISTENT POSTGRESQL DATABASE CONNECTED!                      <<<");
                System.out.println(">>> Target: " + sanitized);
                System.out.println(">>> Persistence: ENABLED (All user accounts, novels, and data are permanent) <<<");
                System.out.println("================================================================================");
                log.info("Successfully connected to persistent PostgreSQL at {}", sanitized);
                return ds;
            } catch (Exception e) {
                System.err.println("================================================================================");
                System.err.println(">>> [NANALOLA ERROR] FAILED TO CONNECT TO CONFIGURED POSTGRESQL!              <<<");
                System.err.println(">>> Error: " + e.getMessage());
                System.err.println(">>> Please verify your DATABASE_URL in Render Environment settings!            <<<");
                System.err.println("================================================================================");
                log.error("Failed to initialize PostgreSQL DataSource: {}", e.getMessage(), e);
            }
        }

        // 2. Fallback to Local H2 (Ephemeral on Render)
        persistentDatabaseActive = false;
        activeDatabaseType = "H2 (Local - Ephemeral on Render)";
        activeDatabaseHost = "local-file";

        System.out.println("================================================================================");
        System.out.println(">>> [NANALOLA WARNING] RUNNING ON LOCAL H2 DATABASE (EPHEMERAL)!               <<<");
        System.out.println(">>> NOTICE: On Render free tier, containers restart and disk is wiped!        <<<");
        System.out.println(">>> Any accounts created will be LOST when Render redeploys or spins down!    <<<");
        System.out.println(">>> TO KEEP ACCOUNTS PERMANENT FOR FREE:                                       <<<");
        System.out.println(">>> 1. Create a free PostgreSQL on Neon.tech or Supabase.com                   <<<");
        System.out.println(">>> 2. Add 'DATABASE_URL' in Render Dashboard -> Environment settings.        <<<");
        System.out.println("================================================================================");
        log.warn("Running on local H2 database. Data will not survive Render container restarts.");

        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:file:./data/nanowrimo_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(5);
        return new HikariDataSource(h2Config);
    }

    public static HikariConfig buildPostgresConfig(String rawUrl, String defaultUser, String defaultPassword) {
        HikariConfig config = new HikariConfig();
        String url = rawUrl.trim();

        if (url.startsWith("jdbc:postgresql:")) {
            // Already a JDBC PostgreSQL URL
            if (!url.contains("sslmode=") && !url.contains("localhost") && !url.contains("127.0.0.1")) {
                url = url.contains("?") ? url + "&sslmode=require" : url + "?sslmode=require";
            }
            config.setJdbcUrl(url);
            config.setDriverClassName("org.postgresql.Driver");

            String user = defaultUser != null && !defaultUser.isBlank() ? defaultUser : System.getenv("SPRING_DATASOURCE_USERNAME");
            String pass = defaultPassword != null && !defaultPassword.isBlank() ? defaultPassword : System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (user != null) config.setUsername(user);
            if (pass != null) config.setPassword(pass);
        } else if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            // Cloud URI format: postgresql://[user[:pass]@]host[:port]/[database][?query]
            String withoutScheme = url.substring(url.indexOf("://") + 3);
            int slashIdx = withoutScheme.indexOf('/');
            String authPart = "";
            String hostAndRest = withoutScheme;

            // Find credentials part before '@'
            int atIdx = withoutScheme.lastIndexOf('@', slashIdx != -1 ? slashIdx : withoutScheme.length());
            if (atIdx != -1) {
                authPart = withoutScheme.substring(0, atIdx);
                hostAndRest = withoutScheme.substring(atIdx + 1);
            }

            String username = null;
            String password = null;
            if (!authPart.isEmpty()) {
                int colonIdx = authPart.indexOf(':');
                if (colonIdx != -1) {
                    username = URLDecoder.decode(authPart.substring(0, colonIdx), StandardCharsets.UTF_8);
                    password = URLDecoder.decode(authPart.substring(colonIdx + 1), StandardCharsets.UTF_8);
                } else {
                    username = URLDecoder.decode(authPart, StandardCharsets.UTF_8);
                }
            }

            // Extract host/port vs database/query
            String hostAndPort = hostAndRest;
            String dbAndQuery = "";
            int slash = hostAndRest.indexOf('/');
            if (slash != -1) {
                hostAndPort = hostAndRest.substring(0, slash);
                dbAndQuery = hostAndRest.substring(slash);
            }

            activeDatabaseHost = hostAndPort;

            String dbName = dbAndQuery;
            String query = "";
            int qIdx = dbAndQuery.indexOf('?');
            if (qIdx != -1) {
                dbName = dbAndQuery.substring(0, qIdx);
                query = dbAndQuery.substring(qIdx + 1);
            }

            if (dbName.isEmpty()) {
                dbName = "/postgres";
            }

            // Cloud databases (Supabase / Neon / AWS) require SSL
            if (!query.contains("sslmode=") && !hostAndPort.contains("localhost") && !hostAndPort.contains("127.0.0.1")) {
                query = query.isEmpty() ? "sslmode=require" : query + "&sslmode=require";
            }

            String finalJdbcUrl = "jdbc:postgresql://" + hostAndPort + dbName + (query.isEmpty() ? "" : "?" + query);
            config.setJdbcUrl(finalJdbcUrl);
            config.setDriverClassName("org.postgresql.Driver");

            if (username != null) config.setUsername(username);
            if (password != null) config.setPassword(password);
        } else {
            config.setJdbcUrl(url);
            if (url.contains(":postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
            if (defaultUser != null) config.setUsername(defaultUser);
            if (defaultPassword != null) config.setPassword(defaultPassword);
        }

        // Resilient connection pool settings for cloud / serverless databases
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000); // 5 min
        config.setMaxLifetime(600000); // 10 min
        config.setConnectionTimeout(30000); // 30 sec
        return config;
    }
}
