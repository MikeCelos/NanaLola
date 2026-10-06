package com.nanowrimo.app.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_URL:#{null}}")
    private String springDatasourceUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:#{null}}")
    private String springDatasourceUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:#{null}}")
    private String springDatasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. Se DATABASE_URL estiver configurada (formato padrão do Render / Supabase / Neon)
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            try {
                if (databaseUrl.startsWith("jdbc:")) {
                    config.setJdbcUrl(databaseUrl);
                    if (springDatasourceUsername != null) config.setUsername(springDatasourceUsername);
                    if (springDatasourcePassword != null) config.setPassword(springDatasourcePassword);
                } else {
                    URI dbUri = new URI(databaseUrl);
                    String userInfo = dbUri.getUserInfo();
                    String username = null;
                    String password = null;
                    if (userInfo != null) {
                        String[] parts = userInfo.split(":", 2);
                        username = parts[0];
                        if (parts.length > 1) {
                            password = parts[1];
                        }
                    }
                    int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
                    String path = dbUri.getPath();
                    String query = dbUri.getQuery() != null ? "?" + dbUri.getQuery() : "";
                    String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + path + query;

                    config.setJdbcUrl(jdbcUrl);
                    config.setDriverClassName("org.postgresql.Driver");
                    if (username != null) config.setUsername(username);
                    if (password != null) config.setPassword(password);
                }
                config.setMaximumPoolSize(5);
                return new HikariDataSource(config);
            } catch (Exception e) {
                System.err.println("Aviso: Falha ao interpretar DATABASE_URL, a usar configuração padrão: " + e.getMessage());
            }
        }

        // 2. Variáveis Spring individuais (SPRING_DATASOURCE_URL, etc.)
        if (springDatasourceUrl != null && !springDatasourceUrl.isBlank()) {
            config.setJdbcUrl(springDatasourceUrl);
            if (springDatasourceUrl.contains(":h2:")) {
                config.setDriverClassName("org.h2.Driver");
            } else if (springDatasourceUrl.contains(":postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
            if (springDatasourceUsername != null) config.setUsername(springDatasourceUsername);
            if (springDatasourcePassword != null) config.setPassword(springDatasourcePassword);
            config.setMaximumPoolSize(5);
            return new HikariDataSource(config);
        }

        // 3. Fallback Local H2 persistente
        config.setJdbcUrl("jdbc:h2:file:./data/nanowrimo_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE");
        config.setDriverClassName("org.h2.Driver");
        config.setUsername("sa");
        config.setPassword("");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }
}
