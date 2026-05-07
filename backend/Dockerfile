FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

ENV MAVEN_OPTS="-Xms256m -Xmx768m -XX:+UseG1GC -Djava.awt.headless=true"
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY src ./src
RUN ./mvnw -q clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.awt.headless=true"

# Install PostgreSQL client only when needed at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar /app/backend.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:-} -Dserver.port=${PORT:-8080} -jar /app/backend.jar"]
