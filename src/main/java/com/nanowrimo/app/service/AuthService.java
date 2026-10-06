package com.nanowrimo.app.service;

import com.nanowrimo.app.dto.*;
import com.nanowrimo.app.model.*;
import com.nanowrimo.app.repository.*;
import com.nanowrimo.app.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final ProjectRepository projectRepository;
    private final GoalRepository goalRepository;
    private final WritingSessionRepository writingSessionRepository;

    public AuthService(UserRepository userRepository,
                       UserSessionRepository sessionRepository,
                       ProjectRepository projectRepository,
                       GoalRepository goalRepository,
                       WritingSessionRepository writingSessionRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.projectRepository = projectRepository;
        this.goalRepository = goalRepository;
        this.writingSessionRepository = writingSessionRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().length() < 3) {
            throw new IllegalArgumentException("O nome de utilizador deve ter pelo menos 3 caracteres.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 4) {
            throw new IllegalArgumentException("A palavra-passe deve ter pelo menos 4 caracteres.");
        }

        String username = req.getUsername().trim().toLowerCase();
        String email = req.getEmail() != null && !req.getEmail().isBlank() 
                ? req.getEmail().trim().toLowerCase() 
                : username + "@nanalola.local";

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Este nome de utilizador já está a ser utilizado.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Este email já está registado.");
        }

        String passwordHash = PasswordUtil.hashPassword(req.getPassword());
        User user = new User(username, email, passwordHash, req.getDisplayName());
        user = userRepository.save(user);

        // Criar um livro inicial acolhedor no NanaLola para o novo autor
        createInitialStarterProject(user);

        String token = createSessionToken(user);
        return new AuthResponse(token, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String input = req.getUsernameOrEmail() != null ? req.getUsernameOrEmail().trim().toLowerCase() : "";
        User user = userRepository.findByUsernameOrEmail(input, input)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador ou email não encontrado."));

        if (!PasswordUtil.checkPassword(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Palavra-passe incorreta.");
        }

        String token = createSessionToken(user);
        return new AuthResponse(token, user);
    }

    public User getUserByToken(String token) {
        if (token == null || token.isBlank()) return null;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        return sessionRepository.findByToken(token)
                .filter(s -> s.getExpiresAt() == null || s.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(UserSession::getUser)
                .orElse(null);
    }

    public UserProfileDto getUserProfile(User user) {
        Long userId = user.getId();
        Long totalWords = writingSessionRepository.getTotalWordsByUserId(userId);
        long totalProjects = projectRepository.countByUserId(userId);
        long completedGoals = goalRepository.countArchivedGoalsByUserId(userId);

        // Calcular melhor dia de escrita de sempre
        List<WritingSession> sessions = writingSessionRepository.findAllByUserId(userId);
        Map<LocalDate, Integer> dailyMap = new HashMap<>();
        int bestDay = 0;
        for (WritingSession s : sessions) {
            int w = s.getWordsAdded() != null ? s.getWordsAdded() : 0;
            dailyMap.put(s.getSessionDate(), dailyMap.getOrDefault(s.getSessionDate(), 0) + w);
        }
        for (int words : dailyMap.values()) {
            if (words > bestDay) bestDay = words;
        }

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setBio(user.getBio());
        dto.setTotalWordsAllProjects(totalWords != null ? totalWords : 0L);
        dto.setBestDayWordsRecord(bestDay);
        dto.setTotalProjectsCount((int) totalProjects);
        dto.setCompletedGoalsCount((int) completedGoals);

        return dto;
    }

    @Transactional
    public User updateProfile(User user, ProfileUpdateRequest req) {
        if (req.getDisplayName() != null && !req.getDisplayName().isBlank()) {
            user.setDisplayName(req.getDisplayName().trim());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl().trim());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio().trim());
        }
        return userRepository.save(user);
    }

    private String createSessionToken(User user) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(90);
        UserSession session = new UserSession(token, user, expiresAt);
        sessionRepository.save(session);
        return token;
    }

    private void createInitialStarterProject(User user) {
        Project starter = new Project(user, "O Meu Primeiro Romance", "", "Ficção Acolhedora", "Crónicas do Café", "Uma história escrita com dedicação e café.");
        starter = projectRepository.save(starter);

        int year = LocalDate.now().getYear();
        Goal starterGoal = new Goal(
                starter,
                "NaNoWriMo " + year,
                GoalType.WRITING,
                GoalUnit.WORDS,
                50000,
                LocalDate.of(year, 11, 1),
                LocalDate.of(year, 11, 30)
        );
        goalRepository.save(starterGoal);
    }
}
