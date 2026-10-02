package com.college.grievanceportal.config;

import com.college.grievanceportal.model.entity.Department;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Role;
import com.college.grievanceportal.repository.DepartmentRepository;
import com.college.grievanceportal.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Startup data seeder responsible for ensuring required departments and default
 * departmental Grievance Redressal Officer (GRO) accounts exist in the database.
 * Operates strictly idempotently and non-destructively: creates missing rows only,
 * never modifying, overwriting, or deleting existing records.
 */
@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String groDefaultPassword;

    /**
     * Constructs the DataSeeder with required dependencies and configured default GRO password.
     *
     * @param departmentRepository repository for department operations
     * @param userRepository       repository for user operations
     * @param passwordEncoder      encoder used to hash the GRO default password
     * @param groDefaultPassword   the default password read from environment / properties
     */
    public DataSeeder(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seeder.gro-default-password:${GRO_DEFAULT_PASSWORD:GroPassword123!}}") String groDefaultPassword) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.groDefaultPassword = groDefaultPassword;
    }

    /**
     * Definition record holding seed parameters for a department and its corresponding GRO user.
     */
    private record DepartmentSeed(
            String name,
            String code,
            String description,
            String groEmail,
            String groName,
            String groPhone
    ) {}

    /**
     * Core seed specification for the 5 mandated departments and deterministic GRO accounts.
     */
    private static final List<DepartmentSeed> SEED_DATA = List.of(
            new DepartmentSeed(
                    "Water Supply & Sanitation",
                    "WATER",
                    "Water supply, pipelines, drainage, and sanitation services",
                    "water.gro@grievanceportal.local",
                    "Water Supply GRO",
                    "9876500001"
            ),
            new DepartmentSeed(
                    "Electricity",
                    "ELECTRICITY",
                    "Power distribution, streetlights, and electrical infrastructure",
                    "electricity.gro@grievanceportal.local",
                    "Electricity GRO",
                    "9876500002"
            ),
            new DepartmentSeed(
                    "Roads & Infrastructure",
                    "ROADS",
                    "Road maintenance, potholes, sidewalks, and public infrastructure",
                    "roads.gro@grievanceportal.local",
                    "Roads GRO",
                    "9876500003"
            ),
            new DepartmentSeed(
                    "Public Health & Sanitation",
                    "HEALTH",
                    "Public health, hygiene, waste management, and sanitation",
                    "health.gro@grievanceportal.local",
                    "Public Health GRO",
                    "9876500004"
            ),
            new DepartmentSeed(
                    "General Administration",
                    "GEN_ADMIN",
                    "General municipal administration and unassigned grievances",
                    "admin.gro@grievanceportal.local",
                    "General Admin GRO",
                    "9876500005"
            )
    );

    /**
     * Executes seed checks and creation upon application startup.
     *
     * @param args incoming command line arguments
     */
    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting DataSeeder verification for core departments and GRO accounts...");
        for (DepartmentSeed seed : SEED_DATA) {
            Department department = seedDepartment(seed);
            seedGroUser(seed, department);
        }
        log.info("DataSeeder verification completed.");
    }

    /**
     * Checks if a department exists by name; creates it if missing.
     *
     * @param seed the department seed configuration
     * @return the existing or newly persisted Department entity
     */
    private Department seedDepartment(DepartmentSeed seed) {
        return departmentRepository.findByName(seed.name())
                .map(existing -> {
                    log.info("Department already exists: '{}' (ID: {})", existing.getName(), existing.getId());
                    return existing;
                })
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(seed.name());
                    newDept.setCode(seed.code());
                    newDept.setDescription(seed.description());
                    Department saved = departmentRepository.save(newDept);
                    log.info("Created missing department: '{}' (Code: {}, ID: {})", saved.getName(), saved.getCode(), saved.getId());
                    return saved;
                });
    }

    /**
     * Checks if a GRO user exists by email; creates it if missing.
     *
     * @param seed       the GRO user seed configuration
     * @param department the associated department
     */
    private void seedGroUser(DepartmentSeed seed, Department department) {
        userRepository.findByEmail(seed.groEmail())
                .ifPresentOrElse(
                        existing -> log.info("GRO account already exists: '{}' (ID: {}, Role: {}, Department: '{}')",
                                existing.getEmail(),
                                existing.getId(),
                                existing.getRole(),
                                existing.getDepartment() != null ? existing.getDepartment().getName() : "None"),
                        () -> {
                            User gro = User.builder()
                                    .name(seed.groName())
                                    .email(seed.groEmail())
                                    .password(passwordEncoder.encode(groDefaultPassword))
                                    .phoneNumber(seed.groPhone())
                                    .role(Role.GRO)
                                    .department(department)
                                    .build();
                            User saved = userRepository.save(gro);
                            log.info("Created missing GRO account: '{}' for department: '{}' (ID: {})",
                                    saved.getEmail(), department.getName(), saved.getId());
                        }
                );
    }
}
