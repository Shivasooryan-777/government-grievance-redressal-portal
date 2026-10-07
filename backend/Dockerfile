# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Layer caching: fetch dependencies first
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Package application without running tests
COPY src ./src
RUN mvn -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create and switch to non-root user
RUN groupadd -r appuser && useradd -r -g appuser -u 1001 appuser

# Copy executable jar from build stage
COPY --from=build --chown=appuser:appuser /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75 -Dserver.port=${PORT:-8080} -jar app.jar"]
