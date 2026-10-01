# ==============================================================================
# Stage 1: Builder
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Pre-cache dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy source tree and compile/package the Spring Boot application
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Runtime
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Security: Create non-root system user and group
RUN addgroup -S spring && adduser -S spring -G spring

# Copy executable jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Switch to non-root user
USER spring:spring

# Expose default backend port
EXPOSE 8080

# Container-aware JVM memory & cgroup settings
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Docker native health check using public categories endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/v1/categories || exit 1

# Launch Spring Boot with container-aware JVM flags
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
